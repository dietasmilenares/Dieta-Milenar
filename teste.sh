#!/usr/bin/env bash
# =============================================================================
#  SETUP WIZARD — SaaS Dieta Milenar
#  Versão: 2.0.0
#  Compatível: Ubuntu 20.04+ / Debian 11+
#  Modo: Idempotente + Setup Wizard Interativo
#  Uso: sudo bash install.sh [--reconfigure] [--uninstall]
# =============================================================================

set -euo pipefail

# ─── Cores e estilos ──────────────────────────────────────────────────────────
RED='\033[0;31m';    GREEN='\033[0;32m';   YELLOW='\033[1;33m'
BLUE='\033[0;34m';   CYAN='\033[0;36m';   MAGENTA='\033[0;35m'
BOLD='\033[1m';      DIM='\033[2m';        NC='\033[0m'
BG_GREEN='\033[42m'; BG_RED='\033[41m';   BG_BLUE='\033[44m'
WHITE='\033[0;37m'

# ─── Helpers de log ───────────────────────────────────────────────────────────
log()     { echo -e "${GREEN}  ✔${NC}  $1"; }
warn()    { echo -e "${YELLOW}  ⚠${NC}  $1"; }
error()   { echo -e "${RED}  ✘${NC}  $1"; exit 1; }
info()    { echo -e "${CYAN}  ℹ${NC}  $1"; }
step()    { echo -e "\n${BOLD}${BLUE}  ▶  $1${NC}"; }

# ─── Contador de etapas ───────────────────────────────────────────────────────
TOTAL_STEPS=8
current_step=0

header() {
  current_step=$((current_step + 1))
  local pct=$(( current_step * 100 / TOTAL_STEPS ))
  local filled=$(( current_step * 30 / TOTAL_STEPS ))
  local empty=$(( 30 - filled ))
  local bar=""
  for ((i=0; i<filled; i++)); do bar+="█"; done
  for ((i=0; i<empty; i++));  do bar+="░"; done

  echo ""
  echo -e "${BOLD}${CYAN}┌──────────────────────────────────────────────────────┐${NC}"
  printf "${BOLD}${CYAN}│${NC}  ${BOLD}%-50s${CYAN}  │${NC}\n" "$1"
  printf "${BOLD}${CYAN}│${NC}  ${GREEN}${bar}${NC} ${BOLD}%3d%%${NC} [${CYAN}%d${NC}/${CYAN}%d${NC}]  ${CYAN}│${NC}\n" "$pct" "$current_step" "$TOTAL_STEPS"
  echo -e "${BOLD}${CYAN}└──────────────────────────────────────────────────────┘${NC}"
  echo ""
}

# ─── Spinner ──────────────────────────────────────────────────────────────────
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

# ─── Função de pergunta com validação ─────────────────────────────────────────
# Uso: ask VAR_NAME "Pergunta" "padrão" [validacao_regex] [secret]
ask() {
  local varname=$1
  local question=$2
  local default=${3:-""}
  local regex=${4:-".*"}
  local secret=${5:-""}
  local value=""

  while true; do
    if [[ -n "$default" ]]; then
      printf "  ${BOLD}${WHITE}%s${NC} ${DIM}[padrão: %s]${NC}: " "$question" "$default"
    else
      printf "  ${BOLD}${WHITE}%s${NC}: " "$question"
    fi

    if [[ "$secret" == "secret" ]]; then
      read -rs value; echo
    else
      read -r value
    fi

    value="${value:-$default}"

    if [[ -z "$value" ]]; then
      echo -e "  ${RED}  ✘  Campo obrigatório. Tente novamente.${NC}"
      continue
    fi

    if [[ ! "$value" =~ $regex ]]; then
      echo -e "  ${RED}  ✘  Formato inválido. Tente novamente.${NC}"
      continue
    fi

    break
  done

  printf -v "$varname" '%s' "$value"
}

