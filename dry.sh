#!/usr/bin/env bash
# =============================================================================
#  INSTALADOR PROFISSIONAL — SaaS Dieta Milenar
#  Versão: 2.0.0
#  Compatível: Ubuntu 20.04+ / Debian 11+
#  Modo: Idempotente · Modular · Dry-Run Ready
#
#  USO:
#    sudo bash install.sh              → Instalação real
#    sudo bash install.sh --dry-run    → Simulação sem alterações
# =============================================================================

set -euo pipefail

# ══════════════════════════════════════════════════════════════════════════════
#  MÓDULO 0 — BOOTSTRAP: CORES, FLAGS, HELPERS GLOBAIS
# ══════════════════════════════════════════════════════════════════════════════

# ─── Paleta de cores ──────────────────────────────────────────────────────────
RED='\033[0;31m';    GREEN='\033[0;32m';   YELLOW='\033[1;33m'
BLUE='\033[0;34m';   CYAN='\033[0;36m';   MAGENTA='\033[0;35m'
WHITE='\033[1;37m';  DIM='\033[2m';        BOLD='\033[1m'
BG_DARK='\033[40m';  NC='\033[0m'

# ─── Flag global de dry-run ───────────────────────────────────────────────────
DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

# ─── Contadores de progresso ──────────────────────────────────────────────────
TOTAL_STEPS=11
CURRENT_STEP=0
STEP_START_TIME=0
INSTALL_START_TIME=$(date +%s)
declare -A STEP_TIMES
declare -A STEP_STATUS

# ─── Logger principal ─────────────────────────────────────────────────────────
log()    { echo -e "  ${GREEN}✔${NC}  $1"; }
warn()   { echo -e "  ${YELLOW}⚠${NC}  ${YELLOW}$1${NC}"; }
info()   { echo -e "  ${CYAN}→${NC}  ${DIM}$1${NC}"; }
error()  { echo -e "\n  ${RED}✘  ERRO FATAL:${NC} $1\n"; exit 1; }
drylog() { echo -e "  ${MAGENTA}◈${NC}  ${MAGENTA}[DRY-RUN]${NC} ${DIM}$1${NC}"; }

# ─── Executor central (coração do dry-run) ────────────────────────────────────
# Uso: exec_cmd "descrição" comando arg1 arg2 ...
exec_cmd() {
  local desc="$1"; shift
  if [[ "$DRY_RUN" == true ]]; then
    drylog "$desc"
    drylog "  ${DIM}↳ CMD: $*${NC}"
  else
    "$@"
  fi
}

# exec_silent: executa sem output (para comandos que já têm log próprio)
exec_silent() {
  local desc="$1"; shift
  if [[ "$DRY_RUN" == true ]]; then
    drylog "$desc"
  else
    "$@" > /dev/null 2>&1 || true
  fi
}

# exec_or_warn: executa; se falhar em modo real, apenas avisa
exec_or_warn() {
  local desc="$1"; shift
  if [[ "$DRY_RUN" == true ]]; then
    drylog "$desc"
  else
    "$@" || warn "$desc falhou (não-fatal)"
  fi
}

# write_file: simula ou executa escrita de arquivo via heredoc
# Uso: write_file "destino" "descrição" <<'EOF' ... EOF
write_file() {
  local dest="$1"
  local desc="${2:-Criando $dest}"
  local content
  content=$(cat)

  if [[ "$DRY_RUN" == true ]]; then
    drylog "$desc"
    drylog "  ↳ DESTINO: $dest"
    drylog "  ↳ PREVIEW (primeiras 3 linhas):"
    echo "$content" | head -3 | while IFS= read -r line; do
      echo -e "     ${DIM}│ $line${NC}"
    done
    echo -e "     ${DIM}│ ...${NC}"
  else
    echo "$content" > "$dest"
  fi
}

