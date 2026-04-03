#!/usr/bin/env bash
# =============================================================================
#  INSTALADOR PRODUÇÃO — SaaS Dieta Milenar (HARDENED)
#  Reexecução segura, sem curl|bash, sem PM2 root, sem phpMyAdmin exposto
# =============================================================================

set -euo pipefail
IFS=$'\n\t'
umask 027

# ─── Cores ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()    { printf "%b\n" "${GREEN}[✔]${NC} $*"; }
warn()   { printf "%b\n" "${YELLOW}[⚠]${NC} $*"; }
die()    { printf "%b\n" "${RED}[✘]${NC} $*" >&2; exit 1; }
header() { printf "\n%b\n%b\n%b\n" \
  "${BOLD}${CYAN}══════════════════════════════════════════${NC}" \
  "${BOLD}${CYAN}  $*${NC}" \
  "${BOLD}${CYAN}══════════════════════════════════════════${NC}"; }

on_err() { die "Falha na linha $1 (cmd: $2)"; }
trap 'on_err "$LINENO" "$BASH_COMMAND"' ERR

# ─── Root ─────────────────────────────────────────────────────────────────────
[[ ${EUID:-999} -eq 0 ]] || die "Execute como root: sudo bash install.sh"

# ─── Lock anti-concorrência ───────────────────────────────────────────────────
install -d -m 0755 /run/lock
exec 9>/run/lock/dieta-milenar-install.lock
flock -n 9 || die "Instalador já está rodando (lock /run/lock/dieta-milenar-install.lock)"

# ─── Paths ────────────────────────────────────────────────────────────────────
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_SRC="$REPO_DIR/DietaMilelar"
SOCIALPROOF_SRC="$REPO_DIR/SocialProof"

[[ -d "$PROJECT_SRC" ]] || die "Pasta 'DietaMilelar' não encontrada em: $REPO_DIR"

INSTALL_DIR="/var/www/dieta-milenar"
SOCIALPROOF_DIR="/var/www/socialproof"
APP_PORT=3000

APP_USER="dieta"
APP_GROUP="dieta"

# ─── Helpers ──────────────────────────────────────────────────────────────────
require_cmd() { command -v "$1" >/dev/null 2>&1 || die "Comando ausente: $1"; }

