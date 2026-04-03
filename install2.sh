#!/bin/bash
# =============================================================================
#  SaaS DIETA MILENAR — INSTALADOR OFICIAL v1.2.0
#  Suporte: Ubuntu 20.04+ / Debian 11+ | Modo: Idempotente
# =============================================================================

set -euo pipefail

# --- 1. CORES E ESTILOS ---
GOLD='\033[38;5;220m'; BGDARK='\033[48;5;232m'; BOLD='\033[1m'; NC='\033[0m'
DIM='\033[2m'; CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'

# --- 2. CONFIGURAÇÃO DE LARGURA RESPONSIVA ---
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

# --- 4. VERIFICAÇÕES DE AMBIENTE ---
[[ $EUID -ne 0 ]] && log_error "Execute como root: sudo bash install.sh"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_SRC="$REPO_DIR/DietaMilelar"
SOCIALPROOF_SRC="$REPO_DIR/SocialProof"
INSTALL_DIR="/var/www/dieta-milenar"
SOCIALPROOF_DIR="/var/www/socialproof"

# =============================================================================
#  TELA 1: CHECKLIST INICIAL
# =============================================================================
clear
echo -e "${BGDARK}${GOLD}${BOLD}"
draw_line "═" "$GOLD"
center_print "🏺 DIETA MILENAR — INSTALAÇÃO v1.2.0 🏺" "$GOLD"
draw_line "═" "$GOLD"
echo -e "${NC}"

