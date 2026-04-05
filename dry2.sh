#!/bin/bash
# =============================================================================
#  SaaS DIETA MILENAR — INSTALADOR OFICIAL v1.2.1 (PROD HARDENED)
#  Suporte: Ubuntu 20.04+ / Debian 11+ | Modo: Idempotente
# =============================================================================

set -euo pipefail
IFS=$'\n\t'
umask 022

# --- CONFIGURAÇÃO DE LOGS ---
LOG_FILE="/var/log/dieta-milenar-install.log"
touch "$LOG_FILE"
exec > >(tee -a "$LOG_FILE") 2>&1
echo "--- Início da Instalação: $(date) ---" >> "$LOG_FILE"

# --- 1. CORES E ESTILOS ---
GOLD='\033[38;5;220m'; BGDARK='\033[48;5;232m'; BOLD='\033[1m'; NC='\033[0m'
DIM='\033[2m'; CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'

# --- 2. CONFIGURAÇÃO DE LARGURA RESPONSIVA ---
TERM_WIDTH=$(tput cols 2>/dev/null || echo 80)
[[ $TERM_WIDTH -lt 20 ]] && TERM_WIDTH=40

# --- 3. FUNÇÕES DE LAYOUT ---
draw_line() {
    local char=$1; local color=$2; local bg=${3:-}
    echo -ne "${bg}${color}${BOLD}  "
    for ((i=1; i<=$((TERM_WIDTH - 4)); i++)); do echo -n "$char"; done
    echo -e "${NC}"
}

