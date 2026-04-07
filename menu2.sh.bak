#!/bin/bash
# =============================================================================
#  DIETA MILENAR — PAINEL DE GERENCIAMENTO
#  Uso: bash menu.sh
# =============================================================================

[[ ${EUID:-999} -eq 0 ]] || { echo "Execute como root: sudo bash menu.sh"; exit 1; }

# --- CORES ---
GOLD='\033[38;5;220m'; BGDARK='\033[48;5;232m'; BOLD='\033[1m'; NC='\033[0m'
CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'

TERM_WIDTH=$(tput cols 2>/dev/null || echo 80)
[[ $TERM_WIDTH -lt 20 ]] && TERM_WIDTH=40

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

# --- VARIÁVEIS ---
APP_USER="dieta"
APP_PORT=3000
LOG_FILE="/var/log/dieta-milenar-install.log"
INSTALL_DIR="/var/www/dieta-milenar"
ENV_FILE="$INSTALL_DIR/.env"
ENV_PROD="$INSTALL_DIR/.env.production"
ENV_DEV="$INSTALL_DIR/.env.development"

# Lê credenciais do .env
if [[ -f "$ENV_FILE" ]]; then
  DB_NAME=$(grep -E '^DB_NAME=' "$ENV_FILE" | cut -d= -f2)
  DB_USER=$(grep -E '^DB_USER=' "$ENV_FILE" | cut -d= -f2)
  DB_PASS=$(grep -E '^DB_PASS=' "$ENV_FILE" | cut -d= -f2)
else
  DB_NAME="dieta_milenar"
  DB_USER="dieta_user"
  DB_PASS=""
  echo -e "  ${YELLOW}[⚠]${NC} .env não encontrado em $ENV_FILE — credenciais MySQL podem falhar."
fi

PM2_BIN=$(command -v pm2 || find /usr/lib/node_modules/pm2/bin /usr/local/lib/node_modules/pm2/bin -name pm2 2>/dev/null | head -1 || echo "pm2")

# =============================================================================
# --- HELPER: detecta modo atual ---
get_current_mode() {
  if [[ -f "$ENV_FILE" ]]; then
    local mode
    mode=$(grep -E '^NODE_ENV=' "$ENV_FILE" | cut -d= -f2 | tr -d '[:space:]')
    echo "${mode:-production}" # Default para production se não encontrar
  else
    echo "production" # Default para production se .env não existir
  fi
}

# =============================================================================

