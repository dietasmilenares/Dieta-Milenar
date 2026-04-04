#!/bin/bash
# =============================================================================
#  SaaS DIETA MILENAR — MENU DE DESINSTALAÇÃO RR v3.0
#  GERENCIE OU REMOVA COMPLETAMENTE OS COMPONENTES DO SISTEMA.
# =============================================================================

set -uo pipefail
IFS=$'\n\t'

# --- Cores e Layout ---
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log_status() { echo -e "  ${GREEN}[✔]${NC} $1"; }
log_warn()   { echo -e "  ${YELLOW}[⚠]${NC} $1"; }
log_error()  { echo -e "  ${RED}[✘]${NC} $1"; }

# --- Variáveis de Configuração ---
INSTALL_DIR="/var/www/dieta-milenar"
SOCIALPROOF_DIR="/var/www/socialproof"
APP_USER="dieta"
APP_GROUP="dieta"
DB_NAME="dieta_milenar"
DB_USER="dieta_user"
PHP_VER=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null || true)
PMA_DIR="/var/www/phpmyadmin"

# --- Verificações Iniciais ---
[[ ${EUID:-999} -eq 0 ]] || { echo -e "${RED}Execute como root: sudo ./nome_do_script.sh${NC}"; exit 1; }

# --- Funções de Desinstalação ---

parar_servicos() {
    echo -e "\n${CYAN}--- PARANDO SERVIÇOS ---${NC}"
    
    if id -u "$APP_USER" >/dev/null 2>&1; then
        log_status "Parando PM2..."
        sudo -u "$APP_USER" -g "$APP_GROUP" pm2 stop dieta-milenar >/dev/null 2>&1 || true
        sudo -u "$APP_USER" -g "$APP_GROUP" pm2 delete dieta-milenar >/dev/null 2>&1 || true
        sudo -u "$APP_USER" -g "$APP_GROUP" pm2 save --force >/dev/null 2>&1 || true
    fi

    log_status "Limpando Nginx..."
    rm -f /etc/nginx/sites-enabled/dieta-milenar /etc/nginx/sites-available/dieta-milenar >/dev/null 2>&1 || true
    systemctl reload nginx >/dev/null 2>&1 || true
    
    log_status "Parando MySQL e PHP..."
    systemctl stop mysql >/dev/null 2>&1 || true
    [[ -n "$PHP_VER" ]] && systemctl stop "php${PHP_VER}-fpm" >/dev/null 2>&1 || true
}

remover_arquivos_e_dbs() {
    echo -e "\n${CYAN}--- REMOVENDO ARQUIVOS E BANCOS ---${NC}"
    
    # Bancos de Dados
    if command -v mysql >/dev/null 2>&1; then
        mysql -u root -e "DROP DATABASE IF EXISTS \`${DB_NAME}\`; DROP DATABASE IF EXISTS \`socialproof\`; DROP USER IF EXISTS '${DB_USER}'@'localhost';" >/dev/null 2>&1 || log_warn "Falha ao remover DBs via MySQL."
    fi

    # Pastas
    log_status "Removendo $INSTALL_DIR e $SOCIALPROOF_DIR"
    rm -rf "$INSTALL_DIR" "$SOCIALPROOF_DIR" "$PMA_DIR" /var/log/dieta-milenar >/dev/null 2>&1 || true

    # Usuário de Sistema
    if id -u "$APP_USER" >/dev/null 2>&1; then
        log_status "Removendo usuário $APP_USER"
        userdel -r "$APP_USER" >/dev/null 2>&1 || true
    fi
}

purge_mysql_total() {
    echo -e "\n${RED}${BOLD}--- PURGE TOTAL DO MYSQL (DESTRUTIVO) ---${NC}"
    systemctl stop mysql >/dev/null 2>&1 || true
    MYSQL_PKGS=$(dpkg -l 'mysql-*' 2>/dev/null | awk '/^ii/{print $2}' | grep -v '^libmysqlclient' || true)
    if [[ -n "$MYSQL_PKGS" ]]; then
        apt-get remove --purge -y $MYSQL_PKGS >/dev/null 2>&1 || true
    fi
    rm -rf /etc/mysql /var/lib/mysql /var/log/mysql >/dev/null 2>&1 || true
    apt-get autoremove -y >/dev/null 2>&1 || true
    log_status "MySQL removido do sistema."
}

