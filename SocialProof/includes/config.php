<?php
// ============================================================
// config.php — Social Proof Engine
// Banco: Railway MySQL
// ============================================================

define('APP_VERSION', '2.0.0');
define('CLAUDE_MODEL', 'claude-opus-4-5');

date_default_timezone_set('America/Sao_Paulo');

// ============================================================
// BANCO DE DADOS — Railway
// ============================================================
define('DB_HOST', getenv('DB_HOST') ?: 'crossover.proxy.rlwy.net');
define('DB_PORT', getenv('DB_PORT') ?: '23106');
define('DB_NAME', getenv('DB_NAME') ?: 'railway');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: 'ZREOGQmHkceFYdtDSKtVgdjEvPPxdWOu');

// ============================================================
// Database — Singleton PDO
// ============================================================
class DB {
    private static $instance = null;

    public static function conn(): PDO {
        if (self::$instance === null) {
            try {
                self::$instance = new PDO(
                    'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                    DB_USER,
                    DB_PASS,
                    [
                        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES   => false,
                        PDO::ATTR_TIMEOUT            => 10,
                    ]
                );
                self::$instance->exec("SET time_zone = '-03:00'");
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                die(json_encode([
                    'error'   => 'Database connection failed',
                    'details' => $e->getMessage(),
                ], JSON_UNESCAPED_UNICODE));
            }
        }
        return self::$instance;
    }

    public static function fetch(string $sql, array $params = []): ?array {
        $stmt = self::conn()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch() ?: null;
    }

    public static function fetchAll(string $sql, array $params = []): array {
        $stmt = self::conn()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function insert(string $sql, array $params = []): string {
        $stmt = self::conn()->prepare($sql);
        $stmt->execute($params);
        return self::conn()->lastInsertId();
    }

    public static function query(string $sql, array $params = []): bool {
        $stmt = self::conn()->prepare($sql);
        return $stmt->execute($params);
    }

    public static function execute(string $sql, array $params = []): bool {
        return self::query($sql, $params);
    }
}

// ============================================================
// Helpers globais
// ============================================================
function getSetting(string $key): string {
    try {
        $row = DB::fetch('SELECT `value` FROM settings WHERE `key` = ?', [$key]);
        return $row ? (string)$row['value'] : '';
    } catch (Exception $e) {
        return '';
    }
}

function setSetting(string $key, string $value): void {
    DB::query(
        'INSERT INTO settings (`key`, `value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=?, updated_at=NOW()',
        [$key, $value, $value]
    );
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
