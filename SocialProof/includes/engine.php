<?php
// ============================================================
// engine.php — Motor de execução com fila global por room
// Lógica: todos os blocos correm em paralelo mas o chat
// recebe UMA mensagem por tick, intercalando blocos diferentes.
// Respostas (reply_to_id) têm prioridade e entram rápido.
// ============================================================

require_once __DIR__ . '/config.php';

class ChatEngine {

    private static array $assignedNames = [];

    // Delay mínimo entre qualquer mensagem no chat global (segundos)
    const GLOBAL_MIN_DELAY = 8;

    // ----------------------------------------------------------------
    // tick() — chamado pelo cron. Processa todas as rooms ativas.
    // ----------------------------------------------------------------
    public static function tick(): array {
        $posted = [];
        $rooms  = DB::fetchAll("SELECT id FROM rooms WHERE status = 'active'");
        foreach ($rooms as $room) {
            $msg = self::processRoom($room['id']);
            if ($msg) $posted[] = $msg;
        }
        return $posted;
    }

    // ----------------------------------------------------------------
    // processRoom() — escolhe a próxima mensagem a postar na room
    // Sem GET_LOCK — compatível com Railway
    // ----------------------------------------------------------------
    public static function processRoom(int $roomId): ?array {
        try {
            self::startPendingBlocks($roomId);
            self::markDoneBlocks($roomId);

            $now = time();

            $lastGlobal = DB::fetch(
                'SELECT posted_at FROM room_messages WHERE room_id = ? ORDER BY posted_at DESC, id DESC LIMIT 1',
                [$roomId]
            );

            if ($lastGlobal) {
                $globalCanPostAt = strtotime($lastGlobal['posted_at']) + self::GLOBAL_MIN_DELAY;
                if ($now < $globalCanPostAt) return null;
            }

            $candidates = self::getCandidates($roomId, $now);
            if (empty($candidates)) return null;

            $chosen = self::pickBest($candidates, $roomId);
            if (!$chosen) return null;

            return self::postMessage($chosen, $roomId);

        } catch (\Exception $e) {
            return null;
        }
    }

    // ----------------------------------------------------------------
    // getCandidates() — retorna a próxima msg pronta de cada bloco
    // Otimizado: 2 queries totais independente do número de blocos
    // ----------------------------------------------------------------
    private static function getCandidates(int $roomId, int $now): array {
        $blocks = DB::fetchAll(
            "SELECT * FROM blocks WHERE room_id = ? AND status = 'running' ORDER BY id ASC",
            [$roomId]
        );

        if (empty($blocks)) return [];

        $blockIds = array_column($blocks, 'id');
        $in       = implode(',', array_fill(0, count($blockIds), '?'));

        // Query 1: última mensagem postada de cada bloco (1 query total)
        $lastRows = DB::fetchAll(
            "SELECT block_id, MAX(posted_at) as posted_at
             FROM timeline_messages
             WHERE block_id IN ($in) AND posted_at IS NOT NULL
             GROUP BY block_id",
            $blockIds
        );
        $lastByBlock = [];
        foreach ($lastRows as $r) $lastByBlock[$r['block_id']] = $r['posted_at'];

        // Query 2: próxima mensagem não postada de cada bloco (1 query total)
        $nextRows = DB::fetchAll(
            "SELECT tm.*, a.name as archetype_name, a.avatar_seed as archetype_seed
             FROM timeline_messages tm
             LEFT JOIN archetypes a ON a.id = tm.archetype_id
             WHERE tm.block_id IN ($in) AND tm.posted_at IS NULL
             ORDER BY tm.block_id ASC, tm.sequence_order ASC",
            $blockIds
        );
        // Pega apenas a primeira por bloco
        $nextByBlock = [];
        foreach ($nextRows as $r) {
            if (!isset($nextByBlock[$r['block_id']])) {
                $nextByBlock[$r['block_id']] = $r;
            }
        }

        $candidates  = [];
        $blocksById  = array_column($blocks, null, 'id');

        foreach ($blockIds as $blockId) {
            $block = $blocksById[$blockId];
            $next  = $nextByBlock[$blockId] ?? null;

            if (!$next) {
                self::handleBlockEnd($block);
                continue;
            }

            // Se é uma resposta, verificar se a mensagem original já existe no room_messages
            if (!empty($next['reply_to_id'])) {
                $originalExists = DB::fetch(
                    'SELECT rm.id FROM room_messages rm
                     JOIN timeline_messages tm ON tm.id = rm.timeline_message_id
                     WHERE tm.id = ? AND rm.room_id = ?',
                    [$next['reply_to_id'], $roomId]
                );
                if (!$originalExists) {
                    DB::query('UPDATE timeline_messages SET posted_at = NOW() WHERE id = ?', [$next['id']]);
                    continue;
                }
            }

            $lastPostedAt = $lastByBlock[$blockId] ?? null;

            if ($lastPostedAt) {
                $blockDelay = (int)$next['delay_after_prev'];

                if (!empty($next['reply_to_id'])) {
                    $blockDelay = rand(30, 90);
                } elseif (!empty($block['is_tips_block'])) {
                    $blockDelay = rand(60, 180);
                }

                $readyAt = strtotime($lastPostedAt) + $blockDelay;
            } else {
                $readyAt = $now;
            }

            if ($now >= $readyAt) {
                $candidates[] = [
                    'block'    => $block,
                    'next'     => $next,
                    'ready_at' => $readyAt,
                    'overdue'  => $now - $readyAt,
                ];
            }
        }

        return $candidates;
    }