center_print() {
    local text="$1"; local color="$2"
    local pad=$(( (TERM_WIDTH - ${#text}) / 2 ))
    [[ $pad -lt 0 ]] && pad=0
    printf "%*s%b%s%b\n" "$pad" "" "$color" "$text" "$NC"
}

header() {
    echo ""
    draw_line "━" "$CYAN"
    echo -e "  ${BOLD}${CYAN}$1${NC}"
    draw_line "━" "$CYAN"
}

log_status() { echo -e "  ${GREEN}[✔]${NC} $1"; }
log_warn()   { echo -e "  ${YELLOW}[⚠]${NC} $1"; }
log_error()  { echo -e "  ${RED}[✘]${NC} $1"; exit 1; }

# --- 4. HELPERS DE PRODUÇÃO ---
on_err() { log_error "Falha na linha $1 (cmd: $2)"; }
trap 'on_err "$LINENO" "$BASH_COMMAND"' ERR

require_cmd() { command -v "$1" >/dev/null 2>&1 || log_error "Comando ausente: $1"; }

is_valid_db_ident() { [[ "$1" =~ ^[A-Za-z0-9_]{1,32}$ ]]; }
is_valid_domain()   { [[ "$1" =~ ^([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$ ]]; }
is_valid_ipv4()     { [[ "$1" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; }

sql_escape_literal() {
  local s="$1"
  s="${s//\\/\\\\}"
  s="${s//\'/\'\'}"
  printf "%s" "$s"
}

curl_ip() {
  curl -4 -fsS --max-time 3 --retry 2 "$1" 2>/dev/null | grep -oE '^([0-9]{1,3}\.){3}[0-9]{1,3}$' || true
}

# --- 5. VERIFICAÇÕES DE AMBIENTE ---
[[ ${EUID:-999} -eq 0 ]] || log_error "Execute como root: sudo bash install.sh"

install -d -m 0755 /run/lock
exec 9>/run/lock/dieta-milenar-install.lock
flock -n 9 || log_error "Instalador já está rodando (lock /run/lock/dieta-milenar-install.lock)"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_SRC="$REPO_DIR/DietaMilelar"
SOCIALPROOF_SRC="$REPO_DIR/SocialProof"
INSTALL_DIR="/var/www/dieta-milenar"
SOCIALPROOF_DIR="/var/www/socialproof"

[[ -d "$PROJECT_SRC" ]] || log_error "Pasta 'DietaMilelar' não encontrada em $REPO_DIR"

APP_PORT=3000
APP_USER="dieta"
APP_GROUP="dieta"
export DEBIAN_FRONTEND=noninteractive

# =============================================================================
#  TELA 1: CHECKLIST INICIAL
# =============================================================================
clear
echo -e "${BGDARK}${GOLD}${BOLD}"
draw_line "═" "$GOLD" "$BGDARK"
center_print "DIETA MILENAR — INSTALAÇÃO v1.2.1" "${BGDARK}${GOLD}"
draw_line "═" "$GOLD" "$BGDARK"
echo -e "${NC}"

require_cmd curl
require_cmd openssl

echo -e "  ${DIM}Detectando IP público...${NC}"
PUBLIC_IP=""

IP_SERVICES=(
  "https://api.ipify.org"
  "https://ipecho.net/plain"
  "https://checkip.amazonaws.com"
)

for svc in "${IP_SERVICES[@]}"; do
  PUBLIC_IP="$(curl_ip "$svc")"
  if is_valid_ipv4 "$PUBLIC_IP"; then
    break
  fi
  PUBLIC_IP=""
done

if [[ -z "$PUBLIC_IP" ]]; then
  log_warn "Falha ao detectar IP público via web. Usando IP local (fallback)."
  PUBLIC_IP="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
  is_valid_ipv4 "$PUBLIC_IP" || log_error "Não foi possível resolver nenhum IP IPv4 válido."
fi

echo -e "  ${GREEN}[✔]${NC} IP: ${CYAN}${BOLD}${PUBLIC_IP}${NC}\n"

echo -e "${GOLD}${BOLD}  ── 🔍 DEPENDÊNCIAS ${NC}"
draw_line "─" "$GOLD"

chk() {
  case $1 in
    cmd)  command -v "$2" >/dev/null 2>&1 ;;
    mod)  php -m 2>/dev/null | grep -qi "^$2$" ;;
    node) command -v node >/dev/null 2>&1 && [[ $(node -v | sed -E 's/^v([0-9]+).*/\1/') -ge 20 ]] ;;
  esac
}

DEPS=(
  "curl|cmd|curl"        "git|cmd|git"            "unzip|cmd|unzip"
  "nginx|cmd|nginx"      "mysql|cmd|mysql"        "openssl|cmd|openssl"
  "build-essential|cmd|gcc" "php|cmd|php"         "php-fpm|cmd|php-fpm"
  "php-mbstring|mod|mbstring" "php-zip|mod|zip"   "php-gd|mod|gd"
  "php-curl|mod|curl"    "php-mysql|mod|mysqli"   "node>=20|node|node"
  "pm2|cmd|pm2"
)

MISS=0; COLS=3
MISSING_LIST=""
INSTALLED_LIST=""
COL_M=0; COL_I=0

for D in "${DEPS[@]}"; do
  IFS='|' read -r NAME TYPE VAL <<< "$D"
  if chk "$TYPE" "$VAL"; then
    ITEM="${GREEN}[✔]${NC} $(printf '%-16s' "$NAME")"
    INSTALLED_LIST+="  ${ITEM}"
    COL_I=$((COL_I+1))
    [[ $((COL_I % COLS)) -eq 0 ]] && INSTALLED_LIST+="\n"
  else
    ITEM="${RED}[✘]${NC} ${BOLD}$(printf '%-16s' "$NAME")${NC}"
    MISSING_LIST+="  ${ITEM}"
    MISS=$((MISS+1))
    COL_M=$((COL_M+1))
    [[ $((COL_M % COLS)) -eq 0 ]] && MISSING_LIST+="\n"
  fi
done

[[ -n "$MISSING_LIST" ]] && echo -e "${MISSING_LIST}"
[[ -n "$INSTALLED_LIST" ]] && echo -e "${INSTALLED_LIST}"

echo ""
if [[ $MISS -eq 0 ]]; then
  echo -e "  ${GREEN}${BOLD}Todas as dependências satisfeitas.${NC}"
else
  echo -e "  ${YELLOW}[⚠]${NC} ${BOLD}$MISS dependência(s) ausente(s)${NC} — serão instaladas automaticamente."
fi

echo ""
draw_line "─" "$GOLD"
center_print "APERTE ENTER PARA INICIAR CONFIGURAÇÃO" "$GREEN"
read -r -p ""

# =============================================================================
#  TELA 2: ETAPA 0 — INPUTS
# =============================================================================
clear
header "ETAPA 0 — CONFIGURAÇÃO DO SISTEMA"

echo -e "\n  ${BOLD}🌐 CONEXÃO${NC}"
read -rp "  Deseja usar um domínio? [s/N]: " USE_DOMAIN
USE_DOMAIN=${USE_DOMAIN:-n}
DOMAIN="$PUBLIC_IP"
USE_SSL=false

if [[ "$USE_DOMAIN" =~ ^[sS]$ ]]; then
    read -rp "  Digite o domínio (ex: meusite.com): " DOMAIN_RAW
    DOMAIN_RAW="$(echo "$DOMAIN_RAW" | tr -d '[:space:]' | sed -E 's#^https?://##; s#/.*$##')"
    is_valid_domain "$DOMAIN_RAW" || log_error "Domínio inválido: '$DOMAIN_RAW'"
    DOMAIN="$DOMAIN_RAW"
    USE_SSL=true
    read -rp "  E-mail para SSL/Let's Encrypt: " LE_EMAIL
    [[ "$LE_EMAIL" =~ ^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$ ]] || log_error "E-mail inválido."
fi

echo -e "\n  ${BOLD}🗄️  BANCO DE DADOS${NC}"
read -rp "  Nome do banco [dieta_milenar]: " DB_NAME
DB_NAME=${DB_NAME:-dieta_milenar}
is_valid_db_ident "$DB_NAME" || log_error "DB_NAME inválido (use [A-Za-z0-9_], máx 32)."

read -rp "  Usuário MySQL [dieta_user]: " DB_USER
DB_USER=${DB_USER:-dieta_user}
is_valid_db_ident "$DB_USER" || log_error "DB_USER inválido (use [A-Za-z0-9_], máx 32)."

read -rsp "  Senha MySQL (oculta) [root]: " DB_PASS; echo
DB_PASS=${DB_PASS:-root}

echo -e "\n  ${BOLD}💳 PAGAMENTOS${NC}"
read -rp "  Stripe Secret Key [Enter = pular]: " STRIPE_KEY
STRIPE_KEY=${STRIPE_KEY:-sk_test_PLACEHOLDER}

echo -e "\n  ${BOLD}🔐 SEGURANÇA${NC}"
read -rp "  JWT Secret [Enter = gerar automaticamente]: " JWT_SECRET
JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 32)}

echo -e "\n  ${BOLD}🧰 PHPMYADMIN${NC}"
read -rp "  Instalar phpMyAdmin? [S/n]: " INSTALL_PMA
INSTALL_PMA=${INSTALL_PMA:-s}

# =============================================================================
#  TELA 3: RESUMO DA CONFIGURAÇÃO
# =============================================================================
clear
draw_line "━" "$CYAN"
center_print "RESUMO DA CONFIGURAÇÃO" "$CYAN"
draw_line "━" "$CYAN"

echo -e "\n  ${BOLD}Confira os dados para instalação:${NC}"
echo -e "  App Principal: ${CYAN}http://$DOMAIN${NC}"
echo -e "  Social Proof:  ${CYAN}http://$DOMAIN/socialproof${NC}"
if [[ "$INSTALL_PMA" =~ ^[sS]$ ]]; then
  echo -e "  phpMyAdmin:    ${CYAN}http://$DOMAIN/phpmyadmin${NC} (restrito via Nginx)"
else
  echo -e "  phpMyAdmin:    ${CYAN}NÃO${NC}"
fi
echo -e "  Banco Dados:   ${CYAN}$DB_NAME${NC}"
echo -e "  Usuário MySQL: ${CYAN}$DB_USER${NC}"

echo -e "\n\n"
center_print "APERTE ENTER PARA INSTALAR!" "$GREEN"
read -r -p ""

# =============================================================================
#  TELA 4: EXECUÇÃO DAS ETAPAS REAIS
# =============================================================================
clear

# --- ETAPA 1 ---
header "ETAPA 1 — DEPENDÊNCIAS E LIBERANDO PORTA 80"

if systemctl is-active --quiet apache2 2>/dev/null; then
    log_warn "Apache2 ativo — parando e desabilitando..."
    systemctl stop apache2 >/dev/null 2>&1 || true
    systemctl disable apache2 >/dev/null 2>&1 || true
fi

apt-get update -qq
apt-get install -y -qq --no-install-recommends \
  ca-certificates gnupg \
  curl git unzip rsync \
  nginx mariadb-server openssl build-essential \
  php php-fpm php-mysql php-mbstring php-zip php-gd php-curl >/dev/null

need_node=true
if command -v node >/dev/null 2>&1; then
  node_major="$(node -v | sed -E 's/^v([0-9]+).*/\1/')"
  [[ "$node_major" =~ ^[0-9]+$ ]] && (( node_major >= 20 )) && need_node=false
fi

if $need_node; then
  log_status "Instalando Node.js 20 (Keyring nativo)..."
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg --yes
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
  apt-get update -qq
  apt-get install -y -qq --no-install-recommends nodejs >/dev/null
fi

if ! id -u "$APP_USER" >/dev/null 2>&1; then
  useradd --system --home-dir /var/lib/"$APP_USER" --create-home \
    --shell /bin/bash --user-group "$APP_USER"
fi

if ! groups www-data | grep -q "\b${APP_GROUP}\b"; then
    usermod -aG "$APP_GROUP" www-data
fi

if command -v npm >/dev/null 2>&1; then
  command -v pm2 >/dev/null 2>&1 || npm install -g pm2 --silent
fi

PM2_BIN=$(command -v pm2 || echo "/usr/bin/pm2")

log_status "Sistema base pronto."

# --- ETAPA 2 ---
header "ETAPA 2 — CONFIGURANDO MYSQL"
systemctl enable mariadb >/dev/null 2>&1 || systemctl enable mysql >/dev/null 2>&1 || true
systemctl start mariadb 2>/dev/null || systemctl start mysql 2>/dev/null || true

MYSQL_ROOT=( mysql --protocol=socket -u root )
"${MYSQL_ROOT[@]}" -e "SELECT 1" >/dev/null 2>&1 || log_error "Sem acesso root via socket no MySQL."

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
log_status "Bancos e permissões criados."

# --- ETAPA 3 ---
header "ETAPA 3 — PHPMYADMIN"
PMA_DIR="/var/www/phpmyadmin"
PMA_VER="5.2.1"

PHP_FPM_SOCK=$(find /run/php/ /var/run/php/ -type s -name "php*-fpm.sock" 2>/dev/null | sort -Vr | head -1)
[[ -S "$PHP_FPM_SOCK" ]] || log_error "Socket PHP-FPM não detectado."

if [[ "$INSTALL_PMA" =~ ^[sS]$ ]]; then
  if [[ ! -d "$PMA_DIR" ]]; then
      curl -fsS --proto '=https' --tlsv1.2 \
        "https://files.phpmyadmin.net/phpMyAdmin/${PMA_VER}/phpMyAdmin-${PMA_VER}-all-languages.zip" \
        -o /tmp/pma.zip
      rm -rf /tmp/pma_ext
      unzip -q /tmp/pma.zip -d /tmp/pma_ext
      mv /tmp/pma_ext/phpMyAdmin-* "$PMA_DIR"
      rm -rf /tmp/pma.zip /tmp/pma_ext
  fi
  
  if [[ ! -f "$PMA_DIR/config.inc.php" ]]; then
    PMA_BLOWFISH="$(openssl rand -hex 32)"
    cat > "$PMA_DIR/config.inc.php" <<EOF
<?php
\$cfg['blowfish_secret'] = '${PMA_BLOWFISH}';
\$i = 1;
\$cfg['Servers'][\$i]['auth_type'] = 'cookie';
\$cfg['Servers'][\$i]['host'] = '127.0.0.1';
\$cfg['Servers'][\$i]['AllowNoPassword'] = false;
EOF
  fi
  
  mkdir -p "$PMA_DIR/tmp"
  chown -R www-data:www-data "$PMA_DIR"
  chmod -R o-rwx "$PMA_DIR"
  chmod 0750 "$PMA_DIR/tmp"
  
  log_status "phpMyAdmin instalado."
else
  log_status "phpMyAdmin ignorado."
fi

# --- ETAPA 4 ---
header "ETAPA 4 — MOVENDO ARQUIVOS DO PROJETO"
install -d -m 0750 -o "$APP_USER" -g "$APP_GROUP" "$INSTALL_DIR"

rsync -a --delete --exclude='node_modules' --exclude='.git' --exclude='dist' \
  "$PROJECT_SRC/" "$INSTALL_DIR/"

chown -R "$APP_USER":"$APP_GROUP" "$INSTALL_DIR"
chmod -R o-rwx "$INSTALL_DIR"

if [[ -d "$SOCIALPROOF_SRC" ]]; then
    install -d -m 0750 -o www-data -g www-data "$SOCIALPROOF_DIR"
    rsync -a --delete --exclude='.git' "$SOCIALPROOF_SRC/" "$SOCIALPROOF_DIR/"
  
    install -d -m 0750 -o www-data -g www-data "$SOCIALPROOF_DIR/includes"
    cat > "$SOCIALPROOF_DIR/includes/config.php" <<EOF
<?php
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'socialproof');
define('DB_USER', '$DB_USER');
define('DB_PASS', '$DB_PASS');
EOF
    chown -R www-data:www-data "$SOCIALPROOF_DIR"
    chmod -R o-rwx "$SOCIALPROOF_DIR"
fi

install -d -m 0770 -o www-data -g "$APP_GROUP" \
  "$INSTALL_DIR/public/e-books" \
  "$INSTALL_DIR/public/proofs" \
  "$INSTALL_DIR/public/img" \
  "$INSTALL_DIR/socialmembers"

install -d -m 0750 -o "$APP_USER" -g "$APP_GROUP" /var/log/dieta-milenar

log_status "Arquivos movidos."

# --- ETAPA 5 ---
header "ETAPA 5 — GERANDO .ENV"
cat > "$INSTALL_DIR/.env" <<ENV
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASS=${DB_PASS_ESC}

JWT_SECRET=${JWT_SECRET}
STRIPE_SECRET_KEY=${STRIPE_KEY}

PORT=${APP_PORT}
NODE_ENV=production
ENV

chown "$APP_USER":"$APP_GROUP" "$INSTALL_DIR/.env"
chmod 0640 "$INSTALL_DIR/.env"
log_status "Arquivo .env configurado."

# --- ETAPA 6 ---
header "ETAPA 6 — BUILD FRONTEND E BACKEND"
cd "$INSTALL_DIR"

CHATW="src/components/ChatWidget.tsx"
if [[ -f "$CHATW" ]]; then
  NEW_URL="http://${DOMAIN}/socialproof/widget/index.php?room=dieta-faraonica"
  esc_from='https://socialproof-production\.up\.railway\.app/widget/index\.php\?room=dieta-faraonica'
  esc_to="$(printf '%s' "$NEW_URL" | sed -e 's/[\/&]/\\&/g')"
  sed -i -E "s#${esc_from}#${esc_to}#g" "$CHATW" || true
fi

if [[ -f package-lock.json ]]; then
  runuser -l "$APP_USER" -c "cd $INSTALL_DIR && npm ci --silent --cache /var/lib/$APP_USER/.npm"
else
  runuser -l "$APP_USER" -c "cd $INSTALL_DIR && npm install --silent --cache /var/lib/$APP_USER/.npm"
fi
runuser -l "$APP_USER" -c "cd $INSTALL_DIR && npm run build --silent"

[[ -f "$INSTALL_DIR/dist/index.html" ]] || log_error "Build falhou: dist/index.html ausente."

if [[ -f "$INSTALL_DIR/server.ts" && ! -f "$INSTALL_DIR/dist/server.js" ]]; then
  log_status "Convertendo server.ts para JavaScript nativo..."
  runuser -l "$APP_USER" -c "cd $INSTALL_DIR && npx esbuild server.ts --bundle --platform=node --format=esm --packages=external --outfile=dist/server.js >/dev/null 2>&1 || npx tsc server.ts --outDir dist >/dev/null 2>&1" || true
fi

runuser -l "$APP_USER" -c "cd $INSTALL_DIR && npm prune --omit=dev --silent" || true

log_status "Compilação concluída."

# --- ETAPA 7 ---
header "ETAPA 7 — IMPORTANDO SQL"

# Isola diretórios seguros (ignora node_modules/dist)
SQL_FILE="$(find "$INSTALL_DIR" -maxdepth 3 -type f -name "*.sql" ! -path "*/node_modules/*" ! -path "*/dist/*" | head -n 1)"
if [[ -n "${SQL_FILE:-}" && -f "$SQL_FILE" ]]; then
  export MYSQL_PWD="$DB_PASS"
  mysql --protocol=tcp -h 127.0.0.1 -u "$DB_USER" "$DB_NAME" < "$SQL_FILE"
  unset MYSQL_PWD
  log_status "Banco importado: $SQL_FILE"
else
  log_warn "Nenhum .sql válido encontrado para importar."
fi

# --- ETAPA 8 ---
header "ETAPA 8 — PERMISSÕES"

chown -R "$APP_USER":"$APP_GROUP" "$INSTALL_DIR"
chmod -R o-rwx "$INSTALL_DIR"
chown -R www-data:www-data "$INSTALL_DIR/public"
chown -R www-data:www-data "$INSTALL_DIR/socialmembers"
chmod -R 0775 "$INSTALL_DIR/public"
chmod -R 0775 "$INSTALL_DIR/socialmembers"
chown -R www-data:www-data /var/log/dieta-milenar 2>/dev/null || true

log_status "Permissões configuradas."

# --- ETAPA 9 ---
header "ETAPA 9 — CONFIGURANDO PM2 E VALIDAÇÃO HTTP"

cat > "$INSTALL_DIR/ecosystem.config.cjs" <<EOF
module.exports = {
  apps: [{
    name: 'dieta-milenar',
    script: 'dist/server.js',
    interpreter: 'node',
    cwd: '${INSTALL_DIR}',
    exec_mode: 'fork',
    instances: 1,
    env: { NODE_ENV: 'production' },
    autorestart: true,
    max_memory_restart: '512M',
    error_file: '/var/log/dieta-milenar/error.log',
    out_file:   '/var/log/dieta-milenar/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
EOF
chown "$APP_USER":"$APP_GROUP" "$INSTALL_DIR/ecosystem.config.cjs"

runuser -l "$APP_USER" -c "$PM2_BIN stop dieta-milenar >/dev/null 2>&1 || true"
runuser -l "$APP_USER" -c "$PM2_BIN delete dieta-milenar >/dev/null 2>&1 || true"
runuser -l "$APP_USER" -c "$PM2_BIN start $INSTALL_DIR/ecosystem.config.cjs --env production"
runuser -l "$APP_USER" -c "$PM2_BIN save --silent"

# Geração de serviço segura (via root invocando o binário do PM2 do usuário)
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u "$APP_USER" --hp /var/lib/"$APP_USER" >/dev/null 2>&1 || true
systemctl enable pm2-"$APP_USER" >/dev/null 2>&1 || true

log_status "Processo iniciado no PM2. Realizando validação pós-deploy..."

sleep 5
if runuser -l "$APP_USER" -c "$PM2_BIN info dieta-milenar" | grep -q "online"; then
    log_status "PM2 ONLINE."
    if curl -fsS --max-time 3 --retry 3 --retry-delay 2 http://127.0.0.1:${APP_PORT} >/dev/null; then
        log_status "Validação HTTP: Backend conectado (${APP_PORT})."
    else
        log_warn "ALERTA 502: PM2 online, mas porta ${APP_PORT} falhou localmente."
    fi
else
    log_error "FALHA CRÍTICA: Aplicação Node travou (Crash Loop)."
fi

# --- ETAPA 10 ---
header "ETAPA 10 — CONFIGURANDO NGINX"

ADMIN_IP="127.0.0.1"
if [[ -n "${SSH_CONNECTION:-}" ]]; then
  ADMIN_IP="$(awk '{print $1}' <<<"$SSH_CONNECTION")"
  is_valid_ipv4 "$ADMIN_IP" || ADMIN_IP="127.0.0.1"
fi

PMA_LOCATION=""
if [[ "$INSTALL_PMA" =~ ^[sS]$ ]]; then
PMA_LOCATION="
    location ^~ /phpmyadmin/ {
        root /var/www;
        index index.php index.html;
        allow ${ADMIN_IP};
        allow 127.0.0.1;
        deny all;
        
        location ~ ^/phpmyadmin/.+\.php\$ {
            include fastcgi_params;
            fastcgi_pass unix:${PHP_FPM_SOCK};
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        }
    }
"
fi

cat > "/etc/nginx/sites-available/dieta-milenar" <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};
    client_max_body_size 110M;
    server_tokens off;

    access_log /var/log/nginx/dieta-milenar.access.log;
    error_log  /var/log/nginx/dieta-milenar.error.log;

    ${PMA_LOCATION}

    location ^~ /socialproof/ {
        root /var/www;
        index index.php index.html;
        try_files \$uri \$uri/ /socialproof/index.php\$is_args\$args;

        location ~ ^/socialproof/.+\.php\$ {
            include fastcgi_params;
            fastcgi_pass unix:${PHP_FPM_SOCK};
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        }
    }

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
    }
}
NGINX

ln -sf "/etc/nginx/sites-available/dieta-milenar" "/etc/nginx/sites-enabled/"
rm -f /etc/nginx/sites-enabled/default

nginx -t >/dev/null
systemctl reload nginx 2>/dev/null || systemctl restart nginx

log_status "Nginx configurado."

# --- ETAPA 11 ---
if [[ "$USE_SSL" == true ]]; then
    header "ETAPA 11 — SSL CERTBOT"
    apt-get install -y -qq --no-install-recommends certbot python3-certbot-nginx >/dev/null
    # Verificação de DNS rudimentar antes de queimar o limite do Let's Encrypt
    if curl -s -I -m 5 "http://${DOMAIN}" | grep -q "nginx"; then
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$LE_EMAIL" \
          || log_warn "Falha na emissão SSL."
    else
        log_warn "O DNS de $DOMAIN ainda não aponta para este servidor. Pule o Certbot."
    fi
fi

# =============================================================================
#  RESUMO FINAL
# =============================================================================
clear
draw_line "━" "$GREEN"
center_print "INSTALAÇÃO CONCLUÍDA COM SUCESSO" "$GREEN"
draw_line "━" "$GREEN"
echo -e "\n  URL Principal: ${CYAN}${BOLD}http://$DOMAIN${NC}"
if [[ "$INSTALL_PMA" =~ ^[sS]$ ]]; then
echo -e "  phpMyAdmin:    ${CYAN}http://$DOMAIN/phpmyadmin${NC} (Acesso apenas de: ${ADMIN_IP})"
fi
echo -e "  Log Install:   ${YELLOW}$LOG_FILE${NC}"
echo -e "\n  Monitor PM2:   ${BOLD}runuser -l $APP_USER -c '$PM2_BIN monit'${NC}\n"
draw_line "━" "$GREEN"