# ─── Bloco de heredoc PHP/Nginx/ENV (wrapper read-friendly) ──────────────────
write_file_from_var() {
  local dest="$1"
  local desc="$2"
  local content="$3"

  if [[ "$DRY_RUN" == true ]]; then
    drylog "$desc"
    drylog "  ↳ DESTINO: $dest"
    echo "$content" | head -3 | while IFS= read -r line; do
      echo -e "     ${DIM}│ $line${NC}"
    done
    echo -e "     ${DIM}│ ...${NC}"
  else
    echo "$content" > "$dest"
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
#  MÓDULO 1 — INTERFACE CLI PREMIUM
# ──────────────────────────────────────────────────────────────────────────────

print_banner() {
  clear
  echo ""
  echo -e "${BOLD}${CYAN}"
  echo "  ╔══════════════════════════════════════════════════════════════════╗"
  echo "  ║                                                                  ║"
  echo "  ║        ◈  DIETA MILENAR  —  INSTALADOR PROFISSIONAL  ◈          ║"
  echo "  ║                                                                  ║"
  echo "  ║   Stack: Node.js · React/Vite · MySQL · Nginx · PM2 · PHP       ║"
  echo "  ║   Versão: 2.0.0   │   Ubuntu 20.04+ / Debian 11+                ║"
  echo "  ║                                                                  ║"
  echo -e "  ╚══════════════════════════════════════════════════════════════════╝${NC}"

  if [[ "$DRY_RUN" == true ]]; then
    echo ""
    echo -e "  ${BG_DARK}${MAGENTA}${BOLD}  ◈  MODO DRY-RUN ATIVO — NENHUMA ALTERAÇÃO SERÁ FEITA NO SISTEMA  ◈  ${NC}"
    echo ""
  fi
  echo ""
}

# ─── Header de etapa com progress bar ────────────────────────────────────────
step_header() {
  local title="$1"
  CURRENT_STEP=$((CURRENT_STEP + 1))
  STEP_START_TIME=$(date +%s)

  local filled=$CURRENT_STEP
  local empty=$((TOTAL_STEPS - CURRENT_STEP))
  local bar=""

  for ((i=0; i<filled; i++)); do bar+="█"; done
  for ((i=0; i<empty;  i++)); do bar+="░"; done

  local pct=$(( (CURRENT_STEP * 100) / TOTAL_STEPS ))

  echo ""
  echo -e "  ${DIM}┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄${NC}"
  echo -e "  ${BOLD}${CYAN}ETAPA ${CURRENT_STEP}/${TOTAL_STEPS}${NC}  ${BOLD}${WHITE}${title}${NC}"
  echo -e "  ${CYAN}${bar}${NC}  ${DIM}${pct}%${NC}"
  echo -e "  ${DIM}┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄${NC}"
  echo ""
}

# ─── Registra tempo de conclusão da etapa ────────────────────────────────────
step_done() {
  local label="$1"
  local status="${2:-OK}"
  local elapsed=$(( $(date +%s) - STEP_START_TIME ))
  STEP_TIMES["$label"]="$elapsed"
  STEP_STATUS["$label"]="$status"
  echo -e "\n  ${GREEN}✔  Etapa concluída${NC}  ${DIM}(${elapsed}s)${NC}"
}

step_skipped() {
  local label="$1"
  STEP_TIMES["$label"]=0
  STEP_STATUS["$label"]="SKIP"
  echo -e "\n  ${YELLOW}⊘  Etapa ignorada${NC}"
}

# ──────────────────────────────────────────────────────────────────────────────
#  MÓDULO 2 — PRÉ-VALIDAÇÕES
# ──────────────────────────────────────────────────────────────────────────────

validate_environment() {
  # Root check
  [[ $EUID -ne 0 ]] && error "Execute como root: sudo bash install.sh"

  # Origem dos arquivos
  REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  PROJECT_SRC="$REPO_DIR/DietaMilelar"
  SOCIALPROOF_SRC="$REPO_DIR/SocialProof"

  if [[ "$DRY_RUN" == false ]]; then
    [[ ! -d "$PROJECT_SRC" ]] && \
      error "Pasta 'DietaMilelar' não encontrada em $REPO_DIR. Clone o repositório corretamente."
  else
    if [[ ! -d "$PROJECT_SRC" ]]; then
      warn "Pasta 'DietaMilelar' não encontrada — ignorado no dry-run"
      PROJECT_SRC="$REPO_DIR/DietaMilelar_SIMULADO"
    fi
  fi

  # Diretórios de instalação
  INSTALL_DIR="/var/www/dieta-milenar"
  SOCIALPROOF_DIR="/var/www/socialproof"
  APP_PORT=3000
}

# ──────────────────────────────────────────────────────────────────────────────
#  MÓDULO 3 — CONFIGURAÇÃO INTERATIVA
# ──────────────────────────────────────────────────────────────────────────────

collect_config() {
  echo -e "  ${BOLD}${WHITE}● Detectando IP público...${NC}\n"

  PUBLIC_IP=""
  for SERVICE in "https://api.ipify.org" "https://ipecho.net/plain" "https://checkip.amazonaws.com"; do
    PUBLIC_IP=$(curl -s --max-time 5 "$SERVICE" 2>/dev/null | tr -d '[:space:]')
    if [[ "$PUBLIC_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then break; fi
    PUBLIC_IP=""
  done

  if [[ -z "$PUBLIC_IP" ]]; then
    warn "IP público não detectado. Usando IP local como fallback."
    PUBLIC_IP=$(hostname -I | awk '{print $1}')
  fi

  echo -e "  ${DIM}IP detectado:${NC} ${CYAN}${BOLD}${PUBLIC_IP}${NC}\n"

  # ─── Domínio ────────────────────────────────────────────────────────────────
  echo -e "  ${DIM}┌─ Domínio ───────────────────────────────────────────────────────────┐${NC}"
  read -rp "  │  Usar domínio em vez do IP? [s/N]: " USE_DOMAIN
  echo -e "  ${DIM}└────────────────────────────────────────────────────────────────────┘${NC}\n"

  if [[ "$USE_DOMAIN" == "s" || "$USE_DOMAIN" == "S" ]]; then
    read -rp "  Domínio (ex: meusite.com.br): " DOMAIN
    DOMAIN=$(echo "$DOMAIN" | tr -d '[:space:]' | sed 's|https\?://||' | sed 's|/.*||')
    [[ -z "$DOMAIN" ]] && error "Domínio não pode ser vazio."
    log "Domínio configurado: ${CYAN}${DOMAIN}${NC}"
    USE_SSL=true
  else
    DOMAIN="$PUBLIC_IP"
    log "IP público: ${CYAN}${DOMAIN}${NC}"
    USE_SSL=false
  fi

  echo ""
  echo -e "  ${DIM}┌─ Banco de Dados ────────────────────────────────────────────────────┐${NC}"
  read -rp "  │  Nome do banco   [dieta_milenar]: " DB_NAME;  DB_NAME=${DB_NAME:-dieta_milenar}
  read -rp "  │  Usuário MySQL   [dieta_user]:    " DB_USER;  DB_USER=${DB_USER:-dieta_user}
  while true; do
    read -rsp "  │  Senha MySQL (oculta): " DB_PASS; echo
    [[ -n "$DB_PASS" ]] && break
    warn "Senha não pode ser vazia."
  done
  echo -e "  ${DIM}└────────────────────────────────────────────────────────────────────┘${NC}\n"

  echo -e "  ${DIM}┌─ Segurança ─────────────────────────────────────────────────────────┐${NC}"
  read -rp "  │  JWT Secret [Enter = gerar automático]: " JWT_SECRET
  JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 32)}
  log "JWT Secret: ${DIM}${JWT_SECRET:0:16}...${NC}"

  echo ""
  read -rp "  │  Stripe Key [sk_live/sk_test | Enter = pular]: " STRIPE_KEY
  echo -e "  ${DIM}└────────────────────────────────────────────────────────────────────┘${NC}\n"

  if [[ -z "$STRIPE_KEY" ]]; then
    warn "Stripe não configurado. Configure em .env após instalação."
  fi
  STRIPE_KEY=${STRIPE_KEY:-sk_test_PLACEHOLDER}
}

# ─── Resumo de configuração ───────────────────────────────────────────────────
print_config_summary() {
  local ssl_status="Não"
  [[ "$USE_SSL" == true ]] && ssl_status="${GREEN}Sim (Let's Encrypt)${NC}"

  local stripe_status="${YELLOW}Não configurado${NC}"
  [[ "$STRIPE_KEY" != "sk_test_PLACEHOLDER" ]] && stripe_status="${GREEN}Configurado${NC}"

  echo ""
  echo -e "  ${BOLD}${WHITE}╔══════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "  ${BOLD}${WHITE}║                   RESUMO DA CONFIGURAÇÃO                        ║${NC}"
  echo -e "  ${BOLD}${WHITE}╠══════════════════════════════════════════════════════════════════╣${NC}"
  printf "  ${BOLD}${WHITE}║${NC}  %-20s ${CYAN}%-42s${WHITE}${BOLD}║${NC}\n" "Endereço:"      "$DOMAIN"
  printf "  ${BOLD}${WHITE}║${NC}  %-20s ${CYAN}%-42s${WHITE}${BOLD}║${NC}\n" "Porta backend:" "$APP_PORT (interno, PM2)"
  printf "  ${BOLD}${WHITE}║${NC}  %-20s ${CYAN}%-42s${WHITE}${BOLD}║${NC}\n" "Porta pública:" "80 (Nginx)"
  printf "  ${BOLD}${WHITE}║${NC}  %-20s ${CYAN}%-42s${WHITE}${BOLD}║${NC}\n" "Banco:"         "$DB_NAME"
  printf "  ${BOLD}${WHITE}║${NC}  %-20s ${CYAN}%-42s${WHITE}${BOLD}║${NC}\n" "Usuário DB:"    "$DB_USER"
  printf "  ${BOLD}${WHITE}║${NC}  %-20s ${CYAN}%-42s${WHITE}${BOLD}║${NC}\n" "App dir:"       "$INSTALL_DIR"
  printf "  ${BOLD}${WHITE}║${NC}  %-20s ${CYAN}%-42s${WHITE}${BOLD}║${NC}\n" "SocialProof:"   "$SOCIALPROOF_DIR"
  printf "  ${BOLD}${WHITE}║${NC}  %-20s ${CYAN}%-42s${WHITE}${BOLD}║${NC}\n" "phpMyAdmin:"    "http://$DOMAIN/phpmyadmin"
  printf "  ${BOLD}${WHITE}║${NC}  %-20s %-42b${WHITE}${BOLD}║${NC}\n"        "SSL:"           "$ssl_status"
  printf "  ${BOLD}${WHITE}║${NC}  %-20s %-42b${WHITE}${BOLD}║${NC}\n"        "Stripe:"        "$stripe_status"
  echo -e "  ${BOLD}${WHITE}╚══════════════════════════════════════════════════════════════════╝${NC}"
  echo ""

  if [[ "$DRY_RUN" == true ]]; then
    echo -e "  ${MAGENTA}${BOLD}◈  DRY-RUN: nenhuma das etapas abaixo modificará o sistema.${NC}"
    echo ""
  fi

  read -rp "  Confirmar e iniciar? [s/N]: " CONFIRM
  [[ "$CONFIRM" != "s" && "$CONFIRM" != "S" ]] && echo -e "\n  Instalação cancelada.\n" && exit 0
}

# ──────────────────────────────────────────────────────────────────────────────
#  MÓDULO 4 — ETAPAS DE INSTALAÇÃO
# ──────────────────────────────────────────────────────────────────────────────

# ─── ETAPA 1: Dependências do sistema ────────────────────────────────────────
etapa_dependencias() {
  step_header "Dependências do Sistema"

  # Para Apache2 se necessário
  if systemctl is-active --quiet apache2 2>/dev/null; then
    warn "Apache2 detectado na porta 80 — liberando para Nginx..."
    exec_cmd  "Parar Apache2"    systemctl stop apache2
    exec_silent "Desativar Apache2 do boot" systemctl disable apache2
    log "Apache2 parado e desativado"
  fi

  info "Atualizando índice de pacotes..."
  exec_cmd "apt-get update" apt-get update -qq

  info "Instalando pacotes do sistema..."
  exec_cmd "Instalando pacotes base" apt-get install -y -qq \
    curl git unzip nginx mysql-server openssl build-essential \
    php php-mbstring php-zip php-gd php-json php-curl php-mysql php-fpm

  log "Pacotes base instalados"

  # ─── Node.js 20 LTS ─────────────────────────────────────────────────────
  if ! command -v node &>/dev/null || [[ $(node -v 2>/dev/null | grep -oP '\d+' | head -1) -lt 18 ]]; then
    info "Node.js não encontrado ou desatualizado — instalando v20 LTS..."
    exec_cmd "Baixar setup Node.js 20" bash -c \
      "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null"
    exec_cmd "Instalar nodejs" apt-get install -y -qq nodejs
    log "Node.js 20 LTS instalado"
  else
    log "Node.js já presente: $(node -v 2>/dev/null || echo 'simulado')"
  fi

  # ─── PM2 ────────────────────────────────────────────────────────────────
  if ! command -v pm2 &>/dev/null; then
    info "Instalando PM2 globalmente..."
    exec_cmd "npm install -g pm2" npm install -g pm2 --quiet
    log "PM2 instalado"
  else
    log "PM2 já presente: $(pm2 -v 2>/dev/null || echo 'simulado')"
  fi

  step_done "dependencias"
}

# ─── ETAPA 2: MySQL ───────────────────────────────────────────────────────────
etapa_mysql() {
  step_header "Configuração do MySQL"

  exec_cmd  "Habilitar serviço MySQL" systemctl enable mysql --quiet
  exec_cmd  "Iniciar MySQL"           systemctl start mysql

  local SQL_BLOCK="
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
CREATE DATABASE IF NOT EXISTS \`socialproof\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON \`socialproof\`.* TO '${DB_USER}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`socialproof\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;"

  if [[ "$DRY_RUN" == true ]]; then
    drylog "mysql -u root <<SQL"
    echo "$SQL_BLOCK" | while IFS= read -r line; do
      [[ -n "$line" ]] && echo -e "     ${DIM}│ $line${NC}"
    done
  else
    mysql -u root <<< "$SQL_BLOCK"
  fi

  log "Banco '${DB_NAME}' e usuário '${DB_USER}' prontos"
  step_done "mysql"
}

# ─── ETAPA 3: phpMyAdmin ──────────────────────────────────────────────────────
etapa_phpmyadmin() {
  step_header "Instalação do phpMyAdmin"

  local PMA_VERSION="5.2.1"
  local PMA_DIR="/var/www/phpmyadmin"
  local PMA_ZIP="/tmp/phpmyadmin.zip"

  if [[ ! -d "$PMA_DIR" ]]; then
    info "Baixando phpMyAdmin ${PMA_VERSION}..."
    exec_cmd "Download phpMyAdmin" curl -fsSL \
      "https://files.phpmyadmin.net/phpMyAdmin/${PMA_VERSION}/phpMyAdmin-${PMA_VERSION}-all-languages.zip" \
      -o "$PMA_ZIP"

    exec_cmd "Extrair phpMyAdmin" unzip -q "$PMA_ZIP" -d /tmp/pma_extract
    exec_cmd "Mover para $PMA_DIR" mv \
      "/tmp/pma_extract/phpMyAdmin-${PMA_VERSION}-all-languages" "$PMA_DIR"
    exec_silent "Limpar temporários" rm -f "$PMA_ZIP"
    exec_silent "Limpar diretório de extração" rm -rf /tmp/pma_extract
    log "phpMyAdmin ${PMA_VERSION} instalado"
  else
    log "phpMyAdmin já presente em $PMA_DIR"
  fi

  # ─── config.inc.php ──────────────────────────────────────────────────────
  local PMA_BLOWFISH
  PMA_BLOWFISH=$(openssl rand -hex 32)

  local PMA_CONFIG="<?php
\$cfg['blowfish_secret'] = '${PMA_BLOWFISH}';
\$i = 1;
\$cfg['Servers'][\$i]['auth_type']       = 'cookie';
\$cfg['Servers'][\$i]['host']            = '127.0.0.1';
\$cfg['Servers'][\$i]['port']            = '3306';
\$cfg['Servers'][\$i]['connect_type']    = 'tcp';
\$cfg['Servers'][\$i]['compress']        = false;
\$cfg['Servers'][\$i]['AllowNoPassword'] = false;
\$cfg['UploadDir'] = '';
\$cfg['SaveDir']   = '';"

  write_file_from_var "$PMA_DIR/config.inc.php" "Escrevendo config.inc.php" "$PMA_CONFIG"

  exec_cmd "Criar diretório tmp" mkdir -p "$PMA_DIR/tmp"
  exec_cmd "Permissões phpMyAdmin" chown -R www-data:www-data "$PMA_DIR"
  exec_cmd "Permissões tmp" chmod 750 "$PMA_DIR/tmp"

  # ─── Detecta versão PHP ──────────────────────────────────────────────────
  PHP_VERSION=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null || echo "8.3")
  PHP_FPM_SOCK="/var/run/php/php${PHP_VERSION}-fpm.sock"

  exec_silent "Habilitar php-fpm" systemctl enable "php${PHP_VERSION}-fpm" --quiet
  exec_or_warn "Iniciar php-fpm"  systemctl start  "php${PHP_VERSION}-fpm"

  log "phpMyAdmin OK — PHP ${PHP_VERSION} · Socket: ${PHP_FPM_SOCK}"
  step_done "phpmyadmin"
}

