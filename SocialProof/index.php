<?php
// ============================================================
// index.php — Roteador principal
// Funciona na RAIZ (/) e em qualquer SUBPASTA (/socialproof/)
// Funciona COM e SEM mod_rewrite
// Compatível: InfinityFree, Hostgator, localhost (Android/aWebServer)
// ============================================================

require_once __DIR__ . '/includes/config.php';

$uri = $_SERVER['REQUEST_URI'] ?? '/';
$uri = strtok($uri, '?');       // remove query string
$uri = rawurldecode($uri);      // decodifica %20 etc.

// Detecta subpasta automaticamente
// Ex: projeto em /socialproof/ → remove esse prefixo do URI
$scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
if ($scriptDir && strpos($uri, $scriptDir) === 0) {
    $uri = substr($uri, strlen($scriptDir));
}

$uri = trim($uri, '/');

// ── Roteamento ───────────────────────────────────────────────
if ($uri === '' || $uri === 'admin' || $uri === 'admin/index.php') {
    require __DIR__ . '/admin/index.php';

} elseif ($uri === 'widget' || $uri === 'widget/index.php') {
    require __DIR__ . '/widget/index.php';

} elseif (str_starts_with($uri, 'api/') || $uri === 'api') {
    $_GET['path'] = preg_replace('#^api/?#', '', $uri);
    require __DIR__ . '/api/index.php';

} elseif ($uri === 'cron' || $uri === 'cron.php') {
    require __DIR__ . '/cron.php';

} else {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => '404 Not Found', 'uri' => $uri]);
}
