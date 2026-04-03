#!/bin/bash
# =============================================================================
#  SaaS DIETA MILENAR — INSTALADOR COMPLETO v1.2.0
#  Suporte: Ubuntu 20.04+ / Debian 11+ | Modo: Idempotente Profissional
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
center_print "🏺 DIETA MILENAR — SaaS INSTALLER 🏺" "$GOLD"
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
#  TELA 2: ETAPA 0 — CONFIGURAÇÃO
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

echo -e "\n  Endereço App:  ${CYAN}http://$DOMAIN${NC}"
echo -e "  Social Proof:  ${CYAN}http://$DOMAIN/socialproof${NC}"
echo -e "  phpMyAdmin:    ${CYAN}http://$DOMAIN/phpmyadmin${NC}"
echo -e "  Banco Dados:   ${CYAN}$DB_NAME${NC}"
echo -e "  Usuário MySQL: ${CYAN}$DB_USER${NC}"

echo -e "\n\n"
center_print "APERTE ENTER PARA INSTALAR!" "$GREEN"
read -p ""

# =============================================================================
#  TELA 4: EXECUÇÃO REAL (ETAPAS 1 A 11)
# =============================================================================

# --- ETAPA 1: DEPENDÊNCIAS ---
clear
header "ETAPA 1 — DEPENDÊNCIAS DO SISTEMA"
if systemctl is-active --quiet apache2 2>/dev/null; then
  log_warn "Removendo Apache2 para liberar porta 80..."
  systemctl stop apache2 && systemctl disable apache2 &>/dev/null
  apt-get purge apache2 -y -qq &>/dev/null || true
fi
apt-get update -qq
apt-get install -y -qq curl git unzip nginx mysql-server openssl build-essential \
  php-fpm php-mysql php-mbstring php-zip php-gd php-json php-curl > /dev/null

