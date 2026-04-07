#!/usr/bin/env bash
# =============================================================================
#  SOCIAL PROOF SETUP WIZARD — Versão 1.2.0 (MariaDB Optimized)
#  Extraído do SaaS Dieta Milenar | Focado em Estabilidade
# =============================================================================

set -euo pipefail

# ─── Cores e Estilos ──────────────────────────────────────────────────────────
RED='\033[0;31m';    GREEN='\033[0;32m';   YELLOW='\033[1;33m'
BLUE='\033[0;34m';   CYAN='\033[0;36m';   MAGENTA='\033[0;35m'
BOLD='\033[1m';      DIM='\033[2m';        NC='\033[0m'
WHITE='\033[0;37m'

# ─── Helpers ──────────────────────────────────────────────────────────────────
log()     { echo -e "${GREEN}  ✔${NC}  $1"; }
warn()    { echo -e "${YELLOW}  ⚠${NC}  $1"; }
error()   { echo -e "${RED}  ✘${NC}  $1"; exit 1; }
step()    { echo -e "\n${BOLD}${BLUE}  ▶  $1${NC}"; }

spinner() {
  local pid=$1
  local msg=$2
  local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
  local i=0
  while kill -0 "$pid" 2>/dev/null; do
    printf "\r  ${CYAN}${spin:$((i % ${#spin})):1}${NC}  ${DIM}%s...${NC}" "$msg"
    i=$((i + 1))
    sleep 0.1
  done
  printf "\r  ${GREEN}✔${NC}  %-50s\n" "$msg"
}

ask() {
  local varname=$1
  local question=$2
  local default=${3:-""}
  local value=""
  printf "  ${BOLD}${WHITE}%s${NC} ${DIM}[padrão: %s]${NC}: " "$question" "$default"
  read -r value
  value="${value:-$default}"
  printf -v "$varname" '%s' "$value"
}

# ─── Verificação de root ──────────────────────────────────────────────────────
[[ $EUID -ne 0 ]] && error "Execute como root: sudo bash $0"

clear
echo -e "${BOLD}${MAGENTA}"
cat << 'EOF'
   ███████╗ ██████╗  ██████╗██╗ █████╗ ██╗
   ██╔════╝██╔═══██╗██╔════╝██║██╔══██╗██║
   ███████╗██║   ██║██║     ██║███████║██║
   ╚════██║██║   ██║██║     ██║██╔══██║██║
   ███████║╚██████╔╝╚██████╗██║██║  ██║███████╗
   ╚══════╝ ╚═════╝  ╚═════╝╚═╝╚═╝  ╚═╝╚══════╝
      INSTALADOR EXCLUSIVO - SOCIAL PROOF
EOF
echo -e "${NC}"
echo -e "${BOLD}${CYAN}  ╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}  ║       SOCIAL PROOF - CONFIGURAÇÃO OBRIGATÓRIA        ║${NC}"
echo -e "${BOLD}${CYAN}  ╚══════════════════════════════════════════════════════╝${NC}"

# =============================================================================
#  FASE DE PERGUNTAS (PADRÕES CONFORME SOLICITADO)
# =============================================================================
ask DOMAIN "Domínio ou IP do servidor" "127.0.0.1"
ask APP_PORT "Porta da aplicação" "3001"
ask INSTALL_DIR "Diretório de instalação" "/var/www/social-proof"

echo -e "\n  ${BOLD}${CYAN}── Configurações de Banco de Dados ────────────────────${NC}"
ask DB_HOST "Host do Banco" "127.0.0.1"
ask DB_NAME "Nome do Banco" "dieta_milenar"
ask DB_USER "Usuário MySQL" "dieta_user"
ask DB_PASS "Senha MySQL" "root"

echo ""
warn "O banco '$DB_NAME' será APAGADO (DROP) e recriado agora."
read -rp "  Pressione ENTER para confirmar e iniciar..." _

# =============================================================================
#  ETAPA 1 — DETECÇÃO E DEPENDÊNCIAS
# =============================================================================
header() { echo -e "\n${BOLD}${CYAN}--- $1 ---${NC}"; }
header "ETAPA 1 — DEPENDÊNCIAS DO SISTEMA"

# Detectar se o Banco de Dados já existe
DB_INSTALLED=false
if systemctl is-active --quiet mysql || systemctl is-active --quiet mariadb; then
    DB_INSTALLED=true
    log "Servidor de Banco de Dados detectado em execução. Pulando instalação do engine."
else
    step "Instalando MariaDB Server (Tecnologia compatível)"
    # Destrava travas de socket se existirem
    rm -f /etc/mysql/FROZEN || true
    apt-get update -qq && apt-get install -y -qq mariadb-server &
    spinner $! "Instalando MariaDB"
    systemctl start mariadb
    systemctl enable mariadb
