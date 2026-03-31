<?php
@ini_set('display_errors', 0);
error_reporting(0);
// ============================================================
// api/index.php — API REST completa
// Versão final unificada
// ============================================================

// Headers CORS — aplicados apenas nas rotas públicas (chat/*)
// Rotas admin usam CORS restrito (sem wildcard)
if (!class_exists('DB')) {
    require_once __DIR__ . '/../includes/config.php';
}
require_once __DIR__ . '/../includes/engine.php';
// claude.php removido — geração via Prompt Builder externo

$method = $_SERVER['REQUEST_METHOD'];
$path   = trim($_GET['path'] ?? '', '/');
$parts  = explode('/', $path);
$action = $parts[0] ?? '';

// CORS: rotas públicas aceitam qualquer origem; rotas admin são restritas
$isPublicRoute = in_array($action, ['chat', 'ping']);
if ($isPublicRoute) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
} else {
    $adminOrigin = getSetting('admin_origin') ?: '';
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($adminOrigin && $origin === $adminOrigin) {
        header('Access-Control-Allow-Origin: ' . $adminOrigin);
    } elseif (!$adminOrigin) {
        // Sem restrição configurada — permite (backward compat)
        header('Access-Control-Allow-Origin: *');
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');
}

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Body JSON
$body = json_decode(file_get_contents('php://input'), true) ?? [];

// ── Autenticação admin ──────────────────────────────────────
function requireAdmin(): void {
    $token = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? ($_GET['token'] ?? '');
    try {
        $saved = getSetting('admin_token');
        if ($saved && $token !== $saved) {
            jsonResponse(['error' => 'Unauthorized — Token inválido'], 401);
        }
    } catch (Exception $e) {
        jsonResponse(['error' => 'DB não inicializado: ' . $e->getMessage()], 500);
    }
}

// Tipos de mensagem válidos
const VALID_MSG_TYPES = ['statement', 'question', 'answer', 'tip', 'reaction', 'vacuum_question'];

// ============================================================
// ROTAS
// ============================================================
switch ($action) {

    // ── CHAT PÚBLICO ────────────────────────────────────────
    case 'chat':
        $sub = $parts[1] ?? '';

        // GET /api/chat/messages?room=SLUG&last_id=0
        if ($sub === 'messages' && $method === 'GET') {
            $roomSlug = $_GET['room'] ?? '';
            $lastId   = (int)($_GET['last_id'] ?? 0);

            if (!$roomSlug) jsonResponse(['error' => 'Parâmetro room obrigatório'], 400);

            $room = DB::fetch(
                "SELECT id, name, avatar_url FROM rooms WHERE slug = ? AND status = 'active'",
                [$roomSlug]
            );

            if (!$room) {
                jsonResponse([
                    'messages' => [],
                    'stats'    => ['online_count' => 0, 'total_messages' => 0, 'active_blocks' => 0],
                    'room'     => null,
                ]);
            }

            // Engine roda junto com o polling (substitui cron em ambientes sem cron)
            try { ChatEngine::processRoom($room['id']); } catch (Exception $e) {}

            $messages = ($lastId === 0)
                ? ChatEngine::getRecentMessages($room['id'], 80)
                : ChatEngine::getMessagesSince($room['id'], $lastId);

            $stats = ChatEngine::getRoomStats($room['id']);

            jsonResponse([
                'messages' => $messages,
                'stats'    => $stats,
                'ts'       => time(),
                'room'     => ['name' => $room['name'], 'avatar_url' => $room['avatar_url'] ?? null],
            ]);
        }

        // GET /api/chat/history?room=SLUG&before_id=ID&limit=25
        if ($sub === 'history' && $method === 'GET') {
            $roomSlug = $_GET['room']      ?? '';
            $beforeId = (int)($_GET['before_id'] ?? 0);
            $limit    = min((int)($_GET['limit']  ?? 25), 50);

            $room = DB::fetch("SELECT id FROM rooms WHERE slug = ? AND status = 'active'", [$roomSlug]);
            if (!$room) jsonResponse(['messages' => []]);

            $msgs = DB::fetchAll(
                "SELECT
                    rm.id, rm.content, rm.message_type, rm.posted_at,
                    rm.reply_to_room_msg_id,
                    rm.display_name             as bot_name,
                    rm.avatar_url, rm.avatar_seed, rm.archetype_id,
                    COALESCE(a.name, '')      as archetype_name,
                    COALESCE(a.avatar_seed, rm.avatar_seed) as avatar_seed,
                    bl.name                     as block_name
                 FROM room_messages rm
                 LEFT JOIN archetypes a  ON a.id  = rm.archetype_id
                 LEFT JOIN blocks    bl ON bl.id = rm.block_id
                 WHERE rm.room_id = ? AND (? = 0 OR rm.id < ?)
                 ORDER BY rm.id DESC
                 LIMIT ?",
                [$room['id'], $beforeId, $beforeId, $limit]
            );
            // Retorna em ordem cronológica (mais antigas primeiro)
            jsonResponse(['messages' => array_reverse($msgs)]);
        }

        // GET /api/chat/reactions?room=SLUG&since_id=0
        if ($sub === 'reactions' && $method === 'GET') {
            $roomSlug = $_GET['room'] ?? '';
            $sinceId  = (int)($_GET['since_id'] ?? 0);
            $room = DB::fetch("SELECT id FROM rooms WHERE slug = ?", [$roomSlug]);
            if (!$room) jsonResponse(['reactions' => []]);
            $rows = DB::fetchAll(
                'SELECT message_id, emoji, COUNT(*) as count
                 FROM room_message_reactions
                 WHERE room_id = ? AND message_id > ?
                 GROUP BY message_id, emoji',
                [$room['id'], $sinceId]
            );
            // Group by message_id
            $grouped = [];
            foreach ($rows as $r) {
                $grouped[$r['message_id']][] = ['emoji' => $r['emoji'], 'count' => (int)$r['count']];
            }
            jsonResponse(['reactions' => $grouped]);
        }

        // POST /api/chat/react  body: {room, message_id, emoji, fp}
        if ($sub === 'react' && $method === 'POST') {
            $roomSlug  = $body['room']       ?? '';
            $messageId = (int)($body['message_id'] ?? 0);
            $emoji     = $body['emoji']      ?? '';
            $fp        = $body['fp']         ?? substr(md5(($_SERVER['REMOTE_ADDR'] ?? '') . ($_SERVER['HTTP_USER_AGENT'] ?? '')), 0, 32);

            if (!$roomSlug || !$messageId || !$emoji) jsonResponse(['error' => 'Parâmetros inválidos'], 400);
            $room = DB::fetch("SELECT id FROM rooms WHERE slug = ?", [$roomSlug]);
            if (!$room) jsonResponse(['error' => 'Sala não encontrada'], 404);

            // Verifica se já existe para fazer toggle
            $exists = DB::fetch(
                'SELECT id FROM room_message_reactions WHERE message_id=? AND visitor_fp=? AND emoji=?',
                [$messageId, $fp, $emoji]
            );
            if ($exists) {
                DB::query('DELETE FROM room_message_reactions WHERE id=?', [$exists['id']]);
                $toggled = false;
            } else {
                DB::insert(
                    'INSERT IGNORE INTO room_message_reactions (message_id, room_id, emoji, visitor_fp) VALUES (?,?,?,?)',
                    [$messageId, $room['id'], $emoji, $fp]
                );
                $toggled = true;
            }
            $cnt = DB::fetch('SELECT COUNT(*) as c FROM room_message_reactions WHERE message_id=? AND emoji=?', [$messageId, $emoji]);
            jsonResponse(['ok' => true, 'count' => (int)$cnt['c'], 'toggled' => $toggled]);
        }

        
        if ($sub === 'rooms' && $method === 'GET') {
            $slug = $parts[2] ?? '';
            $room = DB::fetch(
                'SELECT id, name, slug, description, status FROM rooms WHERE slug = ?',
                [$slug]
            );
            if (!$room) jsonResponse(['error' => 'Sala não encontrada'], 404);
            jsonResponse($room);
        }

        // POST /api/chat/track
        if ($sub === 'track' && $method === 'POST') {
            $roomSlug = $body['room'] ?? '';
            $room     = DB::fetch('SELECT id FROM rooms WHERE slug = ?', [$roomSlug]);
            if ($room) {
                $fp = substr(md5(($_SERVER['REMOTE_ADDR'] ?? '') . ($_SERVER['HTTP_USER_AGENT'] ?? '')), 0, 16);
                DB::query(
                    'INSERT INTO room_analytics (room_id, visitor_fingerprint, event_type, metadata) VALUES (?,?,?,?)',
                    [$room['id'], $fp, $body['event'] ?? 'view', json_encode($body['meta'] ?? [])]
                );
            }
            jsonResponse(['ok' => true]);
        }

        jsonResponse(['error' => 'Rota chat não encontrada'], 404);
        break;

    // ── BOTS ────────────────────────────────────────────────
    case 'bots':
        requireAdmin();

        if ($method === 'GET') {
            jsonResponse(DB::fetchAll(
                'SELECT b.*, a.name as archetype_name
                 FROM bots b JOIN archetypes a ON a.id = b.archetype_id
                 ORDER BY b.name'
            ));
        }

        if ($method === 'POST') {
            if (empty($body['name']))       jsonResponse(['error' => 'Nome obrigatório'], 400);
            if (empty($body['archetype_id'])) jsonResponse(['error' => 'Arquétipo obrigatório'], 400);
            $id = DB::insert(
                'INSERT INTO bots (name, archetype_id, gender, avatar_url) VALUES (?,?,?,?)',
                [
                    trim($body['name']),
                    (int)$body['archetype_id'],
                    $body['gender'] ?? 'M',
                    $body['avatar_url'] ?? null,
                ]
            );
            jsonResponse(['id' => $id, 'ok' => true]);
        }

        if ($method === 'DELETE' && isset($parts[1])) {
            DB::query('DELETE FROM bots WHERE id = ?', [(int)$parts[1]]);
            jsonResponse(['ok' => true]);
        }

        jsonResponse(['error' => 'Método não suportado'], 405);
        break;

    // ── ARQUÉTIPOS ──────────────────────────────────────────
    case 'archetypes':
        requireAdmin();

        if ($method === 'GET') {
            jsonResponse(DB::fetchAll('SELECT * FROM archetypes ORDER BY name'));
        }

        if ($method === 'POST') {
            if (empty($body['name']))          jsonResponse(['error' => 'Nome obrigatório'], 400);
            if (empty($body['speaking_style'])) jsonResponse(['error' => 'Estilo de fala obrigatório'], 400);
            $id = DB::insert(
                'INSERT INTO archetypes
                 (name, description, speaking_style, vocabulary_examples, typo_rate, emoji_rate, response_delay_min, response_delay_max, avatar_seed)
                 VALUES (?,?,?,?,?,?,?,?,?)',
                [
                    trim($body['name']),
                    $body['description']         ?? '',
                    $body['speaking_style']       ?? '',
                    $body['vocabulary_examples']  ?? '',
                    (int)($body['typo_rate']           ?? 10),
                    (int)($body['emoji_rate']          ?? 20),
                    (int)($body['response_delay_min']  ?? 3),
                    (int)($body['response_delay_max']  ?? 25),
                    $body['avatar_seed']          ?? uniqid('arch_'),
                ]
            );
            jsonResponse(['id' => $id, 'ok' => true]);
        }

        if ($method === 'PUT' && isset($parts[1])) {
            DB::query(
                'UPDATE archetypes SET name=?, description=?, speaking_style=?, vocabulary_examples=?,
                 typo_rate=?, emoji_rate=?, response_delay_min=?, response_delay_max=? WHERE id=?',
                [
                    $body['name']                ?? '',
                    $body['description']         ?? '',
                    $body['speaking_style']      ?? '',
                    $body['vocabulary_examples'] ?? '',
                    (int)($body['typo_rate']          ?? 10),
                    (int)($body['emoji_rate']         ?? 20),
                    (int)($body['response_delay_min'] ?? 3),
                    (int)($body['response_delay_max'] ?? 25),
                    (int)$parts[1],
                ]
            );
            jsonResponse(['ok' => true]);
        }

        jsonResponse(['error' => 'Método não suportado'], 405);
        break;

    // ── SALAS ───────────────────────────────────────────────
    case 'rooms':
        requireAdmin();

        // GET /api/rooms/ID/all_messages — deve vir ANTES do GET genérico
        if ($method === 'GET' && isset($parts[1]) && ($parts[2] ?? '') === 'all_messages') {
            $roomId = (int)$parts[1];
            $msgs = DB::fetchAll(
                "SELECT tm.id, tm.block_id, tm.sequence_order, tm.content, tm.message_type,
                        tm.reply_to_id, tm.archetype_id, tm.bot_id, tm.delay_after_prev,
                        b.is_tips_block
                 FROM timeline_messages tm
                 JOIN blocks b ON b.id = tm.block_id
                 WHERE b.room_id = ?
                 ORDER BY tm.block_id ASC, tm.sequence_order ASC",
                [$roomId]
            );
            jsonResponse($msgs);
        }

        if ($method === 'GET') {
            jsonResponse(DB::fetchAll(
                'SELECT r.*,
                    (SELECT COUNT(*) FROM blocks       WHERE room_id=r.id) as block_count,
                    (SELECT COUNT(*) FROM room_messages WHERE room_id=r.id) as msg_count
                 FROM rooms r ORDER BY r.created_at DESC'
            ));
        }

        // POST /api/rooms/ID/bulk_dispatch — insere em lote com suporte a offset/limit
        if ($method === 'POST' && isset($parts[1]) && ($parts[2] ?? '') === 'bulk_dispatch') {
            $roomId  = (int)$parts[1];
            $offset  = (int)($body['offset']  ?? 0);
            $limit   = (int)($body['limit']   ?? 50);
            $isFirst = ($offset === 0);

            $pdo = DB::conn();
            try {
                // Primeira chamada: limpa e reseta
                if ($isFirst) {
                    DB::query('DELETE FROM room_messages WHERE room_id = ?', [$roomId]);
                    DB::query("UPDATE blocks SET status='pending' WHERE room_id = ?", [$roomId]);
                    DB::query(
                        "UPDATE timeline_messages tm JOIN blocks b ON b.id = tm.block_id
                         SET tm.posted_at = NULL WHERE b.room_id = ?",
                        [$roomId]
                    );
                }

                // Conta total
                $totalRow = DB::fetch(
                    "SELECT COUNT(*) as total FROM timeline_messages tm
                     JOIN blocks b ON b.id = tm.block_id WHERE b.room_id = ?",
                    [$roomId]
                );
                $total = (int)($totalRow['total'] ?? 0);
                if ($total === 0) jsonResponse(['error' => 'Timeline vazia'], 404);

                // Busca lote
                $msgs = DB::fetchAll(
                    "SELECT tm.*, b.is_tips_block, b.id as block_id_real
                     FROM timeline_messages tm
                     JOIN blocks b ON b.id = tm.block_id
                     WHERE b.room_id = ?
                     ORDER BY tm.block_id ASC, tm.sequence_order ASC
                     LIMIT ? OFFSET ?",
                    [$roomId, $limit, $offset]
                );

                if (empty($msgs)) {
                    jsonResponse(['ok' => true, 'inserted' => 0, 'total' => $total, 'done' => true]);
                }

                // Pré-carrega name_pool
                $namePoolRaw = DB::fetchAll('SELECT archetype_id, first_name, abbreviation FROM name_pool WHERE active = 1');
                $namePool = [];
                foreach ($namePoolRaw as $n) { $namePool[$n['archetype_id']][] = $n; }

                $archetypesOther = DB::fetchAll('SELECT id FROM archetypes WHERE id != 4');

                $stmt = $pdo->prepare(
                    "INSERT INTO room_messages (room_id, block_id, timeline_message_id, bot_id, archetype_id,
                      display_name, avatar_url, avatar_seed, content, message_type, reply_to_room_msg_id, posted_at)
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW())"
                );

                $inserted = 0;
                foreach ($msgs as $tm) {
                    $archetypeId = (int)($tm['archetype_id'] ?? 0);

                    if (!empty($tm['is_tips_block'])) {
                        $archetypeId = 4;
                    } elseif ($archetypeId === 4) {
                        $archetypeId = !empty($archetypesOther)
                            ? (int)$archetypesOther[array_rand($archetypesOther)]['id']
                            : 1;
                    }

                    if (!empty($tm['resolved_name'])) {
                        $displayName = $tm['resolved_name'];
                    } elseif ($archetypeId && !empty($namePool[$archetypeId])) {
                        $pick        = $namePool[$archetypeId][array_rand($namePool[$archetypeId])];
                        $displayName = $pick['first_name'] . ' ' . $pick['abbreviation'];
                    } else {
                        $displayName = 'Membro';
                    }

                    $avatarSeed = $displayName . $archetypeId;
                    $avatarUrl  = avatarUrl($avatarSeed);

                    // Resolve reply via query direta (mais confiável que mapa em lote)
                    $replyId = null;
                    if (!empty($tm['reply_to_id'])) {
                        $orig = DB::fetch(
                            'SELECT id FROM room_messages WHERE timeline_message_id = ? AND room_id = ? ORDER BY id DESC LIMIT 1',
                            [$tm['reply_to_id'], $roomId]
                        );
                        if ($orig) $replyId = $orig['id'];
                    }

                    $stmt->execute([
                        $roomId, $tm['block_id_real'], $tm['id'],
                        null, $archetypeId,
                        $displayName, $avatarUrl, $avatarSeed,
                        $tm['content'], $tm['message_type'] ?? 'statement',
                        $replyId
                    ]);

                    // Marca posted_at na timeline_message
                    DB::query('UPDATE timeline_messages SET posted_at = NOW() WHERE id = ?', [$tm['id']]);

                    $inserted++;
                }

                $newOffset = $offset + $inserted;
                $done      = ($newOffset >= $total);

                jsonResponse([
                    'ok'       => true,
                    'inserted' => $inserted,
                    'offset'   => $newOffset,
                    'total'    => $total,
                    'done'     => $done,
                ]);

            } catch (Exception $e) {
                jsonResponse(['error' => 'Erro no bulk: ' . $e->getMessage()], 500);
            }
        }


        // POST /api/rooms/ID/post_message — deve vir ANTES do POST genérico
        if ($method === 'POST' && isset($parts[1]) && ($parts[2] ?? '') === 'post_message') {
            $roomId   = (int)$parts[1];
            $body     = json_decode(file_get_contents('php://input'), true) ?? [];
            $tmId     = (int)($body['timeline_message_id'] ?? 0);
            if (!$tmId) jsonResponse(['error' => 'timeline_message_id obrigatório'], 400);

            $tm = DB::fetch(
                "SELECT tm.*, b.is_tips_block, b.id as block_id_real
                 FROM timeline_messages tm
                 JOIN blocks b ON b.id = tm.block_id
                 WHERE tm.id = ? AND b.room_id = ?",
                [$tmId, $roomId]
            );
            if (!$tm) jsonResponse(['error' => 'Mensagem não encontrada'], 404);

            $archetypeId = (int)($tm['archetype_id'] ?? 0);
            $displayName = null;
            $avatarSeed  = null;
            $avatarUrl   = null;
            $botId       = null;

            if (!empty($tm['bot_id'])) {
                $bot = DB::fetch('SELECT * FROM bots WHERE id = ?', [$tm['bot_id']]);
                if ($bot) {
                    $displayName = $bot['name'] ?? 'Membro';
                    $avatarSeed  = $bot['avatar_seed'] ?? $bot['name'];
                    $avatarUrl   = avatarUrl($avatarSeed);
                    $botId       = $bot['id'];
                    $archetypeId = $bot['archetype_id'] ?? $archetypeId;
                }
            }

            if (!$displayName && !empty($tm['resolved_name'])) {
                $displayName = $tm['resolved_name'];
                $avatarSeed  = $displayName;
                $avatarUrl   = avatarUrl($avatarSeed);
            }

            if (!$displayName && $archetypeId) {
                // Bloco normal nao pode usar arquetipo 4
                if ($archetypeId === 4 && empty($tm['is_tips_block'])) {
                    $outro = DB::fetch('SELECT id FROM archetypes WHERE id != 4 ORDER BY RAND() LIMIT 1');
                    $archetypeId = $outro ? (int)$outro['id'] : 1;
                }
                $pool = DB::fetchAll(
                    'SELECT first_name, abbreviation FROM name_pool WHERE archetype_id = ? AND active = 1 ORDER BY RAND() LIMIT 1',
                    [$archetypeId]
                );
                if ($pool) {
                    $pick        = $pool[0];
                    $displayName = $pick['first_name'] . ' ' . $pick['abbreviation'];
                    $avatarSeed  = $displayName;
                    $avatarUrl   = avatarUrl($avatarSeed);
                }
            }

            if (!$displayName) {
                $displayName = 'Membro';
                $avatarSeed  = 'membro';
                $avatarUrl   = avatarUrl($avatarSeed);
            }

            $replyId = null;
            if (!empty($tm['reply_to_id'])) {
                $orig = DB::fetch(
                    'SELECT id FROM room_messages WHERE timeline_message_id = ? AND room_id = ? ORDER BY id DESC LIMIT 1',
                    [$tm['reply_to_id'], $roomId]
                );
                if ($orig) $replyId = $orig['id'];
            }

            DB::query(
                "INSERT INTO room_messages (room_id, block_id, timeline_message_id, bot_id, archetype_id,
                  display_name, avatar_url, avatar_seed, content, message_type, reply_to_room_msg_id, posted_at)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW())",
                [
                    $roomId, $tm['block_id_real'], $tmId,
                    $botId, $archetypeId,
                    $displayName, $avatarUrl, $avatarSeed,
                    $tm['content'], $tm['message_type'] ?? 'statement',
                    $replyId
                ]
            );
            jsonResponse(['ok' => true]);
        }

        if ($method === 'POST') {
            if (empty($body['name'])) jsonResponse(['error' => 'Nome obrigatório'], 400);
            $slug   = generateSlug($body['name']);
            $exists = DB::fetch('SELECT id FROM rooms WHERE slug = ?', [$slug]);
            if ($exists) $slug .= '-' . substr(uniqid(), -4);
            $id = DB::insert(
                'INSERT INTO rooms (name, slug, description) VALUES (?,?,?)',
                [trim($body['name']), $slug, $body['description'] ?? '']
            );
            jsonResponse(['id' => $id, 'slug' => $slug, 'ok' => true]);
        }

        if ($method === 'PUT' && isset($parts[1])) {
            $roomId = (int)$parts[1];
            $sub    = $parts[2] ?? '';
            if ($sub === 'status') {
                $allowed = ['active', 'paused', 'inactive'];
                if (!in_array($body['status'] ?? '', $allowed)) jsonResponse(['error' => 'Status inválido'], 400);
                DB::query('UPDATE rooms SET status = ? WHERE id = ?', [$body['status'], $roomId]);
                jsonResponse(['ok' => true]);
            }
            DB::query(
                'UPDATE rooms SET name=?, description=?, status=? WHERE id=?',
                [$body['name'] ?? '', $body['description'] ?? '', $body['status'] ?? 'inactive', $roomId]
            );
            jsonResponse(['ok' => true]);
        }

        // DELETE /api/rooms/ID/clear_messages
        if ($method === 'DELETE' && isset($parts[1]) && ($parts[2] ?? '') === 'clear_messages') {
            $roomId = (int)$parts[1];
            DB::query('DELETE FROM room_messages WHERE room_id = ?', [$roomId]);
            jsonResponse(['ok' => true, 'cleared' => 'room_messages']);
        }

        if ($method === 'DELETE' && isset($parts[1])) {
            $roomId = (int)$parts[1];
            DB::query('DELETE FROM rooms WHERE id = ?', [$roomId]);
            jsonResponse(['ok' => true]);
        }

        jsonResponse(['error' => 'Método não suportado'], 405);
        break;

    case 'blocks':
        requireAdmin();

        if ($method === 'GET') {
            $roomId = (int)($_GET['room_id'] ?? 0);
            if (!$roomId) jsonResponse(['error' => 'room_id obrigatório'], 400);
            jsonResponse(DB::fetchAll(
                'SELECT b.*,
                    (SELECT COUNT(*) FROM timeline_messages WHERE block_id=b.id)                            as msg_count,
                    (SELECT COUNT(*) FROM timeline_messages WHERE block_id=b.id AND posted_at IS NOT NULL)  as posted_count
                 FROM blocks b WHERE b.room_id = ? ORDER BY b.id',
                [$roomId]
            ));
        }

        if ($method === 'POST') {
            if (empty($body['name']))  jsonResponse(['error' => 'Nome obrigatório'], 400);
            if (empty($body['topic'])) jsonResponse(['error' => 'Tema obrigatório'], 400);
            $isTipsBlock = isset($body['is_tips_block']) ? (int)(bool)$body['is_tips_block'] : 0;
            $id = DB::insert(
                'INSERT INTO blocks (room_id, name, topic, is_tips_block) VALUES (?,?,?,?)',
                [(int)($body['room_id'] ?? 0), trim($body['name']), trim($body['topic']), $isTipsBlock]
            );
            jsonResponse(['id' => $id, 'ok' => true]);
        }

        if ($method === 'PUT' && isset($parts[1])) {
            $blockId = (int)$parts[1];
            $sub     = $parts[2] ?? '';
            if ($sub === 'status') {
                $allowed = ['pending', 'running', 'paused', 'done'];
                if (!in_array($body['status'] ?? '', $allowed)) jsonResponse(['error' => 'Status inválido'], 400);
                DB::query('UPDATE blocks SET status = ? WHERE id = ?', [$body['status'], $blockId]);
                // Ao resetar para pending, limpa posted_at para permitir replay da timeline
                if ($body['status'] === 'pending') {
                    DB::query('UPDATE timeline_messages SET posted_at = NULL WHERE block_id = ?', [$blockId]);
                    DB::query('DELETE FROM room_messages WHERE block_id = ?', [$blockId]);
                }
                jsonResponse(['ok' => true]);
            }
            // Toggle simples: loop_infinite ou is_tips_block (via PUT /api/blocks/ID)
            if (isset($body['loop_infinite']) && count(array_keys($body)) === 1) {
                DB::query('UPDATE blocks SET loop_infinite=? WHERE id=?', [(int)(bool)$body['loop_infinite'], $blockId]);
                jsonResponse(['ok' => true]);
            }
            if (isset($body['is_tips_block']) && count(array_keys($body)) === 1) {
                DB::query('UPDATE blocks SET is_tips_block=? WHERE id=?', [(int)(bool)$body['is_tips_block'], $blockId]);
                jsonResponse(['ok' => true]);
            }
            $loopInfinite = isset($body['loop_infinite']) ? (int)(bool)$body['loop_infinite'] : null;
            $isTipsBlock  = isset($body['is_tips_block'])  ? (int)(bool)$body['is_tips_block']  : null;
            $sql = 'UPDATE blocks SET name=?, topic=?, status=?, start_at=?';
            $params = [
                $body['name']     ?? '',
                $body['topic']    ?? '',
                $body['status']   ?? 'pending',
                $body['start_at'] ?? null,
            ];
            if ($loopInfinite !== null) {
                $sql .= ', loop_infinite=?';
                $params[] = $loopInfinite;
            }
            if ($isTipsBlock !== null) {
                $sql .= ', is_tips_block=?';
                $params[] = $isTipsBlock;
            }
            $sql .= ' WHERE id=?';
            $params[] = $blockId;
            DB::query($sql, $params);
            jsonResponse(['ok' => true]);
        }

        // DELETE /api/blocks/ID/clear_messages — limpa room_messages do bloco
        if ($method === 'DELETE' && isset($parts[1]) && ($parts[2] ?? '') === 'clear_messages') {
            $blockId = (int)$parts[1];
            DB::query('DELETE FROM room_messages WHERE block_id = ?', [$blockId]);
            jsonResponse(['ok' => true, 'cleared' => 'block_messages']);
        }

        if ($method === 'DELETE' && isset($parts[1])) {
            $blockId = (int)$parts[1];
            DB::query('DELETE FROM timeline_messages WHERE block_id = ?', [$blockId]);
            DB::query('DELETE FROM room_messages WHERE block_id = ?', [$blockId]);
            DB::query('DELETE FROM blocks WHERE id = ?', [$blockId]);
            jsonResponse(['ok' => true]);
        }

        jsonResponse(['error' => 'Método não suportado'], 405);
        break;

    // ── IMPORTAR SQL DA TIMELINE ────────────────────────────
    case 'generate':   // mantém rota por compatibilidade — redireciona para import_sql
    case 'import_sql':
        requireAdmin();

        if ($method === 'POST') {
            $sql = trim($body['sql'] ?? '');
            if (empty($sql)) {
                jsonResponse(['error' => 'SQL vazio'], 400);
            }

            // Segurança: permite apenas INSERT INTO timeline_messages
            // Remove comentários SQL simples
            $cleanSql = preg_replace('/--[^\n]*/', '', $sql);
            $cleanSql = preg_replace('/\/\*.*?\*\//s', '', $cleanSql);

            // Verifica que é um INSERT INTO timeline_messages
            if (!preg_match('/^\s*INSERT\s+INTO\s+`?timeline_messages`?/i', $cleanSql)) {
                jsonResponse(['error' => 'Apenas INSERT INTO timeline_messages é permitido'], 400);
            }

            // Bloqueia outras statements perigosas
            $blocked = ['DROP','TRUNCATE','DELETE','UPDATE','ALTER','CREATE','GRANT','EXEC'];
            foreach ($blocked as $kw) {
                if (preg_match('/\b' . $kw . '\b/i', $cleanSql)) {
                    jsonResponse(['error' => "Comando '$kw' não permitido"], 400);
                }
            }

            try {
                $pdo = DB::conn();

                // Executa diretamente — PDO MySQL suporta multi-statement separado por ;
                // mas para segurança, vamos contar affected rows via exec
                $affected = $pdo->exec($cleanSql);

                if ($affected === false) {
                    $err = $pdo->errorInfo();
                    jsonResponse(['error' => 'Erro SQL: ' . ($err[2] ?? 'desconhecido')], 500);
                }

                jsonResponse(['ok' => true, 'rows_inserted' => (int)$affected]);

            } catch (Exception $e) {
                jsonResponse(['error' => 'Erro ao executar SQL: ' . $e->getMessage()], 500);
            }
        }

        jsonResponse(['error' => 'Método não suportado'], 405);
        break;

    // ── TIMELINE (visualização) ─────────────────────────────
    case 'timeline':
        requireAdmin();

        if ($method === 'GET') {
            $blockId = (int)($_GET['block_id'] ?? 0);
            if (!$blockId) jsonResponse(['error' => 'block_id obrigatório'], 400);
            jsonResponse(DB::fetchAll(
                'SELECT tm.*,
                        COALESCE(b.name, np.first_name, \'\') as bot_name,
                        COALESCE(a2.name, a.name, \'\')       as archetype_name
                 FROM timeline_messages tm
                 LEFT JOIN bots       b  ON b.id  = tm.bot_id
                 LEFT JOIN archetypes a  ON a.id  = b.archetype_id
                 LEFT JOIN archetypes a2 ON a2.id = tm.archetype_id
                 LEFT JOIN name_pool  np ON np.archetype_id = tm.archetype_id AND np.id = (
                     SELECT id FROM name_pool WHERE archetype_id = tm.archetype_id LIMIT 1
                 )
                 WHERE tm.block_id = ?
                 ORDER BY tm.sequence_order',
                [$blockId]
            ));
        }

        // PUT /timeline/{msgId} — edita uma mensagem individual
        if ($method === 'PUT' && isset($parts[1])) {
            $msgId = (int)$parts[1];
            $allowed_types = ['statement','question','answer','tip','reaction','vacuum_question'];
            $type  = in_array($body['message_type'] ?? '', $allowed_types) ? $body['message_type'] : null;
            $sql   = 'UPDATE timeline_messages SET ';
            $sets  = [];
            $params = [];
            if (!empty($body['content']))         { $sets[] = 'content = ?';          $params[] = trim($body['content']); }
            if ($type)                             { $sets[] = 'message_type = ?';     $params[] = $type; }
            if (isset($body['delay_after_prev']))  { $sets[] = 'delay_after_prev = ?'; $params[] = max(1, (int)$body['delay_after_prev']); }
            if (isset($body['sequence_order']))    { $sets[] = 'sequence_order = ?';   $params[] = (int)$body['sequence_order']; }
            if (isset($body['archetype_id']))      { $sets[] = 'archetype_id = ?';     $params[] = $body['archetype_id'] ? (int)$body['archetype_id'] : null; }
            if (empty($sets)) jsonResponse(['error' => 'Nenhum campo para atualizar'], 400);
            $params[] = $msgId;
            DB::query($sql . implode(', ', $sets) . ' WHERE id = ?', $params);
            jsonResponse(['ok' => true]);
        }

        // DELETE /timeline/{blockId} — limpa toda a timeline do bloco
        if ($method === 'DELETE' && isset($parts[1])) {
            $sub2 = $parts[2] ?? '';
            if ($sub2 === 'msg') {
                // DELETE /timeline/{blockId}/msg/{msgId} — remove mensagem individual
                $msgId = (int)($parts[3] ?? 0);
                if (!$msgId) jsonResponse(['error' => 'msgId obrigatório'], 400);
                DB::query('DELETE FROM timeline_messages WHERE id = ?', [$msgId]);
            } else {
                DB::query('DELETE FROM timeline_messages WHERE block_id = ?', [(int)$parts[1]]);
                DB::query("UPDATE blocks SET status = 'pending' WHERE id = ?", [(int)$parts[1]]);
            }
            jsonResponse(['ok' => true]);
        }

        jsonResponse(['error' => 'Método não suportado'], 405);
        break;

    // ── ANALYTICS ───────────────────────────────────────────
    case 'analytics':
        requireAdmin();

        $roomId = (int)($_GET['room_id'] ?? 0);
        if (!$roomId) jsonResponse(['error' => 'room_id obrigatório'], 400);

        $views = DB::fetch(
            "SELECT COUNT(*) as total, COUNT(DISTINCT visitor_fingerprint) as unique_visitors
             FROM room_analytics WHERE room_id = ? AND event_type = 'view'",
            [$roomId]
        );

        $byDay = DB::fetchAll(
            "SELECT DATE(created_at) as day, COUNT(*) as visits
             FROM room_analytics WHERE room_id = ? AND event_type = 'view'
             GROUP BY DATE(created_at) ORDER BY day DESC LIMIT 30",
            [$roomId]
        );

        $topBlocks = DB::fetchAll(
            'SELECT bl.name, COUNT(rm.id) as messages
             FROM room_messages rm JOIN blocks bl ON bl.id = rm.block_id
             WHERE rm.room_id = ? GROUP BY bl.id ORDER BY messages DESC',
            [$roomId]
        );

        jsonResponse([
            'views'      => $views,
            'by_day'     => $byDay,
            'top_blocks' => $topBlocks,
            'room_stats' => ChatEngine::getRoomStats($roomId),
        ]);
        break;

    // ── SETTINGS ────────────────────────────────────────────
    case 'settings':
        requireAdmin();

        $allowedKeys = ['messages_per_page', 'timezone', 'admin_token', 'cron_token'];

        if ($method === 'GET') {
            $result = [];
            foreach ($allowedKeys as $k) {
                $v          = getSetting($k);
                // Mascara a API key
                $masked = ['admin_token', 'cron_token'];
                $result[$k] = (in_array($k, $masked) && !empty($v)) ? '••••••••' : $v;
            }
            jsonResponse($result);
        }

        if ($method === 'POST') {
            foreach ($body as $k => $v) {
                if (in_array($k, $allowedKeys) && !empty($v)) {
                    setSetting($k, (string)$v);
                }
            }
            jsonResponse(['ok' => true]);
        }

        jsonResponse(['error' => 'Método não suportado'], 405);
        break;

    // ── CRON MANUAL ─────────────────────────────────────────
    case 'cron':
        $token = $_GET['token'] ?? '';
        $saved = getSetting('cron_token');
        if ($saved && $token !== $saved) {
            jsonResponse(['error' => 'Forbidden'], 403);
        }
        $result = ChatEngine::tick();
        jsonResponse(['posted' => count($result), 'messages' => $result]);
        break;

    // ── PING / HEALTH CHECK ─────────────────────────────────
    case 'ping':
        jsonResponse(['status' => 'ok', 'version' => APP_VERSION, 'ts' => time()]);
        break;

    default:
        jsonResponse(['error' => '404 Not Found', 'path' => $path], 404);
}