    // ----------------------------------------------------------------
    // pickBest() — escolhe qual bloco posta agora
    // Prioridade: resposta pendente > mais atrasada > não repetir bloco anterior
    // ----------------------------------------------------------------
    private static function pickBest(array $candidates, int $roomId): ?array {
        $lastBlock   = DB::fetch(
            'SELECT block_id FROM room_messages WHERE room_id = ? ORDER BY posted_at DESC, id DESC LIMIT 1',
            [$roomId]
        );
        $lastBlockId = $lastBlock ? (int)$lastBlock['block_id'] : 0;

        // Prioridade 1: respostas pendentes
        $replies = array_filter($candidates, fn($c) => !empty($c['next']['reply_to_id']));
        if (!empty($replies)) {
            usort($replies, fn($a, $b) => $b['overdue'] - $a['overdue']);
            return array_values($replies)[0];
        }

        // Evitar repetir o mesmo bloco
        $others = array_filter($candidates, fn($c) => $c['block']['id'] !== $lastBlockId);
        $pool   = !empty($others) ? array_values($others) : array_values($candidates);

        // Bloco de dicas tem 20% de chance de ser escolhido (não deve dominar)
        $nonTips = array_filter($pool, fn($c) => empty($c['block']['is_tips_block']));
        if (!empty($nonTips) && rand(1, 5) !== 1) {
            $pool = array_values($nonTips);
        }

        // Escolher o mais atrasado
        usort($pool, fn($a, $b) => $b['overdue'] - $a['overdue']);
        return $pool[0];
    }

    // ----------------------------------------------------------------
    // postMessage() — insere no chat e marca posted_at
    // ----------------------------------------------------------------
    private static function postMessage(array $candidate, int $roomId): ?array {
        $block = $candidate['block'];
        $next  = $candidate['next'];

        [$displayName, $avatarUrl, $avatarSeed, $resolvedArchetypeId] = self::resolveAuthor($next, $block['id']);

        $finalMessageType = $next['message_type'];

        if (!empty($block['is_tips_block'])) {
            // Bloco exclusivo de dicas: força tip + Nutricionista
            $finalMessageType = 'tip';
            [$displayName, $avatarUrl, $avatarSeed, $resolvedArchetypeId] = self::resolveAuthor(
                array_merge($next, ['archetype_id' => 4, 'bot_id' => null, 'resolved_name' => null]),
                $block['id']
            );
        }
        // Tips fora do bloco de dicas saem com o archetype original da mensagem

        $replyToRoomId = null;
        if (!empty($next['reply_to_id'])) {
            $mapped = DB::fetch(
                'SELECT rm.id FROM room_messages rm
                 JOIN timeline_messages tm ON tm.id = rm.timeline_message_id
                 WHERE tm.id = ? AND rm.room_id = ?',
                [$next['reply_to_id'], $roomId]
            );
            $replyToRoomId = $mapped ? $mapped['id'] : null;
        }

        $roomMsgId = DB::insert(
            'INSERT INTO room_messages
             (room_id, block_id, timeline_message_id, bot_id, archetype_id, display_name, avatar_url, avatar_seed, content, message_type, reply_to_room_msg_id)
             VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            [
                $roomId, $block['id'], $next['id'],
                $next['bot_id'] ?? null,
                $resolvedArchetypeId,
                $displayName, $avatarUrl, $avatarSeed,
                $next['content'], $finalMessageType,
                $replyToRoomId,
            ]
        );

        DB::query('UPDATE timeline_messages SET posted_at = NOW() WHERE id = ?', [$next['id']]);

        // Limpar histórico se atingir 2000 mensagens (mantém 1000)
        self::pruneRoomMessages($roomId);

        return [
            'room_msg_id' => $roomMsgId,
            'block_id'    => $block['id'],
            'bot_name'    => $displayName,
            'content'     => $next['content'],
            'type'        => $finalMessageType,
        ];
    }