remover_pacotes() {
    echo -e "\n${CYAN}--- REMOVENDO PACOTES (PHP, NODE, CERTBOT) ---${NC}"
    apt-get remove -y --purge nodejs php-mysql php-mbstring php-zip php-gd php-curl python3-certbot-nginx certbot >/dev/null 2>&1 || true
    apt-get autoremove -y >/dev/null 2>&1 || true
    log_status "Pacotes removidos."
}

limpeza_final() {
    echo -e "\n${CYAN}--- LIMPANDO LOGS E INSTALADORES ---${NC}"
    rm -rf /root/.pm2 /home/ubuntu/install.sh /home/ubuntu/Dieta-Milenar >/dev/null 2>&1 || true
    log_status "Limpeza de arquivos residuais concluída."
}

# --- Menu Principal ---
exibir_menu() {
    clear
    echo -e "${RED}${BOLD}====================================================="
    echo -e "      DESINSTALADOR DIETA MILENAR - MENU RR"
    echo -e "=====================================================${NC}"
    echo -e "1) ${YELLOW}Parar Serviços${NC} (PM2, Nginx, MySQL, PHP)"
    echo -e "2) ${YELLOW}Remover Arquivos e Bancos${NC} (App, DBs, Usuários)"
    echo -e "3) ${YELLOW}Remover Pacotes${NC} (NodeJS, PHP, Certbot)"
    echo -e "4) ${RED}Purge TOTAL MySQL${NC} (Remove o motor MySQL e todos os dados)"
    echo -e "5) ${RED}${BOLD}DESINSTALAÇÃO COMPLETA (TUDO)${NC}"
    echo -e "0) Sair"
    echo -e "====================================================="
    echo -n "Escolha uma opção: "
}

while true; do
    exibir_menu
    read -r OPCAO
    case $OPCAO in
        1)
            parar_servicos
            echo -e "\n${GREEN}Serviços interrompidos.${NC}"
            read -p "Pressione Enter para voltar..."
            ;;
        2)
            echo -e "${RED}Isso apagará todos os dados da aplicação.${NC}"
            read -p "Tem certeza? (s/n): " CONF
            if [[ $CONF == "s" ]]; then
                remover_arquivos_e_dbs
                log_status "Dados removidos."
            fi
            read -p "Pressione Enter para voltar..."
            ;;
        3)
            remover_pacotes
            read -p "Pressione Enter para voltar..."
            ;;
        4)
            echo -e "${RED}${BOLD}ALERTA: Isso desinstala o MySQL do servidor!${NC}"
            read -p "Confirmar Purge Total? (DIGITE 'SIM'): " CONF
            if [[ $CONF == "SIM" ]]; then
                purge_mysql_total
            fi
            read -p "Pressione Enter para voltar..."
            ;;
        5)
            echo -e "${RED}${BOLD}PERIGO: Esta opção reverte tudo e limpa a máquina!${NC}"
            read -p "Confirmar Desinstalação TOTAL? (DIGITE 'LIMPEZA-TOTAL'): " CONF
            if [[ $CONF == "LIMPEZA-TOTAL" ]]; then
                parar_servicos
                remover_arquivos_e_dbs
                purge_mysql_total
                remover_pacotes
                limpeza_final
                echo -e "\n${GREEN}${BOLD}SISTEMA LIMPO COM SUCESSO!${NC}"
                exit 0
            fi
            ;;
        0)
            echo "Saindo..."
            exit 0
            ;;
        *)
            echo -e "${RED}Opção inválida!${NC}"
            sleep 1
            ;;
    esac
done