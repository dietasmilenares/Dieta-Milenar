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
        ss -tlnp | grep -E ':(80|443|3000|3306|8080) ' || echo "  Nenhuma porta relevante encontrada"
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
  clear
  echo -e "${BGDARK}${GOLD}${BOLD}"
  draw_line "═" "$GOLD" "$BGDARK"
  center_print "DIETA MILENAR — PAINEL DE GERENCIAMENTO" "${BGDARK}${GOLD}"
  draw_line "═" "$GOLD" "$BGDARK"
  echo -e "${NC}"
  echo -e "  ${BOLD}1${NC}  Serviços"
  echo -e "  ${BOLD}2${NC}  Logs"
  echo -e "  ${BOLD}3${NC}  Banco de Dados"
  echo -e "  ${BOLD}4${NC}  Diagnóstico"
  echo -e "  ${BOLD}0${NC}  Sair"
  echo ""
  read -rp "  Opção: " MENU_OPT
  case "$MENU_OPT" in
    1) menu_servicos ;;
    2) menu_logs ;;
    3) menu_banco ;;
    4) menu_diagnostico ;;
    0) echo -e "\n  Até logo!\n"; break ;;
  esac
done