menu_mode() {
  local current_mode
  current_mode=$(get_current_mode)

  clear
  draw_line "━" "$CYAN"
  if [[ "$current_mode" == "production" ]]; then
    center_print "ATIVANDO MODO DEVELOPMENT" "$YELLOW"
  else
    center_print "ATIVANDO MODO PRODUCTION" "$CYAN"
  fi
  draw_line "━" "$CYAN"
  echo ""

  # --- Validação inicial: .env deve existir para operar ---
  [[ -f "$ENV_FILE" ]] || { echo -e "  ${RED}[✘]${NC} Erro: Arquivo .env não encontrado em $INSTALL_DIR. Não é possível alternar modos."; read -rp $'\n  ENTER para continuar...' _; return; }

  if [[ "$current_mode" == "production" ]]; then
    # ─────────────────────────────────────────────
    # PROD → DEV
    # ─────────────────────────────────────────────

    # 1. Salva .env atual como .env.production (sempre atualiza o snapshot de prod)
    cp "$ENV_FILE" "$ENV_PROD"
    chown "$APP_USER":"$APP_USER" "$ENV_PROD"
    chmod 0640 "$ENV_PROD"
    echo -e "  ${GREEN}[✔]${NC} Backup salvo em: ${CYAN}.env.production${NC}"

    # 2. Restaura ou cria .env.development
    if [[ -f "$ENV_DEV" ]]; then
      cp "$ENV_DEV" "$ENV_FILE"
      echo -e "  ${GREEN}[✔]${NC} .env.development restaurado."
    else
      # Cria .env.development a partir do snapshot de prod, garantindo NODE_ENV=development
      if grep -q '^NODE_ENV=' "$ENV_PROD"; then
        sed 's/^NODE_ENV=.*/NODE_ENV=development/' "$ENV_PROD" > "$ENV_FILE"
      else
        echo -e "$(cat "$ENV_PROD")\nNODE_ENV=development" > "$ENV_FILE"
      fi
      echo -e "  ${YELLOW}[⚠]${NC} .env.development criado a partir do .env de produção."
    fi
    chown "$APP_USER":"$APP_USER" "$ENV_FILE"
    chmod 0640 "$ENV_FILE"

    # 3. Para e remove o processo de produção no PM2 (garante limpeza)
    echo -e "  ${YELLOW}[…]${NC} Parando e removendo PM2 (prod)..."
    runuser -l "$APP_USER" -c "$PM2_BIN delete dieta-milenar >/dev/null 2>&1 || true"

    # 4. Reinstala node_modules completo (devDependencies incluídas)
    #    O rm -rf node_modules é necessário porque o modo prod roda npm prune --omit=dev,
    #    deixando o node_modules incompleto para o ambiente de dev.
    echo -e "  ${YELLOW}[…]${NC} Reinstalando dependências (incluindo devDependencies)..."
    runuser -l "$APP_USER" -c "cd $INSTALL_DIR && rm -rf node_modules"
    if [[ -f "$INSTALL_DIR/package-lock.json" ]]; then
      runuser -l "$APP_USER" -c "cd $INSTALL_DIR && npm ci --silent --cache /var/lib/$APP_USER/.npm" \
        && echo -e "  ${GREEN}[✔]${NC} Dependências DEV instaladas (npm ci)." \
        || { echo -e "  ${RED}[✘]${NC} Falha no npm ci."; read -rp $'\n  ENTER para continuar...' _; return; }
    else
      runuser -l "$APP_USER" -c "cd $INSTALL_DIR && npm install --silent --cache /var/lib/$APP_USER/.npm" \
        && echo -e "  ${GREEN}[✔]${NC} Dependências DEV instaladas (npm install)." \
        || { echo -e "  ${RED}[✘]${NC} Falha no npm install."; read -rp $'\n  ENTER para continuar...' _; return; }
    fi
    # Garante que as permissões dos novos arquivos estão corretas
    chown -R "$APP_USER":"$APP_USER" "$INSTALL_DIR"

    # 5. Inicia com npm run dev via PM2 (explicitamente com NODE_ENV=development)
    echo -e "  ${YELLOW}[…]${NC} Iniciando PM2 em modo DEV..."
    runuser -l "$APP_USER" -c \
      "NODE_ENV=development $PM2_BIN start npm \
        --name dieta-milenar \
        --cwd $INSTALL_DIR \
        -- run dev \
        --error /var/log/dieta-milenar/error-dev.log \
        --output /var/log/dieta-milenar/out-dev.log" \
      && echo -e "  ${GREEN}[✔]${NC} Rodando em modo DEV." \
      || { echo -e "  ${RED}[✘]${NC} Falha ao iniciar DEV."; read -rp $'\n  ENTER para continuar...' _; return; }

    runuser -l "$APP_USER" -c "$PM2_BIN save --silent"

    echo ""
    echo -e "  ${YELLOW}${BOLD}INFO:${NC} Frontend dev geralmente na porta ${CYAN}5173${NC} (Vite)"
    echo -e "  Backend na porta ${CYAN}${APP_PORT}${NC}. Verifique seu package.json se necessário."

  else
    # ─────────────────────────────────────────────
    # DEV → PROD
    # ─────────────────────────────────────────────

    # 1. Salva .env atual como .env.development (sempre atualiza o snapshot de dev)
    cp "$ENV_FILE" "$ENV_DEV"
    chown "$APP_USER":"$APP_USER" "$ENV_DEV"
    chmod 0640 "$ENV_DEV"
    echo -e "  ${GREEN}[✔]${NC} Backup salvo em: ${CYAN}.env.development${NC}"

    # 2. Restaura ou força .env.production
    #    Lê sempre do snapshot de dev para garantir que o NODE_ENV=production seja aplicado
    if [[ -f "$ENV_PROD" ]]; then
      cp "$ENV_PROD" "$ENV_FILE"
      echo -e "  ${GREEN}[✔]${NC} .env.production restaurado."
    else
      # Cria .env.production a partir do snapshot de dev, garantindo NODE_ENV=production
      if grep -q '^NODE_ENV=' "$ENV_DEV"; then
        sed 's/^NODE_ENV=.*/NODE_ENV=production/' "$ENV_DEV" > "$ENV_FILE"
      else
        echo -e "$(cat "$ENV_DEV")\nNODE_ENV=production" > "$ENV_FILE"
      fi
      echo -e "  ${YELLOW}[⚠]${NC} NODE_ENV=production aplicado manualmente."
    fi
    chown "$APP_USER":"$APP_USER" "$ENV_FILE"
    chmod 0640 "$ENV_FILE"

    # 3. Para e remove o processo de dev no PM2 (garante limpeza)
    echo -e "  ${YELLOW}[…]${NC} Parando e removendo PM2 (dev)..."
    runuser -l "$APP_USER" -c "$PM2_BIN delete dieta-milenar >/dev/null 2>&1 || true"

    # 4. Build limpo de produção
    echo -e "  ${YELLOW}[…]${NC} Executando build limpo de produção..."
    runuser -l "$APP_USER" -c "cd $INSTALL_DIR && rm -rf node_modules dist"

    if [[ -f "$INSTALL_DIR/package-lock.json" ]]; then
      runuser -l "$APP_USER" -c "cd $INSTALL_DIR && npm ci --silent --cache /var/lib/$APP_USER/.npm" \
        || { echo -e "  ${RED}[✘]${NC} npm ci falhou."; read -rp $'\n  ENTER para continuar...' _; return; }
    else
      runuser -l "$APP_USER" -c "cd $INSTALL_DIR && npm install --silent --cache /var/lib/$APP_USER/.npm" \
        || { echo -e "  ${RED}[✘]${NC} npm install falhou."; read -rp $'\n  ENTER para continuar...' _; return; }
    fi

    runuser -l "$APP_USER" -c "cd $INSTALL_DIR && npm run build --silent" \
      || { echo -e "  ${RED}[✘]${NC} Build falhou. Abortando."; read -rp $'\n  ENTER para continuar...' _; return; }

    # 5. Validação do output do build
    [[ -d "$INSTALL_DIR/dist" ]] || { echo -e "  ${RED}[✘]${NC} Erro: Pasta 'dist' não foi gerada pelo build."; read -rp $'\n  ENTER para continuar...' _; return; }
    echo -e "  ${GREEN}[✔]${NC} Build de produção concluído."

    # 6. Compila server.ts se necessário
    if [[ -f "$INSTALL_DIR/server.ts" && ! -f "$INSTALL_DIR/dist/server.js" ]]; then
      echo -e "  ${YELLOW}[…]${NC} Compilando server.ts..."
      runuser -l "$APP_USER" -c \
        "cd $INSTALL_DIR && npx esbuild server.ts --bundle --platform=node --format=esm --packages=external --outfile=dist/server.js >/dev/null 2>&1" || true
    fi

    # 7. Remove devDependencies
    runuser -l "$APP_USER" -c \
      "cd $INSTALL_DIR && npm prune --omit=dev --silent" || true

    # 8. Garante permissões corretas após build e prune
    chown -R "$APP_USER":"$APP_USER" "$INSTALL_DIR"

    # 9. Inicia produção no PM2
    echo -e "  ${YELLOW}[…]${NC} Iniciando PM2 em modo PROD..."
    if [[ -f "$INSTALL_DIR/ecosystem.config.cjs" ]]; then
      runuser -l "$APP_USER" -c \
        "$PM2_BIN start $INSTALL_DIR/ecosystem.config.cjs --env production" \
        && echo -e "  ${GREEN}[✔]${NC} PM2 em produção (ecosystem)." \
        || { echo -e "  ${RED}[✘]${NC} Falha ao iniciar PM2."; read -rp $'\n  ENTER para continuar...' _; return; }
    else
      # Passa NODE_ENV via prefixo de ambiente para o PM2
      runuser -l "$APP_USER" -c \
        "NODE_ENV=production $PM2_BIN start $INSTALL_DIR/dist/server.js \
          --name dieta-milenar \
          --cwd $INSTALL_DIR \
          --error /var/log/dieta-milenar/error.log \
          --output /var/log/dieta-milenar/out.log" \
        && echo -e "  ${GREEN}[✔]${NC} PM2 em produção." \
        || { echo -e "  ${RED}[✘]${NC} Falha ao iniciar PM2."; read -rp $'\n  ENTER para continuar...' _; return; }
    fi

    runuser -l "$APP_USER" -c "$PM2_BIN save --silent"
  fi

  echo ""
  draw_line "─" "$CYAN"
  echo -e "  Modo atual: ${BOLD}$(get_current_mode | tr '[:lower:]' '[:upper:]')${NC}"
  draw_line "─" "$CYAN"
  read -rp $'\n  ENTER para continuar...' _
}