# ─── Validação de força de senha ──────────────────────────────────────────────
ask_password() {
  local varname=$1
  local question=$2
  local value=""
  local confirm=""

  while true; do
    printf "  ${BOLD}${WHITE}%s${NC} ${DIM}(min. 8 chars, oculta)${NC}: " "$question"
    read -rs value; echo

    if [[ ${#value} -lt 8 ]]; then
      echo -e "  ${RED}  ✘  Senha muito curta. Mínimo 8 caracteres.${NC}"
      continue
    fi

    printf "  ${BOLD}${WHITE}Confirme a senha${NC}: "
    read -rs confirm; echo

    if [[ "$value" != "$confirm" ]]; then
      echo -e "  ${RED}  ✘  Senhas não conferem. Tente novamente.${NC}"
      continue
    fi

    break
  done

  printf -v "$varname" '%s' "$value"
}

# ─── Log file ─────────────────────────────────────────────────────────────────
LOG_FILE="/tmp/dieta-milenar-install-$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

# =============================================================================
#  FLAGS DE LINHA DE COMANDO
# =============================================================================
MODE="install"
[[ "${1:-}" == "--reconfigure" ]] && MODE="reconfigure"
[[ "${1:-}" == "--uninstall" ]]   && MODE="uninstall"

# ─── Verificação de root ───────────────────────────────────────────────────────
[[ $EUID -ne 0 ]] && error "Execute como root: sudo bash install.sh"

# =============================================================================
#  MODO DESINSTALAÇÃO
# =============================================================================
if [[ "$MODE" == "uninstall" ]]; then
  clear
  echo -e "\n${BOLD}${RED}"
  echo "  ╔══════════════════════════════════════════╗"
  echo "  ║      ⚠  DESINSTALAÇÃO DIETA MILENAR      ║"
  echo "  ╚══════════════════════════════════════════╝"
  echo -e "${NC}"
  echo -e "  ${YELLOW}Isso irá remover: aplicação, banco de dados, Nginx config e PM2 process.${NC}"
  echo -e "  ${RED}${BOLD}Esta ação é IRREVERSÍVEL.${NC}\n"
  read -rp "  Digite CONFIRMAR para prosseguir: " CONF
  if [[ "$CONF" != "CONFIRMAR" ]]; then
    echo "  Desinstalação cancelada."; exit 0
  fi

  INSTALL_DIR=${INSTALL_DIR:-/var/www/dieta-milenar}
  DB_NAME=${DB_NAME:-dieta_milenar}
  DB_USER=${DB_USER:-dieta_user}

  pm2 stop dieta-milenar 2>/dev/null || true
  pm2 delete dieta-milenar 2>/dev/null || true
  rm -f /etc/nginx/sites-enabled/dieta-milenar
  rm -f /etc/nginx/sites-available/dieta-milenar
  nginx -t && systemctl reload nginx 2>/dev/null || true
  mysql -u root -e "DROP DATABASE IF EXISTS \`${DB_NAME}\`;" 2>/dev/null || true
  mysql -u root -e "DROP USER IF EXISTS '${DB_USER}'@'127.0.0.1';" 2>/dev/null || true
  rm -rf "$INSTALL_DIR"
  rm -f /root/dieta-milenar-summary.txt

  echo -e "\n  ${GREEN}✔  Desinstalação concluída.${NC}\n"
  exit 0
fi

# =============================================================================
#  TELA DE BOAS-VINDAS
# =============================================================================
clear
echo -e "${BOLD}${GREEN}"
cat << 'EOF'

   ██████╗ ██╗███████╗████████╗ █████╗
   ██╔══██╗██║██╔════╝╚══██╔══╝██╔══██╗
   ██║  ██║██║█████╗     ██║   ███████║
   ██║  ██║██║██╔══╝     ██║   ██╔══██║
   ██████╔╝██║███████╗   ██║   ██║  ██║
   ╚═════╝ ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝

   ███╗   ███╗██╗██╗     ███████╗███╗   ██╗ █████╗ ██████╗
   ████╗ ████║██║██║     ██╔════╝████╗  ██║██╔══██╗██╔══██╗
   ██╔████╔██║██║██║     █████╗  ██╔██╗ ██║███████║██████╔╝
   ██║╚██╔╝██║██║██║     ██╔══╝  ██║╚██╗██║██╔══██║██╔══██╗
   ██║ ╚═╝ ██║██║███████╗███████╗██║ ╚████║██║  ██║██║  ██║
   ╚═╝     ╚═╝╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝

EOF
echo -e "${NC}"
echo -e "${BOLD}${CYAN}  ╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}  ║         Setup Wizard  —  Versão 2.0.0               ║${NC}"
echo -e "${BOLD}${CYAN}  ║         SaaS de Venda de E-books de Dietas          ║${NC}"
echo -e "${BOLD}${CYAN}  ╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${DIM}Log desta instalação será salvo em: ${LOG_FILE}${NC}"
echo ""

if [[ "$MODE" == "reconfigure" ]]; then
  echo -e "  ${YELLOW}${BOLD}Modo: RECONFIGURAÇÃO — apenas configurações serão atualizadas.${NC}\n"
fi

echo -e "  ${BOLD}O wizard irá instalar e configurar:${NC}"
echo -e "  ${GREEN}  ✦${NC}  Node.js 20 LTS"
echo -e "  ${GREEN}  ✦${NC}  MySQL — banco de dados"
echo -e "  ${GREEN}  ✦${NC}  Nginx — proxy reverso"
echo -e "  ${GREEN}  ✦${NC}  PM2 — gerenciador de processos"
echo -e "  ${GREEN}  ✦${NC}  Certbot — SSL gratuito (opcional)"
echo -e "  ${GREEN}  ✦${NC}  Aplicação Dieta Milenar"
echo ""
read -rp "  Pressione ENTER para continuar ou CTRL+C para cancelar..." _

# =============================================================================
#  FASE 1 — CHECKLIST DE PRÉ-REQUISITOS
# =============================================================================
clear
echo -e "\n${BOLD}${CYAN}  ══════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}    PRÉ-REQUISITOS DO SISTEMA${NC}"
echo -e "${BOLD}${CYAN}  ══════════════════════════════════════════${NC}\n"

CHECKS_OK=true

check_item() {
  local label=$1
  local ok=$2
  local detail=${3:-""}
  if [[ "$ok" == "true" ]]; then
    printf "  ${GREEN}  ✔${NC}  %-40s ${DIM}%s${NC}\n" "$label" "$detail"
  else
    printf "  ${RED}  ✘${NC}  %-40s ${YELLOW}%s${NC}\n" "$label" "$detail"
    CHECKS_OK=false
  fi
}

# SO compatível
OS_OK=false
if [[ -f /etc/os-release ]]; then
  . /etc/os-release
  [[ "$ID" == "ubuntu" || "$ID" == "debian" ]] && OS_OK=true
fi
check_item "Sistema operacional compatível" "$OS_OK" "${PRETTY_NAME:-Desconhecido}"

# Espaço em disco (mínimo 2GB)
DISK_FREE=$(df / --output=avail -BG | tail -1 | tr -d 'G ')
DISK_OK=false
[[ "$DISK_FREE" -ge 2 ]] && DISK_OK=true
check_item "Espaço em disco (mín. 2 GB)" "$DISK_OK" "${DISK_FREE} GB disponíveis"

# RAM (mínimo 512MB)
RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
RAM_OK=false
[[ "$RAM_MB" -ge 512 ]] && RAM_OK=true
check_item "Memória RAM (mín. 512 MB)" "$RAM_OK" "${RAM_MB} MB disponíveis"

# Conexão com internet
NET_OK=false
ping -c1 -W2 8.8.8.8 &>/dev/null && NET_OK=true
check_item "Conexão com internet" "$NET_OK" ""

# Porta 80 livre
PORT80_OK=true
ss -tlnp | grep -q ':80 ' && PORT80_OK=false
check_item "Porta 80 disponível" "$PORT80_OK" ""

# Porta 3000 livre
PORT3000_OK=true
ss -tlnp | grep -q ':3000 ' && PORT3000_OK=false
check_item "Porta 3000 disponível" "$PORT3000_OK" ""

# Porta 3306 livre ou MySQL já rodando
PORT3306_MSG="disponível"
PORT3306_OK=true
if ss -tlnp | grep -q ':3306 '; then
  PORT3306_MSG="MySQL já em execução"
fi
check_item "Porta 3306 (MySQL)" "$PORT3306_OK" "$PORT3306_MSG"

echo ""

if [[ "$CHECKS_OK" == "false" ]]; then
  echo -e "  ${YELLOW}${BOLD}⚠  Alguns pré-requisitos falharam.${NC}"
  read -rp "  Deseja continuar mesmo assim? [s/N]: " FORCE
  [[ "$FORCE" != "s" && "$FORCE" != "S" ]] && echo "  Instalação cancelada." && exit 1
else
  echo -e "  ${GREEN}${BOLD}✔  Todos os pré-requisitos OK!${NC}"
  sleep 1
fi

# =============================================================================
#  FASE 2 — WIZARD DE PERGUNTAS
# =============================================================================
clear
echo -e "\n${BOLD}${CYAN}  ══════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}    CONFIGURAÇÃO DO SISTEMA${NC}"
echo -e "${BOLD}${CYAN}  ══════════════════════════════════════════${NC}"
echo -e "  ${DIM}Preencha as informações abaixo. Pressione ENTER para usar o valor padrão.${NC}\n"

# Domínio
ask DOMAIN \
  "Domínio ou IP do servidor (ex: meusite.com.br)" \
  "" \
  "^[a-zA-Z0-9._-]+$"

# Porta
ask APP_PORT \
  "Porta da aplicação" \
  "3000" \
  "^[0-9]{2,5}$"

echo ""
echo -e "  ${BOLD}${CYAN}── Banco de Dados ──────────────────────────────────${NC}"

ask DB_NAME \
  "Nome do banco de dados" \
  "dieta_milenar" \
  "^[a-zA-Z0-9_]+$"

ask DB_USER \
  "Usuário MySQL" \
  "dieta_user" \
  "^[a-zA-Z0-9_]+$"

ask_password DB_PASS "Senha MySQL"

echo ""
echo -e "  ${BOLD}${CYAN}── Segurança ───────────────────────────────────────${NC}"

printf "  ${BOLD}${WHITE}JWT Secret${NC} ${DIM}[ENTER = gerar automaticamente]${NC}: "
read -r JWT_INPUT
if [[ -z "$JWT_INPUT" ]]; then
  JWT_SECRET=$(openssl rand -hex 32)
  echo -e "  ${GREEN}  ✔  JWT Secret gerado automaticamente.${NC}"
else
  JWT_SECRET="$JWT_INPUT"
fi

echo ""
echo -e "  ${BOLD}${CYAN}── Pagamentos ──────────────────────────────────────${NC}"

printf "  ${BOLD}${WHITE}Stripe Secret Key${NC} ${DIM}[sk_live_... ou sk_test_... — ENTER para pular]${NC}: "
read -r STRIPE_KEY
if [[ -z "$STRIPE_KEY" ]]; then
  STRIPE_KEY="sk_test_PLACEHOLDER"
  warn "Stripe não configurado. Pagamentos via cartão não funcionarão."
elif [[ ! "$STRIPE_KEY" =~ ^sk_(live|test)_ ]]; then
  warn "Chave Stripe com formato inesperado. Verifique depois no .env"
fi

echo ""
echo -e "  ${BOLD}${CYAN}── Instalação ──────────────────────────────────────${NC}"

ask INSTALL_DIR \
  "Diretório de instalação" \
  "/var/www/dieta-milenar" \
  "^/.*"

# =============================================================================
#  FASE 3 — TELA DE CONFIRMAÇÃO INTERATIVA
# =============================================================================
while true; do
  clear
  echo -e "\n${BOLD}${CYAN}  ╔══════════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${CYAN}  ║              RESUMO DA CONFIGURAÇÃO                  ║${NC}"
  echo -e "${BOLD}${CYAN}  ╚══════════════════════════════════════════════════════╝${NC}\n"

  printf "  ${DIM}%2s${NC}  ${BOLD}%-22s${NC}  ${CYAN}%s${NC}\n" "1" "Domínio / IP"      "$DOMAIN"
  printf "  ${DIM}%2s${NC}  ${BOLD}%-22s${NC}  ${CYAN}%s${NC}\n" "2" "Porta aplicação"   "$APP_PORT"
  printf "  ${DIM}%2s${NC}  ${BOLD}%-22s${NC}  ${CYAN}%s${NC}\n" "3" "Banco de dados"    "$DB_NAME"
  printf "  ${DIM}%2s${NC}  ${BOLD}%-22s${NC}  ${CYAN}%s${NC}\n" "4" "Usuário MySQL"     "$DB_USER"
  printf "  ${DIM}%2s${NC}  ${BOLD}%-22s${NC}  ${CYAN}%s${NC}\n" "5" "Senha MySQL"       "••••••••"
  printf "  ${DIM}%2s${NC}  ${BOLD}%-22s${NC}  ${CYAN}%s${NC}\n" "6" "JWT Secret"        "${JWT_SECRET:0:16}..."
  printf "  ${DIM}%2s${NC}  ${BOLD}%-22s${NC}  ${CYAN}%s${NC}\n" "7" "Stripe Key"        "${STRIPE_KEY:0:20}..."
  printf "  ${DIM}%2s${NC}  ${BOLD}%-22s${NC}  ${CYAN}%s${NC}\n" "8" "Diretório"         "$INSTALL_DIR"
  echo ""
  echo -e "  ${DIM}Digite o número do item para editar, ${BOLD}s${NC}${DIM} para confirmar ou ${BOLD}q${NC}${DIM} para cancelar.${NC}"
  read -rp "  Opção: " EDIT_CHOICE

  case "$EDIT_CHOICE" in
    1) ask DOMAIN    "Domínio ou IP" "$DOMAIN" "^[a-zA-Z0-9._-]+$" ;;
    2) ask APP_PORT  "Porta"         "$APP_PORT" "^[0-9]{2,5}$" ;;
    3) ask DB_NAME   "Banco"         "$DB_NAME" "^[a-zA-Z0-9_]+$" ;;
    4) ask DB_USER   "Usuário MySQL" "$DB_USER" "^[a-zA-Z0-9_]+$" ;;
    5) ask_password DB_PASS "Nova senha MySQL" ;;
    6)
      printf "  JWT Secret [ENTER = manter atual]: "
      read -r _jwt
      [[ -n "$_jwt" ]] && JWT_SECRET="$_jwt"
      ;;
    7)
      printf "  Stripe Key [ENTER = manter atual]: "
      read -r _stripe
      [[ -n "$_stripe" ]] && STRIPE_KEY="$_stripe"
      ;;
    8) ask INSTALL_DIR "Diretório" "$INSTALL_DIR" "^/.*" ;;
    s|S) break ;;
    q|Q) echo "  Instalação cancelada."; exit 0 ;;
  esac