# ─── ETAPA 4: Arquivos do projeto ────────────────────────────────────────────
etapa_arquivos() {
  step_header "Transferência dos Arquivos do Projeto"

  # ─── Projeto principal ───────────────────────────────────────────────────
  info "DietaMilelar → $INSTALL_DIR"
  exec_cmd "Criar diretório $INSTALL_DIR" mkdir -p "$INSTALL_DIR"
  exec_cmd "Rsync DietaMilelar" rsync -a \
    --exclude='node_modules' --exclude='.git' --exclude='dist' \
    "$PROJECT_SRC/" "$INSTALL_DIR/"
  log "Projeto principal copiado"

  # ─── SocialProof ─────────────────────────────────────────────────────────
  if [[ -d "$SOCIALPROOF_SRC" ]] || [[ "$DRY_RUN" == true ]]; then
    info "SocialProof → $SOCIALPROOF_DIR"
    exec_cmd "Criar diretório $SOCIALPROOF_DIR" mkdir -p "$SOCIALPROOF_DIR"
    exec_cmd "Rsync SocialProof" rsync -a \
      --exclude='.git' --exclude='DataBaseFULL' \
      "$SOCIALPROOF_SRC/" "$SOCIALPROOF_DIR/"

    local SP_CONFIG="<?php
// config.php — Social Proof Engine (gerado pelo instalador)
define('APP_VERSION', '2.0.0');
define('CLAUDE_MODEL', 'claude-opus-4-5');
date_default_timezone_set('America/Sao_Paulo');
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'socialproof');
define('DB_USER', '${DB_USER}');
define('DB_PASS', '${DB_PASS}');"

    write_file_from_var \
      "$SOCIALPROOF_DIR/includes/config.php" \
      "Escrevendo config.php do SocialProof" \
      "$SP_CONFIG"

    exec_cmd "Permissões SocialProof" chown -R www-data:www-data "$SOCIALPROOF_DIR"
    log "SocialProof copiado e configurado"
  else
    warn "Pasta SocialProof não encontrada — pulando."
  fi

  # ─── Estrutura de diretórios ─────────────────────────────────────────────
  info "Criando estrutura de diretórios..."
  for dir in \
    "$INSTALL_DIR/public/e-books" \
    "$INSTALL_DIR/public/proofs" \
    "$INSTALL_DIR/public/img" \
    "$INSTALL_DIR/socialmembers" \
    "/var/log/dieta-milenar"
  do
    exec_cmd "mkdir -p $dir" mkdir -p "$dir"
  done
  log "Estrutura de diretórios criada"

  step_done "arquivos"
}