    // ----------------------------------------------------------------
    // handleBlockEnd()
    // ----------------------------------------------------------------
    private static function handleBlockEnd(array $block): void {
        if (!empty($block['loop_infinite'])) {
            // Resetar apenas posted_at — histórico de room_messages é preservado
            DB::query('UPDATE timeline_messages SET posted_at = NULL WHERE block_id = ?', [$block['id']]);
            // Embaralhar sequence_order para variar a ordem no próximo ciclo
            $msgs = DB::fetchAll('SELECT id FROM timeline_messages WHERE block_id = ? ORDER BY RAND()', [$block['id']]);
            foreach ($msgs as $i => $m) {
                DB::query('UPDATE timeline_messages SET sequence_order = ? WHERE id = ?', [$i + 1, $m['id']]);
            }
            DB::query("UPDATE blocks SET status = 'running' WHERE id = ?", [$block['id']]);
            unset(self::$assignedNames[$block['id']]);
        } else {
            DB::query("UPDATE blocks SET status = 'done' WHERE id = ?", [$block['id']]);
        }
    }

    // ----------------------------------------------------------------
    // markDoneBlocks()
    // ----------------------------------------------------------------
    private static function markDoneBlocks(int $roomId): void {
        DB::query(
            "UPDATE blocks b SET b.status = 'done'
             WHERE b.room_id = ? AND b.status = 'running' AND b.loop_infinite = 0
             AND NOT EXISTS (
                 SELECT 1 FROM timeline_messages tm
                 WHERE tm.block_id = b.id AND tm.posted_at IS NULL
             )",
            [$roomId]
        );
    }

    // ----------------------------------------------------------------
    // startPendingBlocks()
    // ----------------------------------------------------------------
    private static function startPendingBlocks(int $roomId): void {
        // Buscar blocos pending antes de ativar
        $pending = DB::fetchAll(
            "SELECT id FROM blocks WHERE room_id = ? AND status = 'pending'
             AND (start_at IS NULL OR start_at <= NOW())",
            [$roomId]
        );

        if (empty($pending)) return;

        foreach ($pending as $block) {
            // Encontrar uma tip sem reply para ser a primeira mensagem
            $firstMsg = DB::fetch(
                "SELECT id, sequence_order FROM timeline_messages
                 WHERE block_id = ? AND message_type = 'tip' AND reply_to_id IS NULL
                 ORDER BY RAND() LIMIT 1",
                [$block['id']]
            );

            if ($firstMsg) {
                // Pega o sequence_order original da primeira mensagem do bloco
                $originalFirst = DB::fetch(
                    'SELECT id, sequence_order FROM timeline_messages
                     WHERE block_id = ? ORDER BY sequence_order ASC LIMIT 1',
                    [$block['id']]
                );

                // Troca o sequence_order entre a tip escolhida e a primeira original
                if ($originalFirst && $originalFirst['id'] !== $firstMsg['id']) {
                    DB::query('UPDATE timeline_messages SET sequence_order = ? WHERE id = ?',
                        [$originalFirst['sequence_order'], $firstMsg['id']]);
                    DB::query('UPDATE timeline_messages SET sequence_order = ? WHERE id = ?',
                        [$firstMsg['sequence_order'], $originalFirst['id']]);
                }
            }
            // Resto permanece na ordem original do banco — sem embaralhar
        }

        DB::query(
            "UPDATE blocks SET status = 'running'
             WHERE room_id = ? AND status = 'pending'
             AND (start_at IS NULL OR start_at <= NOW())",
            [$roomId]
        );
    }

    // ----------------------------------------------------------------
    // resolveAuthor()
    // ----------------------------------------------------------------
    private static function resolveAuthor(array $msg, int $blockId): array {
        if (!empty($msg['bot_id'])) {
            $bot = DB::fetch('SELECT name, avatar_url, archetype_id FROM bots WHERE id = ?', [$msg['bot_id']]);
            if ($bot) {
                $seed = $bot['name'];
                $url  = $bot['avatar_url'] ?: avatarUrl($seed);
                return [$bot['name'], $url, $seed, $bot['archetype_id']];
            }
        }

        $archetypeId = (int)($msg['archetype_id'] ?? 0);

        if ($archetypeId) {
            if (!empty($msg['resolved_name'])) {
                $seed = $msg['resolved_name'] . $archetypeId;
                return [$msg['resolved_name'], avatarUrl($seed), $seed, $archetypeId];
            }

            $used      = self::$assignedNames[$blockId] ?? [];
            $pool      = DB::fetchAll(
                'SELECT first_name, abbreviation FROM name_pool WHERE archetype_id = ? AND active = 1',
                [$archetypeId]
            );
            $available = array_values(array_filter($pool, fn($p) => !in_array($p['first_name'], $used)));

            if (empty($available)) {
                self::$assignedNames[$blockId] = [];
                $available = $pool;
            }

            if (!empty($available)) {
                $pick        = $available[array_rand($available)];
                $displayName = $pick['first_name'] . ' ' . $pick['abbreviation'];
                self::$assignedNames[$blockId][] = $pick['first_name'];
            } else {
                $displayName = $msg['archetype_name'] ?? 'Usuário';
            }

            $seed = $displayName . $archetypeId;
            return [$displayName, avatarUrl($seed), $seed, $archetypeId];
        }

        return ['Usuário', avatarUrl('default'), 'default', null];
    }

