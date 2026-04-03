#!/bin/bash
# =============================================================================
#  SaaS DIETA MILENAR — INSTALADOR OFICIAL v1.2.0
#  Compatível: Ubuntu 20.04+ / Debian 11+ | Modo: Idempotente
# =============================================================================

set -euo pipefail

# --- 1. CORES E ESTILOS ---
GOLD='\033[38;5;220m'; BGDARK='\033[48;5;232m'; BOLD='\033[1m'; NC='\033[0m'
DIM='\033[2m'; CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'

# --- 2. CONFIGURAÇÃO DE LARGURA ---
TERM_WIDTH=$(tput cols 2>/dev/null || echo 80)
[[ $TERM_WIDTH -lt 20 ]] && TERM_WIDTH=40

# --- 3. FUNÇÕES DE LAYOUT ---
draw_line() {
    local char=$1; local color=$2
    echo -ne "${color}${BOLD}  "
    for ((i=1; i<=$((TERM_WIDTH - 4)); i++)); do echo -n "$char"; done
    echo -e "${NC}"
}

center_print() {
    local text="$1"; local color="$2"
    local pad=$(( (TERM_WIDTH - ${#text}) / 2 ))
    [[ $pad -lt 0 ]] && pad=0
    printf "%*s%b%s%b\n" $pad "" "$color" "$text" "$NC"
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

# --- 4. VERIFICAÇÕES INICIAIS ---
[[ $EUID -ne 0 ]] && log_error "Execute como root: sudo bash install.sh"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_SRC="$REPO_DIR/DietaMilelar"
SOCIALPROOF_SRC="$REPO_DIR/SocialProof"
INSTALL_DIR="/var/www/dieta-milenar"
SOCIALPROOF_DIR="/var/www/socialproof"

[[ ! -d "$PROJECT_SRC" ]] && log_error "Pasta 'DietaMilelar' não encontrada."

# =============================================================================
#  TELA 1: CHECKLIST DE AMBIENTE
# =============================================================================
clear
echo -e "${BGDARK}${GOLD}${BOLD}"
draw_line "═" "$GOLD"
center_print "🏺 DIETA MILENAR 🏺" "$GOLD"
center_print "INSTALAÇÃO v1.2.0" "$GOLD"
draw_line "═" "$GOLD"
echo -e "${NC}"

echo -e "  ${DIM}Detectando IP público...${NC}"
PUBLIC_IP=""
for SERVICE in "https://api.ipify.org" "https://ipecho.net/plain" "https://checkip.amazonaws.com"; do
  PUBLIC_IP=$(curl -s --max-time 5 "$SERVICE" 2>/dev/null | tr -d '[:space:]')
  [[ "$PUBLIC_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] && break
  PUBLIC_IP=""
done
PUBLIC_IP=${PUBLIC_IP:-$(hostname -I | awk '{print $1}')}

echo -e "  ${GREEN}[✔]${NC} IP: ${CYAN}${BOLD}${PUBLIC_IP}${NC}\n"

echo -e "${GOLD}${BOLD}  ── 🔍 AMBIENTE ${NC}"
draw_line "─" "$GOLD"

chk_cmd() { command -v "$1" &>/dev/null && echo -ne "${GREEN}[✔]${NC}" || echo -ne "${RED}[✘]${NC}"; }
printf "  $(chk_cmd curl) curl       $(chk_cmd git) git        $(chk_cmd nginx) nginx\n"
printf "  $(chk_cmd mysql) mysql      $(chk_cmd php) php        $(chk_cmd node) node\n"

echo ""
draw_line "─" "$GOLD"
center_print "APERTE ENTER PARA INICIAR CONFIGURAÇÃO" "$GREEN"
read -p ""

# =============================================================================
#  TELA 2: CONFIGURAÇÃO (ETAPA 0)
# =============================================================================
clear
header "ETAPA 0 — CONFIGURAÇÃO DO SISTEMA"

echo -e "\n  ${BOLD}🌐 CONEXÃO${NC}"
read -rp "  Deseja usar um domínio? [s/N]: " USE_DOMAIN
DOMAIN=$PUBLIC_IP
USE_SSL=false
if [[ "$USE_DOMAIN" =~ ^[sS]$ ]]; then
    read -rp "  Digite o domínio: " DOMAIN
    DOMAIN=$(echo "$DOMAIN" | tr -d '[:space:]' | sed 's|https\?://||;s|/.*||')
    USE_SSL=true
fi

echo -e "\n  ${BOLD}🗄️  BANCO DE DADOS${NC}"
read -rp "  Nome do banco [dieta_milenar]: " DB_NAME
DB_NAME=${DB_NAME:-dieta_milenar}
read -rp "  Usuário MySQL [dieta_user]: " DB_USER
DB_USER=${DB_USER:-dieta_user}
while true; do
  read -rsp "  Senha MySQL (oculta): " DB_PASS; echo
  [[ -n "$DB_PASS" ]] && break
  log_warn "A senha não pode ser vazia."
done

echo -e "\n  ${BOLD}💳 PAGAMENTOS${NC}"
read -rp "  Stripe Secret Key [Enter = pular]: " STRIPE_KEY
STRIPE_KEY=${STRIPE_KEY:-sk_test_PLACEHOLDER}

JWT_SECRET=$(openssl rand -hex 32)
APP_PORT=3000

# =============================================================================
#  TELA 3: RESUMO
# =============================================================================
clear
draw_line "━" "$CYAN"
center_print "RESUMO DA CONFIGURAÇÃO" "$CYAN"
draw_line "━" "$CYAN"

echo -e "\n  Endereço:      ${CYAN}$DOMAIN${NC}"
echo -e "  Banco:         ${CYAN}$DB_NAME${NC}"
echo -e "  Usuário DB:    ${CYAN}$DB_USER${NC}"
echo -e "  SocialProof:   ${CYAN}http://$DOMAIN/socialproof${NC}"

echo -e "\n\n"
center_print "APERTE ENTER PARA INSTALAR!" "$GREEN"
read -p ""

# =============================================================================
#  TELA 4: EXECUÇÃO (ETAPAS 1 A 11)
# =============================================================================
clear

# --- ETAPA 1: DEPENDÊNCIAS ---
header "ETAPA 1 — DEPENDÊNCIAS DO SISTEMA"
if systemctl is-active --quiet apache2 2>/dev/null; then
  systemctl stop apache2 && systemctl disable apache2 &>/dev/null
  log_status "Apache2 removido."
fi
apt-get update -qq
apt-get install -y -qq curl git unzip nginx mysql-server openssl build-essential \
  php php-mbstring php-zip php-gd php-json php-curl php-mysql php-fpm > /dev/null
log_status "Pacotes APT instalados."

if ! command -v node &>/dev/null || [[ $(node -v | grep -oP '\d+' | head -1) -lt 18 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
  apt-get install -y -qq nodejs > /dev/null
fi
log_status "Node.js $(node -v) pronto."
! command -v pm2 &>/dev/null && npm install -g pm2 --quiet

# --- ETAPA 2: MYSQL ---
header "ETAPA 2 — CONFIGURANDO MYSQL"
systemctl start mysql
mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
CREATE DATABASE IF NOT EXISTS \`socialproof\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON \`socialproof\`.* TO '${DB_USER}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`socialproof\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL
log_status "Bancos e usuários configurados."

# --- ETAPA 3: PHPMYADMIN ---
header "ETAPA 3 — INSTALANDO PHPMYADMIN"
PMA_DIR="/var/www/phpmyadmin"
if [[ ! -d "$PMA_DIR" ]]; then
  PMA_VER="5.2.1"
  curl -fsSL "https://files.phpmyadmin.net/phpMyAdmin/${PMA_VER}/phpMyAdmin-${PMA_VER}-all-languages.zip" -o /tmp/pma.zip
  unzip -q /tmp/pma.zip -d /tmp/pma_ext
  mv /tmp/pma_ext/phpMyAdmin-* "$PMA_DIR"
  rm -rf /tmp/pma.zip /tmp/pma_ext
fi
PMA_BLOW=$(openssl rand -hex 32)
cat > "$PMA_DIR/config.inc.php" <<PMA
<?php
\$cfg['blowfish_secret'] = '$PMA_BLOW';
\$i = 1;
\$cfg['Servers'][\$i]['auth_type'] = 'cookie';
\$cfg['Servers'][\$i]['host'] = '127.0.0.1';
\$cfg['Servers'][\$i]['AllowNoPassword'] = false;
PMA
mkdir -p "$PMA_DIR/tmp" && chown -R www-data:www-data "$PMA_DIR"
log_status "phpMyAdmin pronto."

# --- ETAPA 4: ARQUIVOS ---
header "ETAPA 4 — MOVENDO ARQUIVOS"
mkdir -p "$INSTALL_DIR"
rsync -a --exclude='node_modules' --exclude='.git' --exclude='dist' "$PROJECT_SRC/" "$INSTALL_DIR/"
if [[ -d "$SOCIALPROOF_SRC" ]]; then
  mkdir -p "$SOCIALPROOF_DIR"
  rsync -a --exclude='.git' "$SOCIALPROOF_SRC/" "$SOCIALPROOF_DIR/"
  # Gerar config.php do SocialProof (Conforme seu script original)
  cat > "$SOCIALPROOF_DIR/includes/config.php" <<SPCONF
<?php
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'socialproof');
define('DB_USER', '${DB_USER}');
define('DB_PASS', '${DB_PASS}');
class DB {
    private static \$instance = null;
    public static function conn(): PDO {
        if (self::\$instance === null) {
            self::\$instance = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4', DB_USER, DB_PASS);
        }
        return self::\$instance;
    }
}
SPCONF
fi
mkdir -p "$INSTALL_DIR/public/e-books" "$INSTALL_DIR/public/proofs" "$INSTALL_DIR/socialmembers"
log_status "Estrutura de pastas criada."

# --- ETAPA 5: .ENV ---
header "ETAPA 5 — CRIANDO .ENV"
cat > "$INSTALL_DIR/.env" <<ENV
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
log_status ".env gerado."

# --- ETAPA 6: NPM + BUILD ---
header "ETAPA 6 — BUILD FRONTEND"
cd "$INSTALL_DIR"
# Injeção no ChatWidget (conforme script original)
CHAT_WIDGET="$INSTALL_DIR/src/components/ChatWidget.tsx"
[[ -f "$CHAT_WIDGET" ]] && sed -i "s|https://socialproof-production\.up\.railway\.app|http://${DOMAIN}/socialproof|g" "$CHAT_WIDGET"

npm install --silent
npm run build --silent
npm prune --omit=dev --silent
log_status "Build concluído com sucesso."

# --- ETAPA 7: SCHEMA ---
header "ETAPA 7 — IMPORTANDO BANCO"
SQL_FILE=$(find "$INSTALL_DIR" -maxdepth 4 -iname "*.sql" | head -1)
if [[ -n "$SQL_FILE" ]]; then
  mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE" || true
fi
SP_SQL=$(find "$SOCIALPROOF_DIR" -maxdepth 4 -iname "*.sql" | head -1)
if [[ -n "$SP_SQL" ]]; then
  mysql -u "$DB_USER" -p"$DB_PASS" socialproof < "$SP_SQL" || true
fi
log_status "Schemas importados."

# --- ETAPA 8: PERMISSÕES ---
header "ETAPA 8 — PERMISSÕES"
chown -R www-data:www-data "$INSTALL_DIR" "$SOCIALPROOF_DIR"
chmod -R 755 "$INSTALL_DIR"
chmod 600 "$INSTALL_DIR/.env"
log_status "Permissões aplicadas."

# --- ETAPA 9: PM2 ---
header "ETAPA 9 — CONFIGURANDO PM2"
cat > "$INSTALL_DIR/ecosystem.config.cjs" <<PM2
module.exports = { apps: [{ name: 'dieta-milenar', script: 'server.ts', interpreter: 'node', interpreter_args: '--import tsx/esm', env: { NODE_ENV: 'production' } }] };
PM2
pm2 delete dieta-milenar 2>/dev/null || true
pm2 start "$INSTALL_DIR/ecosystem.config.cjs"
pm2 save --silent
log_status "Aplicação rodando via PM2."

# --- ETAPA 10: NGINX ---
header "ETAPA 10 — CONFIGURANDO NGINX"
PHP_VERSION=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null || echo "8.1")
PHP_SOCK="/var/run/php/php${PHP_VERSION}-fpm.sock"

cat > "/etc/nginx/sites-available/dieta-milenar" <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};
    client_max_body_size 110M;

    location /phpmyadmin {
        root /var/www;
        index index.php;
        location ~ ^/phpmyadmin/(.+\.php)\$ {
            include fastcgi_params;
            fastcgi_pass unix:${PHP_SOCK};
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        }
    }

    location ^~ /socialproof {
        root /var/www;
        index index.php;
        location ~ ^/socialproof/.+\.php\$ {
            include fastcgi_params;
            fastcgi_pass unix:${PHP_SOCK};
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        }
    }

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/dieta-milenar /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
log_status "Nginx configurado."

# --- ETAPA 11: SSL ---
if [[ "$USE_SSL" == true ]]; then
  header "ETAPA 11 — SSL CERTBOT"
  apt-get install -y -qq certbot python3-certbot-nginx > /dev/null
  certb