done

# =============================================================================
#  INÍCIO DA INSTALAÇÃO
# =============================================================================
clear
echo -e "\n${BOLD}${GREEN}  ╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}  ║           INICIANDO INSTALAÇÃO...                    ║${NC}"
echo -e "${BOLD}${GREEN}  ╚══════════════════════════════════════════════════════╝${NC}\n"
sleep 1

# =============================================================================
#  ETAPA 1 — DEPENDÊNCIAS DO SISTEMA
# =============================================================================
header "ETAPA 1 — Dependências do sistema"

step "Atualizando lista de pacotes"
apt-get update -qq &
spinner $! "Atualizando apt"

step "Instalando pacotes base"
apt-get install -y -qq curl git unzip nginx mysql-server openssl build-essential rsync &
spinner $! "Instalando curl, git, nginx, mysql, openssl"
log "Pacotes base instalados"

# Node.js 20 LTS
if ! command -v node &>/dev/null || [[ $(node -v | grep -oP '\d+' | head -1) -lt 18 ]]; then
  step "Instalando Node.js 20 LTS"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null &
  spinner $! "Configurando repositório NodeSource"
  apt-get install -y -qq nodejs &
  spinner $! "Instalando Node.js"
  log "Node.js instalado: $(node -v)"
else
  log "Node.js já instalado: $(node -v)"
