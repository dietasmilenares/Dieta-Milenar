<?php
// ============================================================
// config.php — Social Proof Engine
// Suporta MySQL e SQLite — alterne via DB_USE_SQLITE abaixo
// ============================================================

define('APP_VERSION', '2.0.0');
define('CLAUDE_MODEL', 'claude-opus-4-5');

date_default_timezone_set('America/Sao_Paulo');

// ============================================================
// MOTOR DE BANCO DE DADOS
// true  = SQLite (sem servidor, arquivo local — ideal para
//         hosts sem MySQL como SmarterASP, shared gratuitos)
// false = MySQL (localhost, InfinityFree, Hostgator, etc.)
// ============================================================
define('DB_USE_SQLITE', false);

// ============================================================
// CONFIGURAÇÕES MySQL (usado quando DB_USE_SQLITE = false)
// ============================================================
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'socialproof3');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// ============================================================
// CONFIGURAÇÕES SQLite (usado quando DB_USE_SQLITE = true)
// Caminho do arquivo .db — deve ficar fora da pasta pública
// se possível, ou numa pasta com .htaccess protegendo.
// ============================================================
define('DB_SQLITE_PATH', __DIR__ . '/../database/socialproof.db');

// ============================================================
// Database — Singleton PDO (MySQL + SQLite transparente)
// Métodos: conn(), fetch(), fetchAll(), insert(), query()
// ============================================================
class DB {
    private static $instance = null;

    public static function conn(): PDO {
        if (self::$instance === null) {
            try {
                if (DB_USE_SQLITE) {
                    // Garante que a pasta existe
                    $dir = dirname(DB_SQLITE_PATH);
                    if (!is_dir($dir)) mkdir($dir, 0755, true);

                    self::$instance = new PDO('sqlite:' . DB_SQLITE_PATH, null, null, [
                        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    ]);

                    // SQLite: habilitar foreign keys (desligado por padrão)
                    self::$instance->exec('PRAGMA foreign_keys = ON');
                    self::$instance->exec('PRAGMA journal_mode = WAL');

                } else {
                    self::$instance = new PDO(
                        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                        DB_USER,
                        DB_PASS,
                        [
                            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                            PDO::ATTR_EMULATE_PREPARES   => false,
                        ]
                    );
                }
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                die(json_encode([
                    'error'   => 'Database connection failed',
                    'details' => $e->getMessage(),
                    'driver'  => DB_USE_SQLITE ? 'sqlite' : 'mysql',
                ], JSON_UNESCAPED_UNICODE));
            }
        }
        return self::$instance;
    }

    public static function fetch(string $sql, array $params = []): ?array {
        $sql  = self::adaptSql($sql);
        $stmt = self::conn()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch() ?: null;
    }

    public static function fetchAll(string $sql, array $params = []): array {
        $sql  = self::adaptSql($sql);
        $stmt = self::conn()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function insert(string $sql, array $params = []): string {
        $sql  = self::adaptSql($sql);
        $stmt = self::conn()->prepare($sql);
        $stmt->execute($params);
        return self::conn()->lastInsertId();
    }

    public static function query(string $sql, array $params = []): bool {
        $sql  = self::adaptSql($sql);
        $stmt = self::conn()->prepare($sql);
        return $stmt->execute($params);
    }

    // --------------------------------------------------------
    // adaptSql() — converte sintaxe MySQL → SQLite quando necessário
    // --------------------------------------------------------
    private static function adaptSql(string $sql): string {
        if (!DB_USE_SQLITE) return $sql;

        // NOW() → datetime('now')
        $sql = preg_replace('/\bNOW\(\)/i', "datetime('now')", $sql);

        // DATE_SUB(NOW(), INTERVAL X MINUTE) → datetime('now', '-X minutes')
        $sql = preg_replace_callback(
            '/DATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s+(\d+)\s+MINUTE\s*\)/i',
            fn($m) => "datetime('now', '-{$m[1]} minutes')",
            $sql
        );

        // DATE_SUB(NOW(), INTERVAL X HOUR)
        $sql = preg_replace_callback(
            '/DATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s+(\d+)\s+HOUR\s*\)/i',
            fn($m) => "datetime('now', '-{$m[1]} hours')",
            $sql
        );

        // ON DUPLICATE KEY UPDATE → INSERT OR REPLACE (simplificado para settings)
        $sql = preg_replace('/INSERT INTO(.+?)ON DUPLICATE KEY UPDATE.+/is',
            'INSERT OR REPLACE INTO$1', $sql);

        // Backticks → sem quotes (SQLite não usa backticks)
        $sql = str_replace('`', '', $sql);

        // ORDER BY RAND() → ORDER BY RANDOM()
        $sql = preg_replace('/ORDER BY RAND\(\)/i', 'ORDER BY RANDOM()', $sql);

        // GET_LOCK / RELEASE_LOCK → SQLite não tem, retorna 1 (sem-op)
        $sql = preg_replace('/SELECT GET_LOCK\(.+?\)/i', 'SELECT 1 as locked', $sql);
        $sql = preg_replace('/SELECT RELEASE_LOCK\(.+?\)/i', 'SELECT 1', $sql);

        return $sql;
    }
}

// ============================================================
// Helpers globais
// ============================================================

function getSetting(string $key): string {
    try {
        $col = DB_USE_SQLITE ? 'value' : '`value`';
        $tbl = DB_USE_SQLITE ? 'settings' : '`settings`';
        $k   = DB_USE_SQLITE ? 'key' : '`key`';
        $row = DB::fetch("SELECT $col FROM $tbl WHERE $k = ?", [$key]);
        return $row ? (string)$row['value'] : '';
    } catch (Exception $e) {
        return '';
    }
}

function setSetting(string $key, string $value): void {
    if (DB_USE_SQLITE) {
        DB::query(
            'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))',
            [$key, $value]
        );
    } else {
        DB::query(
            'INSERT INTO settings (`key`, `value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=?, updated_at=NOW()',
            [$key, $value, $value]
        );
    }
}

function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function generateSlug(string $text): string {
    $text = mb_strtolower($text, 'UTF-8');
    $from = ['á','à','ã','â','ä','é','è','ê','ë','í','ì','î','ï','ó','ò','õ','ô','ö','ú','ù','û','ü','ç','ñ'];
    $to   = ['a','a','a','a','a','e','e','e','e','i','i','i','i','o','o','o','o','o','u','u','u','u','c','n'];
    $text = str_replace($from, $to, $text);
    $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
    $text = preg_replace('/[\s-]+/', '-', $text);
    return trim($text, '-');
}

function avatarUrl(string $seed): string {
    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . urlencode($seed)
         . '&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf';
}