    // ----------------------------------------------------------------
    // Métodos de leitura
    // ----------------------------------------------------------------
    public static function getMessagesSince(int $roomId, int $lastId = 0, int $limit = 50): array {
        return DB::fetchAll(
            'SELECT
                rm.id, rm.content, rm.message_type, rm.posted_at,
                rm.reply_to_room_msg_id,
                rm.display_name             as bot_name,
                rm.avatar_url, rm.avatar_seed, rm.archetype_id,
                COALESCE(a.name, \'\')      as archetype_name,
                COALESCE(a.avatar_seed, rm.avatar_seed) as avatar_seed,
                bl.name                     as block_name
             FROM room_messages rm
             LEFT JOIN archetypes a  ON a.id  = rm.archetype_id
             LEFT JOIN blocks    bl ON bl.id = rm.block_id
             WHERE rm.room_id = ? AND rm.id > ?
             ORDER BY rm.posted_at ASC, rm.id ASC
             LIMIT ?',
            [$roomId, $lastId, $limit]
        );
    }

    public static function getRecentMessages(int $roomId, int $limit = 1040): array {
        $rows = DB::fetchAll(
            'SELECT
                rm.id, rm.content, rm.message_type, rm.posted_at,
                rm.reply_to_room_msg_id,
                rm.display_name             as bot_name,
                rm.avatar_url, rm.avatar_seed, rm.archetype_id,
                COALESCE(a.name, \'\')      as archetype_name,
                COALESCE(a.avatar_seed, rm.avatar_seed) as avatar_seed,
                bl.name                     as block_name
             FROM room_messages rm
             LEFT JOIN archetypes a  ON a.id  = rm.archetype_id
             LEFT JOIN blocks    bl ON bl.id = rm.block_id
             WHERE rm.room_id = ?
             ORDER BY rm.id DESC
             LIMIT ?',
            [$roomId, $limit]
        );
        return array_reverse($rows);
    }

    public static function getRoomStats(int $roomId): array {
        $totalMessages = DB::fetch('SELECT COUNT(*) as total FROM room_messages WHERE room_id = ?', [$roomId]);
        $activeBlocks  = DB::fetch(
            "SELECT COUNT(*) as c FROM blocks WHERE room_id = ? AND status = 'running'",
            [$roomId]
        );

        // Contador orgânico: oscila entre 437 e 1837 sem tocar os extremos
        // Baseado em ciclos senoidais combinados com ruído por hora/minuto
        // Nunca toca o mínimo (437) nem o máximo (1837)
        $min     = 450;   // mínimo real (acima do piso 437)
        $max     = 1820;  // máximo real (abaixo do teto 1837)
        $range   = $max - $min;

        // Hora do dia em radianos (0-24h → 0-2π)
        $hour    = (int)date('G');   // 0-23
        $minute  = (int)date('i');   // 0-59
        $second  = (int)date('s');   // 0-59
        $dayFrac = ($hour * 3600 + $minute * 60 + $second) / 86400.0;

        // Curva principal: pico no meio do dia, vale de madrugada
        $wave1 = sin($dayFrac * 2 * M_PI - M_PI / 2); // -1 a 1

        // Ondulação secundária mais rápida (ciclo de ~4h) para variação orgânica
        $wave2 = sin($dayFrac * 2 * M_PI * 6) * 0.18;

        // Micro-ruído por minuto (varia a cada minuto de forma consistente)
        $noise = sin(crc32(date('YmdHi') . $roomId) * 0.0001) * 0.08;

        // Combina as ondas: normaliza de -1~1 para 0~1
        $combined = ($wave1 * 0.74 + $wave2 + $noise + 1.0) / 2.0;
        $combined = max(0.02, min(0.98, $combined)); // nunca toca 0 ou 1

        $fakeOnline = (int)round($min + $combined * $range);

        return [
            'total_messages' => (int)($totalMessages['total'] ?? 0),
            'online_count'   => $fakeOnline,
            'active_blocks'  => (int)($activeBlocks['c'] ?? 0),
        ];
    }
}