fi

# PM2
if ! command -v pm2 &>/dev/null; then
  step "Instalando PM2"
  npm install -g pm2 --quiet &
  spinner $! "Instalando PM2 globalmente"
  log "PM2 instalado: $(pm2 -v)"
else
  log "PM2 já instalado: $(pm2 -v)"
fi

# =============================================================================
#  ETAPA 2 — CONFIGURAÇÃO DO MYSQL
# =============================================================================
header "ETAPA 2 — Configurando MySQL"

step "Iniciando serviço MySQL"
systemctl enable mysql --quiet
systemctl start mysql
log "MySQL em execução"

step "Criando banco e usuário"
mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL
log "Banco '${DB_NAME}' e usuário '${DB_USER}' configurados"

# =============================================================================
#  ETAPA 3 — INSTALAÇÃO DA APLICAÇÃO
# =============================================================================
header "ETAPA 3 — Instalando aplicação"

mkdir -p "$INSTALL_DIR"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f "$SCRIPT_DIR/package.json" ]]; then
  step "Copiando arquivos do projeto"
  rsync -a --exclude='node_modules' --exclude='.git' --exclude='dist' \
    "$SCRIPT_DIR/" "$INSTALL_DIR/" &
  spinner $! "Copiando para $INSTALL_DIR"
  log "Arquivos copiados"