is_valid_db_ident() { [[ "$1" =~ ^[A-Za-z0-9_]{1,32}$ ]]; }
is_valid_domain() {
  # hostname ASCII, sem scheme/paths; aceita subdomínios
  [[ "$1" =~ ^([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$ ]]
}
is_valid_ipv4() { [[ "$1" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; }

sql_escape_literal() {
  # Escape seguro para literal SQL em aspas simples
  local s="$1"
  s="${s//\\/\\\\}"
  s="${s//\'/\'\'}"
  printf "%s" "$s"
}

curl_ip() {
  local url="$1"
  curl -fsS --proto '=https' --tlsv1.2 --max-time 5 --retry 2 --retry-delay 1 "$url" 2>/dev/null | tr -d '[:space:]' || true
}

# =============================================================================
#  ETAPA 0 — CONFIGURAÇÃO INTERATIVA
# =============================================================================
header "CONFIGURAÇÃO DO SISTEMA"

require_cmd curl
require_cmd openssl

echo -e "${BOLD}Detectando IP público da máquina...${NC}"

PUBLIC_IP=""
for SERVICE in \
  "https://api.ipify.org" \
  "https://ipecho.net/plain" \
  "https://checkip.amazonaws.com"
do
  PUBLIC_IP="$(curl_ip "$SERVICE")"
  if is_valid_ipv4 "$PUBLIC_IP"; then break; fi
  PUBLIC_IP=""
done

if [[ -z "$PUBLIC_IP" ]]; then
  warn "Falha ao detectar IP público. Usando IP local (fallback)."
  PUBLIC_IP="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
  is_valid_ipv4 "$PUBLIC_IP" || die "Não foi possível determinar IP (público ou local)."
fi

echo -e "  IP detectado: ${CYAN}${BOLD}$PUBLIC_IP${NC}\n"

read -rp "  Usar domínio (recomendado) no lugar do IP? [s/N]: " USE_DOMAIN
USE_SSL=false
DOMAIN="$PUBLIC_IP"

if [[ "$USE_DOMAIN" =~ ^[sS]$ ]]; then
  read -rp "  Domínio (ex: meusite.com.br): " DOMAIN_RAW
  DOMAIN_RAW="$(printf "%s" "$DOMAIN_RAW" | tr -d '[:space:]' | sed -E 's#^https?://##; s#/.*$##')"
  is_valid_domain "$DOMAIN_RAW" || die "Domínio inválido: '$DOMAIN_RAW'"
  DOMAIN="$DOMAIN_RAW"
  USE_SSL=true
  log "Usando domínio: $DOMAIN"
else
  log "Usando IP: $DOMAIN"
fi

echo ""
echo -e "${BOLD}Configuração do Banco de Dados:${NC}\n"

read -rp "  Nome do banco [padrão: dieta_milenar]: " DB_NAME
DB_NAME="${DB_NAME:-dieta_milenar}"
is_valid_db_ident "$DB_NAME" || die "DB_NAME inválido (use [A-Za-z0-9_], máx 32)."

read -rp "  Usuário MySQL [padrão: dieta_user]: " DB_USER
DB_USER="${DB_USER:-dieta_user}"
is_valid_db_ident "$DB_USER" || die "DB_USER inválido (use [A-Za-z0-9_], máx 32)."

while true; do
  read -rsp "  Senha MySQL (oculta): " DB_PASS; echo
  [[ -n "$DB_PASS" ]] && break
  warn "Senha vazia proibida."
done

echo ""
echo -e "${BOLD}Segurança:${NC}\n"
read -rp "  JWT Secret [Enter = gerar]: " JWT_SECRET
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
log "JWT Secret configurado"

echo ""
read -rp "  Stripe Secret Key [sk_live_/sk_test_ | Enter = pular]: " STRIPE_KEY
if [[ -z "$STRIPE_KEY" ]]; then
  warn "Stripe não configurado (ajuste no .env depois)."
  STRIPE_KEY="sk_test_PLACEHOLDER"
fi

echo ""
echo -e "${BOLD}phpMyAdmin:${NC}\n"
read -rp "  Instalar phpMyAdmin? (N recomendado em produção) [s/N]: " INSTALL_PMA
INSTALL_PMA="${INSTALL_PMA:-N}"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║        Resumo da Configuração            ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
echo -e "  Endereço:      ${CYAN}$DOMAIN${NC}"
echo -e "  Backend:       ${CYAN}127.0.0.1:${APP_PORT}${NC}"
echo -e "  Nginx:         ${CYAN}80${NC}"
echo -e "  Banco:         ${CYAN}$DB_NAME${NC}"
echo -e "  Usuário DB:    ${CYAN}$DB_USER${NC}"
echo -e "  App dir:       ${CYAN}$INSTALL_DIR${NC}"
echo -e "  SocialProof:   ${CYAN}$SOCIALPROOF_DIR${NC}"
if [[ "$INSTALL_PMA" =~ ^[sS]$ ]]; then
  echo -e "  phpMyAdmin:    ${CYAN}SIM (restrito por IP)${NC}"
else
  echo -e "  phpMyAdmin:    ${CYAN}NÃO${NC}"
fi
echo ""

read -rp "Confirmar e iniciar instalação? [s/N]: " CONFIRM
[[ "$CONFIRM" =~ ^[sS]$ ]] || { echo "Instalação cancelada."; exit 0; }

# =============================================================================
#  ETAPA 1 — DEPENDÊNCIAS DO SISTEMA
# =============================================================================
header "ETAPA 1 — Dependências do sistema"

export DEBIAN_FRONTEND=noninteractive

# Libera porta 80 se apache2 ativo (sem purge)
if systemctl is-active --quiet apache2 2>/dev/null; then
  warn "Apache2 ativo. Parando e desabilitando para liberar porta 80."
  systemctl stop apache2
  systemctl disable apache2 >/dev/null 2>&1 || true
fi

apt-get update -qq
apt-get install -y -qq --no-install-recommends \
  ca-certificates gnupg \
  curl git unzip rsync \
  nginx \
  mysql-server \
  openssl \
  build-essential \
  php php-fpm php-mbstring php-zip php-gd php-curl php-mysql

log "Pacotes base instalados"

# ─── Node.js 20 (sem curl|bash) ───────────────────────────────────────────────
need_node_install=true
if command -v node >/dev/null 2>&1; then
  node_major="$(node -v | sed -E 's/^v([0-9]+).*/\1/')"
  if [[ "$node_major" =~ ^[0-9]+$ ]] && (( node_major >= 20 )); then
    need_node_install=false
  fi
fi

if $need_node_install; then
  header "Node.js 20 — Configurando repositório assinado"
  install -d -m 0755 /etc/apt/keyrings
  curl -fsS --proto '=https' --tlsv1.2 https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  chmod 0644 /etc/apt/keyrings/nodesource.gpg

  codename="$(. /etc/os-release; echo "${VERSION_CODENAME}")"
  cat >/etc/apt/sources.list.d/nodesource.list <<EOF
deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x ${codename} main
EOF

  apt-get update -qq
  apt-get install -y -qq --no-install-recommends nodejs
fi

log "Node: $(node -v) | npm: $(npm -v)"

# ─── Usuário de aplicação (não-root) ─────────────────────────────────────────
if ! id -u "$APP_USER" >/dev/null 2>&1; then
  useradd --system --home-dir /var/lib/"$APP_USER" --create-home \
    --shell /usr/sbin/nologin --user-group "$APP_USER"
  log "Usuário criado: $APP_USER"
fi

# ─── PM2 global (instalado, mas execução via usuário app) ─────────────────────
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2 --silent
fi
log "PM2: $(pm2 -v)"

# =============================================================================
#  ETAPA 2 — MySQL
# =============================================================================
header "ETAPA 2 — MySQL"

systemctl enable mysql >/dev/null
systemctl start mysql

# Conectividade root (socket)
MYSQL_ROOT=( mysql --protocol=socket -u root )
if ! "${MYSQL_ROOT[@]}" -e "SELECT 1" >/dev/null 2>&1; then
  die "Não consegui conectar como root via socket. Ajuste auth do MySQL (root unix_socket) ou configure root password e rode novamente."
fi

DB_PASS_ESC="$(sql_escape_literal "$DB_PASS")"

"${MYSQL_ROOT[@]}" <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS \`socialproof\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS_ESC}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS_ESC}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON \`socialproof\`.* TO '${DB_USER}'@'localhost';

CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS_ESC}';
ALTER USER '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS_ESC}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`socialproof\`.* TO '${DB_USER}'@'127.0.0.1';

FLUSH PRIVILEGES;
SQL

log "MySQL OK (DBs + usuário idempotente com senha atualizada)"

# =============================================================================
#  ETAPA 3 — phpMyAdmin (opcional, restrito)
# =============================================================================
PHP_VERSION="$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null || true)"
[[ -n "$PHP_VERSION" ]] || die "PHP indisponível após instalação"

PHP_FPM_SOCK="/var/run/php/php${PHP_VERSION}-fpm.sock"
systemctl enable "php${PHP_VERSION}-fpm" >/dev/null 2>&1 || true
systemctl start  "php${PHP_VERSION}-fpm" >/dev/null 2>&1 || true

PMA_DIR="/var/www/phpmyadmin"
PMA_VERSION="5.2.1"

if [[ "$INSTALL_PMA" =~ ^[sS]$ ]]; then
  header "ETAPA 3 — phpMyAdmin (restrito por IP)"
  PMA_ZIP="/tmp/phpmyadmin.zip"

  if [[ ! -d "$PMA_DIR" ]]; then
    curl -fsS --proto '=https' --tlsv1.2 \
      "https://files.phpmyadmin.net/phpMyAdmin/${PMA_VERSION}/phpMyAdmin-${PMA_VERSION}-all-languages.zip" \
      -o "$PMA_ZIP"
    rm -rf /tmp/pma_extract
    unzip -q "$PMA_ZIP" -d /tmp/pma_extract
    mv "/tmp/pma_extract/phpMyAdmin-${PMA_VERSION}-all-languages" "$PMA_DIR"
    rm -f "$PMA_ZIP"
    rm -rf /tmp/pma_extract
  fi

  # Config só se não existir (idempotência real)
  if [[ ! -f "$PMA_DIR/config.inc.php" ]]; then
    PMA_BLOWFISH="$(openssl rand -hex 32)"
    cat >"$PMA_DIR/config.inc.php" <<PMACONF
<?php
\$cfg['blowfish_secret'] = '${PMA_BLOWFISH}';
\$i = 1;
\$cfg['Servers'][\$i]['auth_type']       = 'cookie';
\$cfg['Servers'][\$i]['host']            = '127.0.0.1';
\$cfg['Servers'][\$i]['port']            = '3306';
\$cfg['Servers'][\$i]['connect_type']    = 'tcp';
\$cfg['Servers'][\$i]['AllowNoPassword'] = false;
PMACONF
  fi

  install -d -m 0750 -o www-data -g www-data "$PMA_DIR/tmp"
  chown -R www-data:www-data "$PMA_DIR"
  chmod -R o-rwx "$PMA_DIR"

  # IP permitido: IP do SSH client (se existir); senão, bloqueia geral exceto localhost
  ADMIN_IP="127.0.0.1"
  if [[ -n "${SSH_CONNECTION:-}" ]]; then
    ADMIN_IP="$(awk '{print $1}' <<<"$SSH_CONNECTION")"
    is_valid_ipv4 "$ADMIN_IP" || ADMIN_IP="127.0.0.1"
  fi

  log "phpMyAdmin instalado; acesso permitido apenas para: $ADMIN_IP e 127.0.0.1"
else
  header "ETAPA 3 — phpMyAdmin"
  log "Ignorado (recomendado em produção)."
fi

# =============================================================================
#  ETAPA 4 — Deploy de arquivos
# =============================================================================
header "ETAPA 4 — Movendo arquivos do projeto"

install -d -m 0750 -o "$APP_USER" -g "$APP_GROUP" "$INSTALL_DIR"
rsync -a --delete \
  --exclude='node_modules' --exclude='.git' --exclude='dist' \
  "$PROJECT_SRC/" "$INSTALL_DIR/"
chown -R "$APP_USER":"$APP_GROUP" "$INSTALL_DIR"

if [[ -d "$SOCIALPROOF_SRC" ]]; then
  install -d -m 0750 -o www-data -g www-data "$SOCIALPROOF_DIR"
  rsync -a --delete --exclude='.git' --exclude='DataBaseFULL' \
    "$SOCIALPROOF_SRC/" "$SOCIALPROOF_DIR/"
  chown -R www-data:www-data "$SOCIALPROOF_DIR"
  chmod -R o-rwx "$SOCIALPROOF_DIR"

  # config.php (sobrescreve de forma controlada)
  install -d -m 0750 -o www-data -g www-data "$SOCIALPROOF_DIR/includes"
  cat >"$SOCIALPROOF_DIR/includes/config.php" <<SPCONF
<?php
define('APP_VERSION', '2.0.0');
date_default_timezone_set('America/Sao_Paulo');

define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'socialproof');
define('DB_USER', '${DB_USER}');
define('DB_PASS', '${DB_PASS}');

class DB {
    private static \$instance = null;
    public static function conn(): PDO {
        if (self::\$instance === null) {
            self::\$instance = new PDO(
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
            self::\$instance->exec("SET time_zone = '-03:00'");
        }
        return self::\$instance;
    }
}
SPCONF
  chown www-data:www-data "$SOCIALPROOF_DIR/includes/config.php"
  chmod 0640 "$SOCIALPROOF_DIR/includes/config.php"
  log "SocialProof OK"
else
  warn "SocialProof ausente — pulando."
fi

install -d -m 0770 -o www-data -g "$APP_GROUP" "$INSTALL_DIR/public/e-books" \
  "$INSTALL_DIR/public/proofs" "$INSTALL_DIR/public/img" "$INSTALL_DIR/socialmembers"

install -d -m 0750 -o "$APP_USER" -g "$APP_GROUP" /var/log/dieta-milenar

# =============================================================================
#  ETAPA 5 — .env
# =============================================================================
header "ETAPA 5 — .env"

cat >"$INSTALL_DIR/.env" <<ENV
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
DB_NAME=${DB_NAME}

JWT_SECRET=${JWT_SECRET}

STRIPE_SECRET_KEY=${STRIPE_KEY}

PORT=${APP_PORT}
NODE_ENV=production
ENV

chown "$APP_USER":"$APP_GROUP" "$INSTALL_DIR/.env"
chmod 0640 "$INSTALL_DIR/.env"
log ".env OK (0640, dono ${APP_USER})"

# =============================================================================
#  ETAPA 6 — NPM install + build
# =============================================================================
header "ETAPA 6 — Build"

CHAT_WIDGET="$INSTALL_DIR/src/components/ChatWidget.tsx"
if [[ -f "$CHAT_WIDGET" ]]; then
  SOCIALPROOF_WIDGET_URL="http://${DOMAIN}/socialproof/widget/index.php?room=dieta-faraonica"
  # escape p/ sed
  esc_from='https://socialproof-production\.up\.railway\.app/widget/index\.php\?room=dieta-faraonica'
  esc_to="$(printf '%s' "$SOCIALPROOF_WIDGET_URL" | sed -e 's/[\/&]/\\&/g')"
  sed -i -E "s#${esc_from}#${esc_to}#g" "$CHAT_WIDGET"
fi

# install deps como usuário de app (evita root-owned node_modules)
cd "$INSTALL_DIR"
if [[ -f package-lock.json ]]; then
  sudo -u "$APP_USER" -g "$APP_GROUP" npm ci --silent
else
  sudo -u "$APP_USER" -g "$APP_GROUP" npm install --silent
fi

sudo -u "$APP_USER" -g "$APP_GROUP" npm run build

[[ -f "$INSTALL_DIR/dist/index.html" ]] || die "Build falhou (dist/index.html ausente)."

# prune dev deps pós-build
sudo -u "$APP_USER" -g "$APP_GROUP" npm prune --omit=dev --silent

log "Build OK"

# =============================================================================
#  ETAPA 7 — Import schema (sem ocultar erro)
# =============================================================================
header "ETAPA 7 — Banco: import"

mysql_app=( mysql --protocol=tcp -h 127.0.0.1 -u "$DB_USER" --password="$DB_PASS" )

SQL_FILE="$(find "$INSTALL_DIR" -maxdepth 4 -iname "db_atual.sql" -print -quit 2>/dev/null || true)"
if [[ -z "$SQL_FILE" ]]; then
  SQL_FILE="$(find "$INSTALL_DIR" -maxdepth 4 -iname "*.sql" 2>/dev/null | grep -iv migration | head -1 || true)"
fi

if [[ -n "$SQL_FILE" ]]; then
  log "Importando: $SQL_FILE"
  "${mysql_app[@]}" "$DB_NAME" <"$SQL_FILE"
  log "Import OK"
else
  warn "Nenhum SQL base encontrado."
fi

# migrations: aplica, e se falhar -> aborta (produção)
for migration in "DataBase/migration_tickets.sql" "DataBase/migration_payment_proof.sql"; do
  if [[ -f "$INSTALL_DIR/$migration" ]]; then
    log "Aplicando migration: $migration"
    "${mysql_app[@]}" "$DB_NAME" <"$INSTALL_DIR/$migration"
  fi
done

if [[ -d "$SOCIALPROOF_DIR" ]]; then
  SP_SQL="$(find "$SOCIALPROOF_DIR" -maxdepth 4 -iname "dbsp_atual.sql" -print -quit 2>/dev/null || true)"
  if [[ -n "$SP_SQL" ]]; then
    log "Import SocialProof: $SP_SQL"
    "${mysql_app[@]}" socialproof <"$SP_SQL"
  else
    warn "dbsp_atual.sql não encontrado (SocialProof)."
  fi
fi

# =============================================================================
#  ETAPA 8 — PM2 (usuário app)
# =============================================================================
header "ETAPA 8 — PM2"

cat >"$INSTALL_DIR/ecosystem.config.cjs" <<PM2
module.exports = {
  apps: [{
    name: 'dieta-milenar',
    script: 'server.ts',
    interpreter: 'node',
    interpreter_args: '--import tsx/esm',
    cwd: '${INSTALL_DIR}',
    exec_mode: 'fork',
    instances: 1,
    env: { NODE_ENV: 'production' },
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    error_file: '/var/log/dieta-milenar/error.log',
    out_file:   '/var/log/dieta-milenar/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
PM2

chown "$APP_USER":"$APP_GROUP" "$INSTALL_DIR/ecosystem.config.cjs"

# pm2 como usuário app (idempotente)
sudo -u "$APP_USER" -g "$APP_GROUP" pm2 stop dieta-milenar >/dev/null 2>&1 || true
sudo -u "$APP_USER" -g "$APP_GROUP" pm2 delete dieta-milenar >/dev/null 2>&1 || true
sudo -u "$APP_USER" -g "$APP_GROUP" pm2 start "$INSTALL_DIR/ecosystem.config.cjs" --env production
sudo -u "$APP_USER" -g "$APP_GROUP" pm2 save

# integra com systemd (sem root app)
pm2 startup systemd -u "$APP_USER" --hp /var/lib/"$APP_USER" >/dev/null 2>&1 || true

log "PM2 OK (usuário ${APP_USER})"

# =============================================================================
#  ETAPA 9 — Nginx
# =============================================================================
header "ETAPA 9 — Nginx"

rm -f /etc/nginx/sites-enabled/default

# Determina IP admin p/ phpMyAdmin (se habilitado)
ADMIN_IP="127.0.0.1"
if [[ -n "${SSH_CONNECTION:-}" ]]; then
  ADMIN_IP="$(awk '{print $1}' <<<"$SSH_CONNECTION")"
  is_valid_ipv4 "$ADMIN_IP" || ADMIN_IP="127.0.0.1"
fi

cat >"/etc/nginx/sites-available/dieta-milenar" <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    client_max_body_size 110M;

    access_log /var/log/nginx/dieta-milenar.access.log;
    error_log  /var/log/nginx/dieta-milenar.error.log;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

NGINX

if [[ "$INSTALL_PMA" =~ ^[sS]$ ]]; then
  cat >>"/etc/nginx/sites-available/dieta-milenar" <<NGINX
    # ── phpMyAdmin (RESTRITO) ─────────────────────────────
    location ^~ /phpmyadmin/ {
        allow 127.0.0.1;
        allow ${ADMIN_IP};
        deny all;

        root /var/www;
        index index.php index.html;

        location ~ ^/phpmyadmin/(.+\.php)$ {
            try_files \$uri =404;
            root /var/www;
            fastcgi_pass unix:${PHP_FPM_SOCK};
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            include fastcgi_params;
        }

        location ~* ^/phpmyadmin/(.+\.(jpg|jpeg|gif|css|png|js|ico|html|xml|txt))$ {
            root /var/www;
        }
    }
NGINX
fi

cat >>"/etc/nginx/sites-available/dieta-milenar" <<NGINX

    # ── SocialProof (PHP) ─────────────────────────────────
    location ^~ /socialproof/ {
        root /var/www;
        index index.php index.html;
        try_files \$uri \$uri/ /socialproof/index.php\$is_args\$args;

        location ~ ^/socialproof/.+\.php$ {
            root /var/www;
            try_files \$uri =404;
            fastcgi_pass unix:${PHP_FPM_SOCK};
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            include fastcgi_params;
        }
    }

    # ── Proxy Node (API + SPA) ────────────────────────────
    location / {
        proxy_pass         http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/dieta-milenar /etc/nginx/sites-enabled/dieta-milenar

nginx -t
systemctl enable nginx >/dev/null
systemctl reload nginx 2>/dev/null || systemctl start nginx

log "Nginx OK"

# =============================================================================
#  ETAPA 10 — SSL (somente domínio)
# =============================================================================
if $USE_SSL; then
  header "ETAPA 10 — SSL (Certbot)"
  apt-get install -y -qq --no-install-recommends certbot python3-certbot-nginx

  # email fixo evita "admin@domínio" inválido
  read -rp "  E-mail p/ Let's Encrypt (obrigatório): " LE_EMAIL
  [[ "$LE_EMAIL" =~ ^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$ ]] || die "E-mail inválido."

  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$LE_EMAIL"
  log "SSL OK"
else
  header "ETAPA 10 — SSL"
  warn "SSL não aplicável em IP direto."
fi

# =============================================================================
#  FINAL
# =============================================================================
header "INSTALAÇÃO CONCLUÍDA"

echo -e "  App:          http://${DOMAIN}"
if [[ "$INSTALL_PMA" =~ ^[sS]$ ]]; then
  echo -e "  phpMyAdmin:   http://${DOMAIN}/phpmyadmin/ (restrito por IP)"
fi
echo -e "  App dir:      ${INSTALL_DIR}"
echo -e "  Logs app:     /var/log/dieta-milenar"
echo -e "  PM2:          sudo -u ${APP_USER} pm2 status"

# PROIBIDO: remover $REPO_DIR automaticamente (risco produção)
log "Instalador finalizado (não removeu diretório de origem)."