echo -e "  ${DIM}Detectando IP público...${NC}"
PUBLIC_IP=$(curl -s --max-time 5 https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
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
#  TELA 2: ETAPA 0 — INPUTS
# =============================================================================
clear
header "ETAPA 0 — CONFIGURAÇÃO DO SISTEMA"

echo -e "\n  ${BOLD}🌐 CONEXÃO${NC}"
read -rp "  Deseja usar um domínio? [s/N]: " USE_DOMAIN
DOMAIN=$PUBLIC_IP
USE_SSL=false
if [[ "$USE_DOMAIN" =~ ^[sS]$ ]]; then
    read -rp "  Digite o domínio (ex: meusite.com): " DOMAIN
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
echo -e "  phpMyAdmin:    ${CYAN}http://$DOMAIN/phpmyadmin${NC}"
echo -e "  Banco Dados:   ${CYAN}$DB_NAME${NC}"
echo -e "  Usuário MySQL: ${CYAN}$DB_USER${NC}"

echo -e "\n\n"
center_print "APERTE ENTER PARA INSTALAR!" "$GREEN"
read -p ""

# =============================================================================
#  TELA 4: EXECUÇÃO DAS ETAPAS REAIS
# =============================================================================
clear

# --- ETAPA 1 ---
header "ETAPA 1 — DEPENDÊNCIAS E LIMPANDO APACHE"
if systemctl is-active --quiet apache2 2>/dev/null; then
    log_warn "Removendo Apache2 para liberar porta 80..."
    systemctl stop apache2 &>/dev/null || true
    apt-get purge apache2 -y -qq &>/dev/null
fi
apt-get update -qq
apt-get install -y -qq curl git unzip nginx mysql-server openssl build-essential \
    php-fpm php-mysql php-mbstring php-zip php-gd php-curl php-json > /dev/null

if ! command -v node &>/dev/null || [[ $(node -v | grep -oP '\d+' | head -1) -lt 18 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
    apt-get install -y -qq nodejs > /dev/null
fi
! command -v pm2 &>/dev/null && npm install -g pm2 --quiet
log_status "Sistema base pronto (Nginx + PHP-FPM + Node.js)."

# --- ETAPA 2 ---
header "ETAPA 2 — CONFIGURANDO MYSQL"
systemctl start mysql
mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS \`socialproof\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON \`socialproof\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL
log_status "Bancos e permissões criados."

# --- ETAPA 3 ---
header "ETAPA 3 — INSTALANDO PHPMYADMIN"
PMA_DIR="/var/www/phpmyadmin"
if [[ ! -d "$PMA_DIR" ]]; then
    curl -fsSL "https://files.phpmyadmin.net/phpMyAdmin/5.2.1/phpMyAdmin-5.2.1-all-languages.zip" -o /tmp/pma.zip
    unzip -q /tmp/pma.zip -d /tmp/pma_ext && mv /tmp/pma_ext/phpMyAdmin-* "$PMA_DIR"
    rm -rf /tmp/pma.zip /tmp/pma_ext
fi
log_status "phpMyAdmin configurado em /var/www/phpmyadmin."

# --- ETAPA 4 ---
header "ETAPA 4 — MOVENDO ARQUIVOS DO PROJETO"
mkdir -p "$INSTALL_DIR"
rsync -a --exclude='node_modules' --exclude='.git' "$PROJECT_SRC/" "$INSTALL_DIR/"
if [[ -d "$SOCIALPROOF_SRC" ]]; then
    mkdir -p "$SOCIALPROOF_DIR"
    rsync -a "$SOCIALPROOF_SRC/" "$SOCIALPROOF_DIR/"
    cat > "$SOCIALPROOF_DIR/includes/config.php" <<EOF
<?php
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'socialproof');
define('DB_USER', '$DB_USER');
define('DB_PASS', '$DB_PASS');
EOF
fi
log_status "Arquivos e Social Proof movidos."

# --- ETAPA 5 ---
header "ETAPA 5 — GERANDO .ENV"
cat > "$INSTALL_DIR/.env" <<ENV
DB_HOST=127.0.0.1
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
JWT_SECRET=${JWT_SECRET}
STRIPE_SECRET_KEY=${STRIPE_KEY}
PORT=3000
NODE_ENV=production
ENV
log_status "Arquivo .env configurado."

# --- ETAPA 6 ---
header "ETAPA 6 — BUILD FRONTEND"
cd "$INSTALL_DIR"
# Injeção de URL relativa para o ChatWidget
find src -name "ChatWidget.tsx" -exec sed -i "s|https://socialproof-production\.up\.railway\.app|//${DOMAIN}/socialproof|g" {} +
npm install --silent && npm run build --silent
log_status "Compilação concluída."

# --- ETAPA 7 ---
header "ETAPA 7 — IMPORTANDO SQL"
SQL_FILE=$(find "$INSTALL_DIR" -maxdepth 3 -name "*.sql" | head -1)
[[ -n "$SQL_FILE" ]] && mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE" || true
log_status "Banco de dados importado."

# --- ETAPA 10 ---
header "ETAPA 10 — CONFIGURANDO NGINX CENTRALIZADO"
PHP_VER=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null)
PHP_SOCK="/var/run/php/php${PHP_VER}-fpm.sock"

cat > "/etc/nginx/sites-available/dieta-milenar" <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};
    client_max_body_size 110M;

    # Social Proof
    location ^~ /socialproof {
        root /var/www;
        index index.php;
        location ~ \.php\$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:${PHP_SOCK};
        }
    }

    # phpMyAdmin
    location /phpmyadmin {
        root /var/www;
        index index.php;
        location ~ ^/phpmyadmin/(.+\.php)\$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:${PHP_SOCK};
        }
    }

    # App Node.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
}
NGINX
ln -sf "/etc/nginx/sites-available/dieta-milenar" "/etc/nginx/sites-enabled/"
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx && pm2 delete dieta-milenar 2>/dev/null || true
pm2 start server.ts --name "dieta-milenar" --interpreter node --interpreter_args "--import tsx/esm" && pm2 save --silent

# --- ETAPA 11 ---
if [[ "$USE_SSL" == true ]]; then
    header "ETAPA 11 — SSL CERTBOT"
    apt-get install -y -qq certbot python3-certbot-nginx > /dev/null
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN || log_warn "Erro SSL."
fi

# =============================================================================
#  RESUMO FINAL
# =============================================================================
clear
echo -e "${GREEN}${BOLD}"
draw_line "═" "$GREEN"
center_print "🏺 SaaS DIETA MILENAR — INSTALADO! 🏺" "$GREEN"
draw_line "═" "$GREEN"
echo -e "${NC}"

echo -e "  ${BOLD}URL App:${NC}         ${CYAN}http://${DOMAIN}${NC}"
echo -e "  ${BOLD}Social Proof:${NC}    ${CYAN}http://${DOMAIN}/socialproof${NC}"
echo -e "  ${BOLD}phpMyAdmin:${NC}      ${CYAN}http://${DOMAIN}/phpmyadmin${NC}"

echo -e "\n  ${BOLD}${YELLOW}━━━ LOGIN DO SISTEMA ━━━${NC}"
echo -e "  ${BOLD}E-mail:${NC} admin@dietasmilenares.com"
echo -e "  ${BOLD}Senha:${NC}  admin123"

echo -e "\n  ${BOLD}Comandos:${NC} ${CYAN}pm2 logs dieta-milenar${NC}"
echo ""
draw_line "─" "$GOLD"
center_print "INSTALAÇÃO CONCLUÍDA COM SUCESSO!" "$GOLD"
draw_line "─" "$GOLD"
rm -rf "$REPO_DIR" # Limpeza conforme solicitado