if ! command -v node &>/dev/null || [[ $(node -v | grep -oP '\d+' | head -1) -lt 18 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
  apt-get install -y -qq nodejs > /dev/null
fi
npm install -g pm2 tsx --quiet
log_status "Infraestrutura base pronta."

# --- ETAPA 2: MYSQL ---
clear
header "ETAPA 2 — CONFIGURANDO MYSQL"
systemctl start mysql
mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS \`socialproof\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON \`socialproof\`.* TO '${DB_USER}'@'localhost';
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`socialproof\`.* TO '${DB_USER}'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL
log_status "Bancos e usuários configurados."

# --- ETAPA 3: PHPMYADMIN ---
clear
header "ETAPA 3 — INSTALANDO PHPMYADMIN"
PMA_DIR="/var/www/phpmyadmin"
if [[ ! -d "$PMA_DIR" ]]; then
  PMA_VER="5.2.1"
  curl -fsSL "https://files.phpmyadmin.net/phpMyAdmin/${PMA_VER}/phpMyAdmin-${PMA_VER}-all-languages.zip" -o /tmp/pma.zip
  unzip -q /tmp/pma.zip -d /tmp/pma_ext && mv /tmp/pma_ext/phpMyAdmin-* "$PMA_DIR"
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

# --- ETAPA 4: MOVENDO ARQUIVOS ---
clear
header "ETAPA 4 — MOVENDO ARQUIVOS DO PROJETO"
mkdir -p "$INSTALL_DIR"
rsync -a --exclude='node_modules' --exclude='.git' --exclude='dist' "$PROJECT_SRC/" "$INSTALL_DIR/"
if [[ -d "$SOCIALPROOF_SRC" ]]; then
    mkdir -p "$SOCIALPROOF_DIR"
    rsync -a --exclude='.git' "$SOCIALPROOF_SRC/" "$SOCIALPROOF_DIR/"
    # Injeção da Classe PDO no config.php do SocialProof (Conforme original)
    cat > "$SOCIALPROOF_DIR/includes/config.php" <<EOF
<?php
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'socialproof');
define('DB_USER', '$DB_USER');
define('DB_PASS', '$DB_PASS');
class DB {
    private static \$instance = null;
    public static function conn(): PDO {
        if (self::\$instance === null) {
            self::\$instance = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4',DB_USER,DB_PASS,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
        }
        return self::\$instance;
    }
}
EOF
fi
mkdir -p "$INSTALL_DIR/public/e-books" "$INSTALL_DIR/public/proofs" "$INSTALL_DIR/public/img" "$INSTALL_DIR/socialmembers"
log_status "Arquivos movidos e Social Proof configurado."

# --- ETAPA 5 & 6: BUILD ---
clear
header "ETAPA 6 — DEPENDÊNCIAS NPM + BUILD"
cat > "$INSTALL_DIR/.env" <<ENV
DB_HOST=127.0.0.1
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
JWT_SECRET=${JWT_SECRET}
STRIPE_SECRET_KEY=${STRIPE_KEY}
PORT=${APP_PORT}
NODE_ENV=production
ENV

cd "$INSTALL_DIR"
# Injeção de URL no ChatWidget
find src -name "ChatWidget.tsx" -exec sed -i "s|https://socialproof-production\.up\.railway\.app|//${DOMAIN}/socialproof|g" {} +

npm install --silent
npm run build --silent
npm prune --omit=dev --silent
log_status "Build concluído com sucesso."

# --- ETAPA 7: SCHEMA & MIGRATIONS ---
clear
header "ETAPA 7 — IMPORTANDO SCHEMA E MIGRATIONS"
SQL_MAIN=$(find "$INSTALL_DIR" -maxdepth 4 -iname "db_atual.sql" -o -iname "*.sql" | head -1)
[[ -n "$SQL_MAIN" ]] && mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_MAIN" || true

# Migrations extras do seu original
for mig in "DataBase/migration_tickets.sql" "DataBase/migration_payment_proof.sql"; do
    [[ -f "$INSTALL_DIR/$mig" ]] && mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$INSTALL_DIR/$mig" || true
done

# Banco SocialProof
SP_SQL=$(find "$SOCIALPROOF_DIR" -maxdepth 4 -iname "dbsp_atual.sql" -o -iname "*.sql" | head -1)
[[ -n "$SP_SQL" ]] && mysql -u "$DB_USER" -p"$DB_PASS" socialproof < "$SP_SQL" || true
log_status "Banco de dados sincronizado."

# --- ETAPA 8: PERMISSÕES ---
clear
header "ETAPA 8 — AJUSTANDO PERMISSÕES"
chown -R www-data:www-data "$INSTALL_DIR" "$SOCIALPROOF_DIR" "$PMA_DIR"
chmod -R 755 "$INSTALL_DIR"
chmod 600 "$INSTALL_DIR/.env"
log_status "Permissões de segurança aplicadas."

# --- ETAPA 9: PM2 ---
clear
header "ETAPA 9 — CONFIGURANDO PM2"
cat > "$INSTALL_DIR/ecosystem.config.cjs" <<PM2
module.exports = {
  apps: [{
    name: 'dieta-milenar',
    script: 'server.ts',
    interpreter: 'tsx',
    interpreter_args: '--import tsx/esm',
    cwd: '${INSTALL_DIR}',
    env: { NODE_ENV: 'production' }
  }]
};
PM2
pm2 delete dieta-milenar 2>/dev/null || true
pm2 start "$INSTALL_DIR/ecosystem.config.cjs"
pm2 save --silent
log_status "Servidor iniciado via PM2 + TSX."

# --- ETAPA 10: NGINX ---
clear
header "ETAPA 10 — CONFIGURANDO NGINX"
PHP_VER=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null)
cat > "/etc/nginx/sites-available/dieta-milenar" <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};
    client_max_body_size 110M;

    location /phpmyadmin {
        root /var/www;
        index index.php;
        location ~ ^/phpmyadmin/(.+\.php)\$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/var/run/php/php${PHP_VER}-fpm.sock;
        }
    }

    location ^~ /socialproof {
        root /var/www;
        index index.php;
        location ~ ^/socialproof/.+\.php\$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/var/run/php/php${PHP_VER}-fpm.sock;
        }
    }

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_read_timeout 90;
    }
}
NGINX
ln -sf "/etc/nginx/sites-available/dieta-milenar" "/etc/nginx/sites-enabled/"
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
log_status "Nginx configurado (Porta 80)."

# --- ETAPA 11: SSL ---
if [[ "$USE_SSL" == true ]]; then
    clear
    header "ETAPA 11 — SSL CERTBOT"
    apt-get install -y -qq certbot python3-certbot-nginx > /dev/null
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN || log_warn "SSL Falhou."
fi

# =============================================================================
#  RESUMO FINAL
# =============================================================================
clear
echo -e "${GREEN}${BOLD}"
draw_line "═" "$GREEN"
center_print "🏺 SaaS DIETA MILENAR — INSTALADO COM SUCESSO! 🏺" "$GREEN"
draw_line "═" "$GREEN"
echo -e "${NC}"

echo -e "  ${BOLD}URL App:${NC}         ${CYAN}http://${DOMAIN}${NC}"
echo -e "  ${BOLD}Social Proof:${NC}    ${CYAN}http://${DOMAIN}/socialproof${NC}"
echo -e "  ${BOLD}phpMyAdmin:${NC}      ${CYAN}http://${DOMAIN}/phpmyadmin${NC}"

echo -e "\n  ${BOLD}${YELLOW}━━━ LOGIN PADRÃO DO SISTEMA ━━━${NC}"
echo -e "  ${BOLD}E-mail:${NC} admin@dietasmilenares.com"
echo -e "  ${BOLD}Senha:${NC}  admin123"

echo -e "\n  ${BOLD}Comandos:${NC} ${CYAN}pm2 logs dieta-milenar${NC}"
echo ""
draw_line "─" "$GOLD"
center_print "BOAS VENDAS! OBRIGADO POR UTILIZAR." "$GOLD"
draw_line "─" "$GOLD"
rm -rf "$REPO_DIR"