# ─── ETAPA 5: .env ────────────────────────────────────────────────────────────
etapa_env() {
  step_header "Criação do Arquivo .env"

  local ENV_CONTENT="# ── MySQL ──────────────────────────────────────────────
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
NODE_ENV=production"

  write_file_from_var "$INSTALL_DIR/.env" "Escrevendo .env" "$ENV_CONTENT"
  exec_cmd "Blindar .env (chmod 600)" chmod 600 "$INSTALL_DIR/.env"

  log ".env criado com permissões seguras (600)"
  step_done "env"
}

# ─── ETAPA 6: NPM + Build Vite ────────────────────────────────────────────────
etapa_build() {
  step_header "Dependências NPM + Build do Frontend"

  # ─── Patch ChatWidget ────────────────────────────────────────────────────
  local CHAT_WIDGET="$INSTALL_DIR/src/components/ChatWidget.tsx"
  if [[ -f "$CHAT_WIDGET" ]] || [[ "$DRY_RUN" == true ]]; then
    local NEW_URL="http://${DOMAIN}/socialproof/widget/index.php?room=dieta-faraonica"
    info "Atualizando URL do ChatWidget → $NEW_URL"
    exec_cmd "Patch ChatWidget.tsx" sed -i \
      "s|https://socialproof-production\.up\.railway\.app/widget/index\.php?room=dieta-faraonica|${NEW_URL}|g" \
      "$CHAT_WIDGET"
    log "ChatWidget atualizado"
  else
    warn "ChatWidget.tsx não encontrado — verifique o caminho"
  fi

  exec_cmd "npm install (produção)" bash -c "cd '$INSTALL_DIR' && npm install --silent"
  log "Dependências npm instaladas"

  exec_cmd "npm run build (Vite)" bash -c "cd '$INSTALL_DIR' && npm run build"

  if [[ "$DRY_RUN" == false ]]; then
    [[ ! -f "$INSTALL_DIR/dist/index.html" ]] && \
      error "Build falhou — dist/index.html não gerado."
  else
    drylog "Verificação dist/index.html (simulado)"
  fi

  log "Build Vite concluído: $INSTALL_DIR/dist/"

  exec_cmd "npm prune (remover devDeps)" bash -c "cd '$INSTALL_DIR' && npm prune --omit=dev --silent"
  log "devDependencies removidas (~300MB economizados)"

  step_done "build"
}