# =============================================================================

menu_fix() {
  while true; do
    clear
    echo -e "\n${BOLD}${CYAN}  ── FIX ────────────────────────────────────────────${NC}\n"
    echo -e "  ${BOLD}1${NC}  Permissões"
    echo -e "  ${BOLD}0${NC}  Voltar"
    echo ""
    read -rp "  Opção: " OPT
    case "$OPT" in
      1)
        echo ""
        echo -e "  ${YELLOW}[…]${NC} Aplicando permissões..."
        chmod -R 775 /var/www
        usermod -aG www-data ubuntu
        usermod -aG dieta ubuntu
        chmod -R 775 /var/www/dieta-milenar
        echo -e "  ${GREEN}[✔]${NC} Permissões aplicadas com sucesso."
        read -rp $'\n  ENTER para continuar...' _
        ;;
      0) break ;;
    esac
  done
}

menu_servicos() {
  while true; do
    clear
    echo -e "\n${BOLD}${CYAN}  ── SERVIÇOS ──────────────────────────────────────${NC}\n"
    echo -e "  ${BOLD}1${NC}  Status geral"
    echo -e "  ${BOLD}2${NC}  Reiniciar tudo"
    echo -e "  ${BOLD}3${NC}  Reiniciar Nginx"
    echo -e "  ${BOLD}4${NC}  Reiniciar PM2 (Dietas Milenares)"
    echo -e "  ${BOLD}5${NC}  Reiniciar MariaDB"
    echo -e "  ${BOLD}0${NC}  Voltar"
    echo ""
    read -rp "  Opção: " OPT
    case "$OPT" in
      1)
        echo ""
        echo -e "  ${BOLD}Nginx:${NC}";   systemctl is-active nginx   && echo -e "  ${GREEN}[✔] online${NC}" || echo -e "  ${RED}[✘] offline${NC}"
        echo -e "  ${BOLD}MariaDB:${NC}"; systemctl is-active mariadb && echo -e "  ${GREEN}[✔] online${NC}" || echo -e "  ${RED}[✘] offline${NC}"
        echo -e "  ${BOLD}PHP-FPM:${NC}"; systemctl is-active php-fpm 2>/dev/null && echo -e "  ${GREEN}[✔] online${NC}" || echo -e "  ${RED}[✘] offline${NC}"
        echo -e "  ${BOLD}PM2:${NC}";     runuser -l "$APP_USER" -c "$PM2_BIN list" 2>/dev/null || echo -e "  ${RED}[✘] PM2 indisponível${NC}"
        read -rp $'\n  ENTER para continuar...' _
        ;;
      2)
        systemctl restart nginx mariadb
        runuser -l "$APP_USER" -c "$PM2_BIN restart dieta-milenar" 2>/dev/null || true
        echo -e "  ${GREEN}[✔]${NC} Tudo reiniciado."
        read -rp $'\n  ENTER para continuar...' _
        ;;
      3) systemctl restart nginx   && echo -e "  ${GREEN}[✔]${NC} Nginx reiniciado."   ; read -rp $'\n  ENTER...' _ ;;
      4) runuser -l "$APP_USER" -c "$PM2_BIN restart dieta-milenar" && echo -e "  ${GREEN}[✔]${NC} PM2 reiniciado." ; read -rp $'\n  ENTER...' _ ;;
      5) systemctl restart mariadb && echo -e "  ${GREEN}[✔]${NC} MariaDB reiniciado." ; read -rp $'\n  ENTER...' _ ;;
      0) break ;;
    esac
  done
}

