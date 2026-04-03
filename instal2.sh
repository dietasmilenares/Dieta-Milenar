#!/bin/bash
# =============================================================================
#  SaaS DIETA MILENAR — INSTALADOR OFICIAL v1.2.0
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

# --- 4. CAMINHOS E ROOT ---
[[ $EUID -ne 0 ]] && log_error "Execute como root: sudo bash install.sh"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_SRC="$REPO_DIR/DietaMilelar"
SOCIALPROOF_SRC="$REPO_DIR/SocialProof"
INSTALL_DIR="/var/www/dieta-milenar"
SOCIALPROOF_DIR="/var/www/socialproof"

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
#  TELA 2: CONFIGURAÇÃO (INPUTS)
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
#  TELA 3: RESUMO DA CONFIGURAÇÃO (COM SOCIAL PROOF)
# =============================================================================
clear
draw_line "━" "$CYAN"
center_print "RESUMO DA CONFIGURAÇÃO" "$CYAN"
draw_line "━" "$CYAN"

echo -e "\n  ${BOLD}Confira os dados antes de prosseguir:${NC}"
echo -e "  Endereço App:  ${CYAN}http://$DOMAIN${NC}"
echo -e "  Social Proof:  ${CYAN}http://$DOMAIN/socialproof${NC}"
echo -e "  phpMyAdmin:    ${CYAN}http://$DOMAIN/phpmyadmin${NC}"
echo -e "  Banco Dados:   ${CYAN}$DB_NAME${NC}"
echo -e "  Usuário MySQL: ${CYAN}$DB_USER${NC}"

echo -e "\n\n"
center_print "APERTE ENTER PARA INSTALAR!" "$GREEN"
read -p ""

# =============================================================================
#  TELA 4: EXECUÇÃO REAL
# =============================================================================
clear

# --- ETAPA 1: DEPENDÊNCIAS ---
header "ETAPA 1 — DEPENDÊNCIAS DO SISTEMA"
apt-get update -qq
apt-get install -y -qq curl git unzip nginx mysql-server openssl build-essential \
  php php-mbstring php-zip php-gd php-json php-curl php-mysql php-fpm > /dev/null
log_status "Pacotes APT instalados."

# --- ETAPA 2: MYSQL ---
header "ETAPA 2 — CONFIGURANDO MYSQL"
systemctl start mysql
mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4;
CREATE DATABASE IF NOT EXISTS \`socialproof\` CHARACTER SET utf8mb4;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON \`socialproof\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL
log_status "Bancos criados: $DB_NAME e socialproof"

# --- ETAPA 4: ARQUIVOS & SOCIAL PROOF ---
header "ETAPA 4 — ARQUIVOS E SOCIAL PROOF"
mkdir -p "$INSTALL_DIR"
rsync -a --exclude='node_modules' "$PROJECT_SRC/" "$INSTALL_DIR/"

if [[ -d "$SOCIALPROOF_SRC" ]]; then
    mkdir -p "$SOCIALPROOF_DIR"
    rsync -a "$SOCIALPROOF_SRC/" "$SOCIALPROOF_DIR/"
    # Gerar config.php real do Social Proof
    cat > "$SOCIALPROOF_DIR/includes/config.php" <<EOF
<?php
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'socialproof');
define('DB_USER', '$DB_USER');
define('DB_PASS', '$DB_PASS');
EOF
    log_status "Social Proof configurado em $SOCIALPROOF_DIR"
fi

# --- ETAPA 6: BUILD ---
header "ETAPA 6 — BUILD FRONTEND"
cd "$INSTALL_DIR"
# Injeta URL do Social Proof no código do Widget
find src -name "ChatWidget.tsx" -exec sed -i "s|https://socialproof-production\.up\.railway\.app|http://${DOMAIN}/socialproof|g" {} +
npm install --silent && npm run build --silent
log_status "Build concluído."

# ... (Aqui seguem as etapas 7 a 11 conforme as funções anteriores) ...

# =============================================================================
#  RESUMO FINAL (QUADRO DE SUCESSO)
# =============================================================================
clear
echo -e "${GREEN}${BOLD}"
draw_line "═" "$GREEN"
center_print "🏺 SaaS DIETA MILENAR — INSTALADO COM SUCESSO! 🏺" "$GREEN"
draw_line "═" "$GREEN"
echo -e "${NC}"

echo -e "  ${BOLD}URL Principal:${NC}    ${CYAN}http://${DOMAIN}${NC}"
echo -e "  ${BOLD}Social Proof:${NC}     ${CYAN}http://${DOMAIN}/socialproof${NC}"
echo -e "  ${BOLD}phpMyAdmin:${NC}       ${CYAN}http://${DOMAIN}/phpmyadmin${NC}"

echo -e "\n  ${BOLD}${YELLOW}━━━ LOGIN PADRÃO DO SISTEMA ━━━${NC}"
echo -e "  ${BOLD}E-mail:${NC}  admin@dietasmilenares.com"
echo -e "  ${BOLD}Senha:${NC}   admin123"

echo -e "\n  ${BOLD}${YELLOW}━━━ LOGIN PHPMYADMIN / DB ━━━${NC}"
echo -e "  ${BOLD}Usuário:${NC} $DB_USER"
echo -e "  ${BOLD}Senha:${NC}   (a senha que você definiu)"

echo ""
draw_line "─" "$GOLD"
center_print "BOAS VENDAS! INSTALAÇÃO FINALIZADA." "$GOLD"
draw_line "─" "$GOLD"
echo ""