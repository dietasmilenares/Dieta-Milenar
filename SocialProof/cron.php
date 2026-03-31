<?php
// ============================================================
// cron.php — Executado pelo cron job do servidor
// Configurar no cPanel ou crontab:
// */5 * * * * php /caminho/para/socialproof/cron.php >> /tmp/socialproof.log 2>&1
// ============================================================

require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/engine.php';

$start   = microtime(true);
$posted  = ChatEngine::tick();
$elapsed = round(microtime(true) - $start, 3);

echo date('[Y-m-d H:i:s]') . " Tick: " . count($posted) . " mensagens postadas em {$elapsed}s\n";

foreach ($posted as $msg) {
    echo "  → [Bloco {$msg['block_id']}] {$msg['bot_name']}: " . mb_substr($msg['content'], 0, 60) . "\n";
}