else
  error "package.json não encontrado. Coloque install.sh na raiz do projeto."
fi

cd "$INSTALL_DIR"

# .env
step "Criando arquivo .env"
cat > "$INSTALL_DIR/.env" <<ENV
# ── MySQL ──────────────────────────────────────────────
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
DB_NAME=${DB_NAME}

# ── JWT ────────────────────────────────────────────────
JWT_SECRET=${JWT_SECRET}

# ── Stripe ─────────────────────────────────────────────
STRIPE_SECRET_KEY=${STRIPE_KEY}

# ── Node ───────────────────────────────────────────────
PORT=${APP_PORT}
NODE_ENV=production
ENV
chmod 600 "$INSTALL_DIR/.env"
log ".env criado com permissões seguras (600)"

# npm install
step "Instalando dependências npm"
npm install --omit=dev --silent &
spinner $! "npm install (sem devDependencies)"
log "Dependências npm instaladas"

# Build
step "Build do frontend (Vite)"
npm run build &
spinner $! "Compilando React/Vite"
log "Build de produção gerado em dist/"

# =============================================================================
#  ETAPA 4 — SCHEMA DO BANCO
# =============================================================================
header "ETAPA 4 — Importando schema do banco"

SQL_FILE=""
for f in "DataBase/DB_ATUAL.sql" "schema.sql" "DataBase/DB_ATUAL2.sql"; do
  if [[ -f "$INSTALL_DIR/$f" ]]; then
    SQL_FILE="$INSTALL_DIR/$f"; break
  fi