# ─── ETAPA 7: Schema do banco ─────────────────────────────────────────────────
etapa_schema() {
  step_header "Importação do Schema do Banco de Dados"

  # ─── Schema principal ────────────────────────────────────────────────────
  local SQL_FILE=""
  if [[ "$DRY_RUN" == false ]]; then
    SQL_FILE=$(find "$INSTALL_DIR" -maxdepth 4 -iname "db_atual.sql" | head -1)
    if [[ -z "$SQL_FILE" ]]; then
      SQL_FILE=$(find "$INSTALL_DIR" -maxdepth 4 -iname "*.sql" | grep -iv migration | head -1)
    fi
  else
    SQL_FILE="$INSTALL_DIR/DataBase/db_atual.sql (SIMULADO)"
  fi

  if [[ -n "$SQL_FILE" ]]; then
    info "Schema: $SQL_FILE"
    exec_or_warn "Importar $SQL_FILE" bash -c \
      "mysql -u '$DB_USER' -p'$DB_PASS' '$DB_NAME' < '$SQL_FILE' 2>/dev/null"
    log "Schema importado"
  else
    warn "Nenhum .sql encontrado — importe manualmente se necessário."
  fi

  # ─── Migrations ──────────────────────────────────────────────────────────
  for migration in \
    "DataBase/migration_tickets.sql" \
    "DataBase/migration_payment_proof.sql"
  do
    if [[ -f "$INSTALL_DIR/$migration" ]] || [[ "$DRY_RUN" == true ]]; then
      info "Migration: $migration"
      exec_or_warn "Aplicar $migration" bash -c \
        "mysql -u '$DB_USER' -p'$DB_PASS' '$DB_NAME' < '$INSTALL_DIR/$migration' 2>/dev/null"
    fi
  done

  # ─── SocialProof DB ──────────────────────────────────────────────────────
  local SP_SQL=""
  if [[ "$DRY_RUN" == false ]]; then
    SP_SQL=$(find "$SOCIALPROOF_DIR" -maxdepth 4 -iname "dbsp_atual.sql" | head -1)
  else
    SP_SQL="$SOCIALPROOF_DIR/DataBase/dbsp_atual.sql (SIMULADO)"
  fi

  if [[ -n "$SP_SQL" ]]; then
    info "SocialProof DB: $SP_SQL"
    exec_or_warn "Importar SocialProof DB" bash -c \
      "mysql -u '$DB_USER' -p'$DB_PASS' socialproof < '$SP_SQL' 2>/dev/null"
    log "Banco SocialProof importado"
  else
    warn "dbsp_atual.sql não encontrado — importe manualmente."
  fi

  step_done "schema"
}