fi

step "Instalando dependências de rede e sistema"
apt-get install -y -qq curl git nginx rsync unzip openssl build-essential &
spinner $! "Aguardando apt-get"

# Node.js 20
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
  apt-get install -y -qq nodejs > /dev/null
fi
command -v pm2 &>/dev/null || npm install -g pm2 --quiet

# =============================================================================
#  ETAPA 2 — BANCO DE DADOS (DROP E CREATE OBRIGATÓRIO)
# =============================================================================
header "ETAPA 2 — CONFIGURAÇÃO DO BANCO DE DADOS"

step "Limpando e criando estrutura"
# Escapa a senha para o SQL
DB_PASS_ESC=$(printf '%s' "$DB_PASS" | sed "s/'/\\\\'/g")

mysql -u root <<SQL
DROP DATABASE IF EXISTS \`${DB_NAME}\`;
CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS_ESC}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL
log "Banco '$DB_NAME' limpo e recriado com sucesso."

# =============================================================================
#  ETAPA 3 — INSTALAÇÃO DA APLICAÇÃO
# =============================================================================
header "ETAPA 3 — ARQUIVOS DA APLICAÇÃO"

mkdir -p "$INSTALL_DIR"
# Sincroniza os arquivos do diretório atual para a pasta de destino
rsync -a --exclude='node_modules' --exclude='.git' . "$INSTALL_DIR/"

# Criar .env sem Claude IA
cat > "$INSTALL_DIR/.env" <<ENV
PORT=${APP_PORT}
NODE_ENV=production
DB_HOST=${DB_HOST}
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
DB_NAME=${DB_NAME}
JWT_SECRET=$(openssl rand -hex 32)
ENV

cd "$INSTALL_DIR"
step "Instalando Node modules"
npm install --omit=dev --silent &
spinner $! "npm install"

# =============================================================================
#  ETAPA 4 — IMPORTAÇÃO SQL (OBRIGATÓRIA)
# =============================================================================
header "ETAPA 4 — IMPORTAÇÃO DE DADOS"

step "Buscando arquivo Dieta-Faraonica-Data-Base-Completa_2.sql"
SQL_FILE=$(find "$INSTALL_DIR" -name "Dieta-Faraonica-Data-Base-Completa_2.sql" | head -n 1)

if [[ -n "$SQL_FILE" && -f "$SQL_FILE" ]]; then
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE"
    log "Importação concluída: $(basename "$SQL_FILE")"
else
    # Busca alternativa por qualquer SQL se o nome exato falhar
    SQL_FILE_ALT=$(find "$INSTALL_DIR" -maxdepth 3 -name "*.sql" | head -n 1)
    if [[ -n "$SQL_FILE_ALT" ]]; then
        mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE_ALT"
        log "Importação concluída (usando fallback): $(basename "$SQL_FILE_ALT")"
    else
        error "Arquivo SQL não encontrado no diretório $INSTALL_DIR!"
    fi
fi

# =============================================================================
#  ETAPA 5 — FINALIZAÇÃO (NGINX E PM2)
# =============================================================================
header "ETAPA 5 — INICIALIZAÇÃO"

step "Compilando aplicação"
npm run build --silent || true

step "Iniciando com PM2"
pm2 delete social-proof 2>/dev/null || true
if [ -f "server.ts" ]; then
    npm install -g tsx --silent || true
    pm2 start "tsx server.ts" --name "social-proof"
else
    pm2 start dist/server.js --name "social-proof"
fi
pm2 save --silent

step "Configurando Nginx"
cat > "/etc/nginx/sites-available/social-proof" <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};
    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/social-proof /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t && systemctl reload nginx

# =============================================================================
#  RESUMO FINAL
# =============================================================================
clear
echo -e "\n${BOLD}${GREEN}  ✔ SOCIAL PROOF INSTALADO COM SUCESSO!${NC}"
echo -e "  ══════════════════════════════════════════════"
echo -e "  ${BOLD}Acesso:${NC}       http://${DOMAIN}"
echo -e "  ${BOLD}Banco:${NC}        ${DB_NAME}"
echo -e "  ${BOLD}Usuário DB:${NC}   ${DB_USER}"
echo -e "  ${BOLD}Senha DB:${NC}     ${DB_PASS}"
echo -e "  ══════════════════════════════════════════════"
if [ "$DB_INSTALLED" = true ]; then
    log "Nota: Servidor de banco já existente foi utilizado."
fi
log "Importação do SQL concluída com sucesso."
echo ""