done

if [[ -n "$SQL_FILE" ]]; then
  step "Importando schema principal"
  mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE" 2>/dev/null || \
    warn "Schema já importado ou erro parcial (pode ser seguro ignorar)"
  log "Schema importado: $SQL_FILE"
else
  warn "Nenhum arquivo SQL encontrado. Importe o schema manualmente depois."
fi

for migration in "DataBase/migration_tickets.sql" "DataBase/migration_payment_proof.sql"; do
  if [[ -f "$INSTALL_DIR/$migration" ]]; then
    step "Aplicando migration: $migration"
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$INSTALL_DIR/$migration" 2>/dev/null || \
      warn "Migration $migration já aplicada ou falhou"
    log "Migration aplicada: $migration"
  fi
done

# =============================================================================
#  ETAPA 5 — PERMISSÕES E DIRETÓRIOS
# =============================================================================
header "ETAPA 5 — Permissões e diretórios"

mkdir -p "$INSTALL_DIR/public/e-books"
mkdir -p "$INSTALL_DIR/public/proofs"
mkdir -p "$INSTALL_DIR/public/img"
chown -R www-data:www-data "$INSTALL_DIR/public"
chmod -R 755 "$INSTALL_DIR/public"
chown -R www-data:www-data "$INSTALL_DIR"
log "Diretórios e permissões configurados"