# ─── ETAPA 8: Permissões ──────────────────────────────────────────────────────
etapa_permissoes() {
  step_header "Ajuste de Permissões"

  exec_cmd "chown root:www-data $INSTALL_DIR"   chown -R root:www-data "$INSTALL_DIR"
  exec_cmd "chmod 750 $INSTALL_DIR"             chmod -R 750 "$INSTALL_DIR"
  exec_cmd "chmod 600 .env"                     chmod 600 "$INSTALL_DIR/.env"
  exec_cmd "chmod 775 public/"                  chmod -R 775 "$INSTALL_DIR/public"
  exec_cmd "chmod 775 socialmembers/"           chmod -R 775 "$INSTALL_DIR/socialmembers"
  exec_cmd "chown www-data public/"             chown -R www-data:www-data "$INSTALL_DIR/public"
  exec_cmd "chown www-data socialmembers/"      chown -R www-data:www-data "$INSTALL_DIR/socialmembers"
  exec_cmd "chown www-data /var/log/dieta-milenar" chown -R www-data:www-data /var/log/dieta-milenar

  log "Permissões aplicadas"
  step_done "permissoes"
}

# ─── ETAPA 9: PM2 ─────────────────────────────────────────────────────────────
etapa_pm2() {
  step_header "Configuração do PM2"

  local ECOSYSTEM_CONTENT='module.exports = {
  apps: [{
    name: '"'"'dieta-milenar'"'"',
    script: '"'"'server.ts'"'"',
    interpreter: '"'"'node'"'"',
    interpreter_args: '"'"'--import tsx/esm'"'"',
    cwd: '"'"''"${INSTALL_DIR}"''"'"',
    exec_mode: '"'"'fork'"'"',
    instances: 1,
    env: { NODE_ENV: '"'"'production'"'"' },
    autorestart: true,
    watch: false,
    max_memory_restart: '"'"'512M'"'"',
    error_file: '"'"'/var/log/dieta-milenar/error.log'"'"',
    out_file:   '"'"'/var/log/dieta-milenar/out.log'"'"',
    log_date_format: '"'"'YYYY-MM-DD HH:mm:ss'"'"',
  }]
};'

  write_file_from_var \
    "$INSTALL_DIR/ecosystem.config.cjs" \
    "Escrevendo ecosystem.config.cjs" \
    "$ECOSYSTEM_CONTENT"

  exec_or_warn "PM2 stop anterior"   pm2 stop   dieta-milenar
  exec_or_warn "PM2 delete anterior" pm2 delete dieta-milenar

  exec_cmd "PM2 start" pm2 start "$INSTALL_DIR/ecosystem.config.cjs" --env production
  exec_cmd "PM2 save"  pm2 save
  exec_or_warn "PM2 startup systemd" bash -c \
    "pm2 startup systemd -u root --hp /root > /dev/null 2>&1"

  log "Aplicação iniciada via PM2"
  step_done "pm2"
}