menu_logs() {
  while true; do
    clear
    echo -e "\n${BOLD}${CYAN}  ── LOGS ───────────────────────────────────────────${NC}\n"
    echo -e "  ${BOLD}1${NC}  Logs Dietas Milenares (PM2)"
    echo -e "  ${BOLD}2${NC}  Logs SocialProof (Nginx error)"
    echo -e "  ${BOLD}3${NC}  Log da instalação"
    echo -e "  ${BOLD}0${NC}  Voltar"
    echo ""
    read -rp "  Opção: " OPT
    case "$OPT" in
      1) runuser -l "$APP_USER" -c "$PM2_BIN logs dieta-milenar --lines 50 --nostream" 2>/dev/null || echo -e "  ${RED}[✘]${NC} PM2 indisponível" ; read -rp $'\n  ENTER...' _ ;;
      2) tail -n 50 /var/log/nginx/dieta-milenar.error.log 2>/dev/null || echo -e "  ${RED}[✘]${NC} Log não encontrado" ; read -rp $'\n  ENTER...' _ ;;
      3) tail -n 50 "$LOG_FILE" 2>/dev/null || echo -e "  ${RED}[✘]${NC} Log não encontrado" ; read -rp $'\n  ENTER...' _ ;;
      0) break ;;
    esac
  done
}