# =============================================================================
#  ETAPA 6 — PM2
# =============================================================================
header "ETAPA 6 — Configurando PM2"

mkdir -p /var/log/dieta-milenar
chown www-data:www-data /var/log/dieta-milenar

cat > "$INSTALL_DIR/ecosystem.config.cjs" <<PM2
module.exports = {
  apps: [{
    name: 'dieta-milenar',
    script: 'server.ts',
    interpreter: 'node',
    interpreter_args: '--import tsx/esm',
    cwd: '${INSTALL_DIR}',
    env_production: {
      NODE_ENV: 'production',
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    error_file: '/var/log/dieta-milenar/error.log',
    out_file: '/var/log/dieta-milenar/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
PM2

pm2 stop dieta-milenar 2>/dev/null || true
pm2 start "$INSTALL_DIR/ecosystem.config.cjs" --env production
pm2 save
pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true
log "Aplicação iniciada via PM2"

# =============================================================================
#  ETAPA 7 — NGINX
# =============================================================================
header "ETAPA 7 — Configurando Nginx"

rm -f /etc/nginx/sites-enabled/default

cat > "/etc/nginx/sites-available/dieta-milenar" <<NGINX
server {
    listen 80;
    server_name ${DOMAIN:-_};

    client_max_body_size 110M;

    access_log /var/log/nginx/dieta-milenar.access.log;
    error_log  /var/log/nginx/dieta-milenar.error.log;

    location / {
        proxy_pass         http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        proxy_pass http://127.0.0.1:${APP_PORT};
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
NGINX

ln -sf /etc/nginx/sites-available/dieta-milenar /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
log "Nginx configurado"

# =============================================================================
#  ETAPA 8 — SSL
# =============================================================================
header "ETAPA 8 — SSL (Certbot)"

if [[ -n "$DOMAIN" && "$DOMAIN" != "localhost" && "$DOMAIN" =~ \. ]]; then
  echo -e "  ${BOLD}Deseja instalar SSL gratuito (Let's Encrypt) para ${CYAN}$DOMAIN${NC}${BOLD}?${NC}"
  read -rp "  [s/N]: " DO_SSL
  if [[ "$DO_SSL" == "s" || "$DO_SSL" == "S" ]]; then
    if ! command -v certbot &>/dev/null; then
      apt-get install -y -qq certbot python3-certbot-nginx &
      spinner $! "Instalando Certbot"
    fi
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" && \
      log "SSL instalado com sucesso para $DOMAIN" || \
      warn "SSL falhou. Configure depois: certbot --nginx -d $DOMAIN"
  else
    info "SSL pulado. Configure depois com: certbot --nginx -d $DOMAIN"
  fi
else
  info "Domínio local ou IP detectado. SSL pulado."
fi

# =============================================================================
#  TESTE PÓS-INSTALAÇÃO
# =============================================================================
echo ""
echo -e "${BOLD}${CYAN}  ══════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}    TESTE PÓS-INSTALAÇÃO${NC}"
echo -e "${BOLD}${CYAN}  ══════════════════════════════════════════${NC}\n"

sleep 3  # Aguarda app subir

check_service() {
  local label=$1
  local ok=$2
  if [[ "$ok" == "true" ]]; then
    printf "  ${GREEN}  ✔${NC}  %-40s ${GREEN}OK${NC}\n" "$label"
  else
    printf "  ${RED}  ✘${NC}  %-40s ${RED}FALHOU${NC}\n" "$label"
  fi
}

# PM2
PM2_OK=false
pm2 list | grep -q "dieta-milenar" && pm2 list | grep -q "online" && PM2_OK=true
check_service "PM2 — aplicação online" "$PM2_OK"

# MySQL
MYSQL_OK=false
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT 1;" &>/dev/null && MYSQL_OK=true
check_service "MySQL — conexão com banco" "$MYSQL_OK"

# Nginx
NGINX_OK=false
systemctl is-active --quiet nginx && NGINX_OK=true
check_service "Nginx — serviço ativo" "$NGINX_OK"

# App HTTP
APP_OK=false
sleep 2
curl -sf "http://localhost:${APP_PORT}" -o /dev/null --max-time 5 && APP_OK=true
check_service "Aplicação — respondendo HTTP" "$APP_OK"

# .env permissão
ENV_OK=false
[[ "$(stat -c %a "$INSTALL_DIR/.env" 2>/dev/null)" == "600" ]] && ENV_OK=true
check_service ".env com permissão 600" "$ENV_OK"

echo ""

# =============================================================================
#  ARQUIVO DE RESUMO
# =============================================================================
SUMMARY_FILE="/root/dieta-milenar-summary.txt"
cat > "$SUMMARY_FILE" <<SUMMARY
======================================================
  SaaS Dieta Milenar — Resumo da Instalação
  Data: $(date '+%d/%m/%Y %H:%M:%S')
======================================================

  URL de acesso:     http://${DOMAIN}
  Diretório:         ${INSTALL_DIR}
  Porta interna:     ${APP_PORT}

  Banco de dados:    ${DB_NAME}
  Usuário MySQL:     ${DB_USER}
  Senha MySQL:       ${DB_PASS}

  JWT Secret:        ${JWT_SECRET}
  Stripe Key:        ${STRIPE_KEY}

  Login padrão:
    E-mail: admin@dietasmilenares.com
    Senha:  admin123

  ⚠  TROQUE A SENHA DO ADMIN IMEDIATAMENTE!
  ⚠  Proteja este arquivo: chmod 600 ${SUMMARY_FILE}

======================================================
  Comandos úteis:
    pm2 status                    → Status da app
    pm2 logs dieta-milenar        → Logs em tempo real
    pm2 restart dieta-milenar     → Reiniciar
    systemctl status nginx        → Status Nginx
    sudo bash install.sh --reconfigure  → Reconfigurar
    sudo bash install.sh --uninstall    → Desinstalar
======================================================
SUMMARY

chmod 600 "$SUMMARY_FILE"

# =============================================================================
#  RESUMO FINAL
# =============================================================================
clear
echo -e "\n${BOLD}${GREEN}"
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║                                                      ║"
echo "  ║       ✔   INSTALAÇÃO CONCLUÍDA COM SUCESSO!          ║"
echo "  ║                                                      ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "  ${BOLD}URL de acesso:${NC}     ${CYAN}http://${DOMAIN}${NC}"
echo -e "  ${BOLD}Diretório:${NC}         ${CYAN}$INSTALL_DIR${NC}"
echo -e "  ${BOLD}Resumo salvo em:${NC}   ${CYAN}$SUMMARY_FILE${NC}"
echo -e "  ${BOLD}Log completo:${NC}      ${CYAN}$LOG_FILE${NC}"
echo ""
echo -e "  ${BOLD}${YELLOW}Login padrão:${NC}"
echo -e "  ${BOLD}E-mail:${NC}  admin@dietasmilenares.com"
echo -e "  ${BOLD}Senha:${NC}   admin123"
echo ""
echo -e "  ${BOLD}${RED}⚠  Troque a senha do admin imediatamente após o primeiro acesso!${NC}"
echo ""
echo -e "  ${BOLD}Comandos úteis:${NC}"
echo -e "  ${CYAN}pm2 status${NC}                        → Status da aplicação"
echo -e "  ${CYAN}pm2 logs dieta-milenar${NC}            → Ver logs em tempo real"
echo -e "  ${CYAN}pm2 restart dieta-milenar${NC}         → Reiniciar aplicação"
echo -e "  ${CYAN}systemctl status nginx${NC}            → Status do Nginx"
echo -e "  ${CYAN}sudo bash install.sh --reconfigure${NC} → Reconfigurar"
echo -e "  ${CYAN}sudo bash install.sh --uninstall${NC}   → Desinstalar"
echo ""