# ─── ETAPA 10: Nginx ──────────────────────────────────────────────────────────
etapa_nginx() {
  step_header "Configuração do Nginx"

  exec_or_warn "Remover site default" rm -f /etc/nginx/sites-enabled/default

  local NGINX_CONF="server {
    listen 80;
    server_name ${DOMAIN};
    client_max_body_size 110M;
    access_log /var/log/nginx/dieta-milenar.access.log;
    error_log  /var/log/nginx/dieta-milenar.error.log;

    location /phpmyadmin {
        root /var/www;
        index index.php index.html;
        location ~ ^/phpmyadmin/(.+\\.php)$ {
            try_files \$uri =404;
            root /var/www;
            fastcgi_pass unix:${PHP_FPM_SOCK};
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            include fastcgi_params;
        }
        location ~* ^/phpmyadmin/(.+\\.(jpg|jpeg|gif|css|png|js|ico|html|xml|txt))\$ {
            root /var/www;
        }
    }

    location ^~ /socialproof {
        root /var/www;
        index index.php index.html;
        try_files \$uri \$uri/ /socialproof/index.php\$is_args\$args;
        location ~ ^/socialproof/.+\\.php\$ {
            root /var/www;
            try_files \$uri =404;
            fastcgi_pass unix:${PHP_FPM_SOCK};
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            include fastcgi_params;
        }
    }

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

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)\$ {
        proxy_pass http://127.0.0.1:${APP_PORT};
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
}"

  write_file_from_var \
    "/etc/nginx/sites-available/dieta-milenar" \
    "Escrevendo vhost Nginx" \
    "$NGINX_CONF"

  exec_cmd "Ativar site Nginx" ln -sf \
    /etc/nginx/sites-available/dieta-milenar \
    /etc/nginx/sites-enabled/

  if [[ "$DRY_RUN" == true ]]; then
    drylog "nginx -t (teste de sintaxe)"
    drylog "systemctl enable + reload nginx"
  else
    nginx -t && systemctl enable nginx && \
      (systemctl is-active --quiet nginx && systemctl reload nginx || systemctl start nginx)
  fi

  log "Nginx configurado (porta 80)"
  step_done "nginx"
}

# ─── ETAPA 11: SSL ────────────────────────────────────────────────────────────
etapa_ssl() {
  step_header "SSL / HTTPS"

  if [[ "$USE_SSL" == true ]]; then
    if ! command -v certbot &>/dev/null; then
      exec_cmd "Instalar Certbot" apt-get install -y -qq certbot python3-certbot-nginx
    fi

    read -rp "  Instalar certificado SSL gratuito para ${DOMAIN}? [s/N]: " DO_SSL
    if [[ "$DO_SSL" == "s" || "$DO_SSL" == "S" ]]; then
      exec_cmd "Certbot --nginx" certbot --nginx -d "$DOMAIN" \
        --non-interactive --agree-tos --email "admin@$DOMAIN"
      log "SSL instalado para $DOMAIN"
    else
      log "SSL ignorado. Configure depois: ${CYAN}certbot --nginx -d $DOMAIN${NC}"
    fi
  else
    warn "SSL não disponível para IP direto."
    info "Configure um domínio e execute: certbot --nginx -d SEU_DOMINIO"
  fi

  step_done "ssl"
}

# ──────────────────────────────────────────────────────────────────────────────
#  MÓDULO 5 — SUMÁRIO FINAL
# ──────────────────────────────────────────────────────────────────────────────