menu_banco() {
  while true; do
    clear
    echo -e "\n${BOLD}${CYAN}  ── BANCO DE DADOS ─────────────────────────────────${NC}\n"
    echo -e "  ${BOLD}1${NC}  Acessar MySQL"
    echo -e "  ${BOLD}2${NC}  Backup do banco"
    echo -e "  ${BOLD}0${NC}  Voltar"
    echo ""
    read -rp "  Opção: " OPT
    case "$OPT" in
      1) mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" ;;
      2)
        BACKUP_FILE="/root/backup_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql"
        export MYSQL_PWD="$DB_PASS"
        mysqldump -u "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
        unset MYSQL_PWD
        echo -e "  ${GREEN}[✔]${NC} Backup salvo em: ${CYAN}$BACKUP_FILE${NC}"
        read -rp $'\n  ENTER...' _
        ;;
      0) break ;;
    esac
  done
}

menu_diagnostico() {
  while true; do
    clear
    echo -e "\n${BOLD}${CYAN}  ── DIAGNÓSTICO ─────────────────────────────────────${NC}\n"
    echo -e "  ${BOLD}1${NC}  Verificar portas em uso"
    echo -e "  ${BOLD}2${NC}  Testar URLs"
    echo -e "  ${BOLD}3${NC}  Checar versões instaladas"
    echo -e "  ${BOLD}0${NC}  Voltar"
    echo ""
    read -rp "  Opção: " OPT
    case "$OPT" in
      1)
        echo -e "\n  ${BOLD}Portas em uso:${NC}"
        ss -tlnp | grep -E ':(80|443|3000|3306|5173|8080) ' || echo "  Nenhuma porta relevante encontrada"
        read -rp $'\n  ENTER...' _
        ;;
      2)
        echo ""
        for URL in "http://127.0.0.1" "http://127.0.0.1/socialproof/" "http://127.0.0.1:${APP_PORT}"; do
          if curl -fsS --max-time 5 "$URL" -o /dev/null; then
            echo -e "  ${GREEN}[✔]${NC} $URL"
          else
            echo -e "  ${RED}[✘]${NC} $URL"
          fi
        done
        read -rp $'\n  ENTER...' _
        ;;
      3)
        echo ""
        echo -e "  ${BOLD}Node:${NC}  $(node -v 2>/dev/null || echo 'não instalado')"
        echo -e "  ${BOLD}PHP:${NC}   $(php -v 2>/dev/null | head -1 || echo 'não instalado')"
        echo -e "  ${BOLD}Nginx:${NC} $(nginx -v 2>&1 || echo 'não instalado')"
        echo -e "  ${BOLD}MySQL:${NC} $(mysql --version 2>/dev/null || echo 'não instalado')"
        echo -e "  ${BOLD}PM2:${NC}   $(runuser -l "$APP_USER" -c "$PM2_BIN -v" 2>/dev/null || echo 'não instalado')"
        read -rp $'\n  ENTER...' _
        ;;
      0) break ;;
    esac
  done
}

# ── MENU PRINCIPAL ─────────────────────────────────────────────────────────────
while true; do
  # Relê o modo a cada iteração para o label ficar sempre atualizado
  CURRENT_MODE=$(get_current_mode)
  if [[ "$CURRENT_MODE" == "development" ]]; then
    MODE_LABEL="${YELLOW}MODE (DEV)${NC}"
  else
    MODE_LABEL="${CYAN}MODE (PROD)${NC}"
  fi

  clear
  echo -e "${BGDARK}${GOLD}${BOLD}"
  draw_line "═" "$GOLD" "$BGDARK"
  center_print "DIETA MILENAR — PAINEL DE GERENCIAMENTO" "${BGDARK}${GOLD}"
  draw_line "═" "$GOLD" "$BGDARK"
  echo -e "${NC}"
  echo -e "  ${BOLD}0${NC}  Fix"
  echo -e "  ${BOLD}1${NC}  Serviços"
  echo -e "  ${BOLD}2${NC}  Logs"
  echo -e "  ${BOLD}3${NC}  Banco de Dados"
  echo -e "  ${BOLD}4${NC}  Diagnóstico"
  echo -e "  ${BOLD}5${NC}  ${MODE_LABEL}"
  echo -e "  ${BOLD}S${NC}  Sair"
  echo ""
  read -rp "  Opção: " MENU_OPT
  case "$MENU_OPT" in
    0) menu_fix ;;
    1) menu_servicos ;;
    2) menu_logs ;;
    3) menu_banco ;;
    4) menu_diagnostico ;;
    5) menu_mode ;;
    [Ss]) echo -e "\n  Até logo!\n"; break ;;
  esac
done