print_final_summary() {
  local total_elapsed=$(( $(date +%s) - INSTALL_START_TIME ))
  local total_min=$(( total_elapsed / 60 ))
  local total_sec=$(( total_elapsed % 60 ))

  echo ""
  echo -e "  ${DIM}┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄${NC}"
  echo ""

  if [[ "$DRY_RUN" == true ]]; then
    echo -e "  ${MAGENTA}${BOLD}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "  ${MAGENTA}${BOLD}║        DRY-RUN CONCLUÍDO — SISTEMA NÃO FOI MODIFICADO           ║${NC}"
    echo -e "  ${MAGENTA}${BOLD}╚══════════════════════════════════════════════════════════════════╝${NC}"
  else
    echo -e "  ${GREEN}${BOLD}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "  ${GREEN}${BOLD}║         SaaS DIETA MILENAR — INSTALADO E OPERACIONAL            ║${NC}"
    echo -e "  ${GREEN}${BOLD}╚══════════════════════════════════════════════════════════════════╝${NC}"
  fi

  echo ""
  echo -e "  ${BOLD}${WHITE}Tempo total de instalação:${NC}  ${CYAN}${total_min}m ${total_sec}s${NC}"
  echo ""

  # ─── Tabela de etapas ───────────────────────────────────────────────────
  echo -e "  ${DIM}  ETAPA                      STATUS     TEMPO${NC}"
  echo -e "  ${DIM}  ───────────────────────────────────────────${NC}"

  declare -A STEP_LABELS=(
    [dependencias]="01  Dependências do sistema"
    [mysql]="02  MySQL"
    [phpmyadmin]="03  phpMyAdmin"
    [arquivos]="04  Arquivos do projeto"
    [env]="05  Arquivo .env"
    [build]="06  NPM + Build Vite"
    [schema]="07  Schema do banco"
    [permissoes]="08  Permissões"
    [pm2]="09  PM2"
    [nginx]="10  Nginx"
    [ssl]="11  SSL"
  )

  for key in dependencias mysql phpmyadmin arquivos env build schema permissoes pm2 nginx ssl; do
    local status="${STEP_STATUS[$key]:-OK}"
    local elapsed="${STEP_TIMES[$key]:-0}"
    local status_icon
    case "$status" in
      OK)   status_icon="${GREEN}✔  OK   ${NC}" ;;
      SKIP) status_icon="${YELLOW}⊘  SKIP ${NC}" ;;
      *)    status_icon="${RED}✘  FAIL ${NC}" ;;
    esac
    printf "  ${DIM}  %-28s${NC} %b  ${DIM}%3ss${NC}\n" \
      "${STEP_LABELS[$key]}" "$status_icon" "$elapsed"
  done

  echo ""
  echo -e "  ${BOLD}${YELLOW}── ACESSO ──────────────────────────────────────────────────────────${NC}"
  echo -e "  ${BOLD}Aplicação:${NC}     ${CYAN}http://${DOMAIN}${NC}"
  echo -e "  ${BOLD}phpMyAdmin:${NC}    ${CYAN}http://${DOMAIN}/phpmyadmin${NC}"
  echo -e "  ${BOLD}SocialProof:${NC}   ${CYAN}http://${DOMAIN}/socialproof${NC}"
  echo ""
  echo -e "  ${BOLD}${YELLOW}── LOGIN PADRÃO ────────────────────────────────────────────────────${NC}"
  echo -e "  ${BOLD}Admin:${NC}   admin@dietasmilenares.com  /  admin123"
  echo -e "  ${BOLD}PMA:${NC}     ${DB_USER}  /  (senha configurada)"
  echo ""
  echo -e "  ${RED}${BOLD}  ⚠  Troque a senha do admin imediatamente após o primeiro acesso!${NC}"
  echo ""
  echo -e "  ${BOLD}${YELLOW}── COMANDOS ÚTEIS ──────────────────────────────────────────────────${NC}"
  echo -e "  ${CYAN}pm2 status${NC}                 → Status da aplicação"
  echo -e "  ${CYAN}pm2 logs dieta-milenar${NC}      → Logs em tempo real"
  echo -e "  ${CYAN}pm2 restart dieta-milenar${NC}   → Reiniciar app"
  echo -e "  ${CYAN}systemctl status nginx${NC}      → Status do Nginx"
  echo -e "  ${CYAN}systemctl status mysql${NC}      → Status do MySQL"
  echo ""
  echo -e "  ${DIM}Log de instalação: /var/log/dieta-milenar/install.log${NC}"
  echo ""
}

# ──────────────────────────────────────────────────────────────────────────────
#  MÓDULO 6 — CLEANUP
# ──────────────────────────────────────────────────────────────────────────────

cleanup() {
  if [[ "$DRY_RUN" == false ]]; then
    rm -rf "$REPO_DIR"
    log "Pasta de instalação removida: $REPO_DIR"
  else
    drylog "rm -rf $REPO_DIR (simulado — pasta preservada)"
  fi
}

# ──────────────────────────────────────────────────────────────────────────────
#  PONTO DE ENTRADA — ORQUESTRADOR PRINCIPAL
# ──────────────────────────────────────────────────────────────────────────────

main() {
  print_banner
  validate_environment

  # ─── Fase interativa (config) ───────────────────────────────────────────
  step_header "Configuração do Sistema"
  collect_config
  step_done "config_interativa" "OK"
  print_config_summary

  # ─── Fase de instalação ─────────────────────────────────────────────────
  etapa_dependencias
  etapa_mysql
  etapa_phpmyadmin
  etapa_arquivos
  etapa_env
  etapa_build
  etapa_schema
  etapa_permissoes
  etapa_pm2
  etapa_nginx
  etapa_ssl

  # ─── Encerramento ───────────────────────────────────────────────────────
  cleanup
  print_final_summary
}

# ─── Trap para erros inesperados ─────────────────────────────────────────────
trap 'echo -e "\n\n  ${RED}✘  Instalação interrompida na linha ${LINENO}.${NC}\n  Verifique o log: /var/log/dieta-milenar/install.log\n"' ERR

# ─── Redireciona logs para arquivo (apenas em modo real) ─────────────────────
if [[ "$DRY_RUN" == false ]]; then
  mkdir -p /var/log/dieta-milenar
  exec > >(tee -a /var/log/dieta-milenar/install.log) 2>&1
fi

main "$@"
