#!/bin/bash
# =============================================================================
#  SaaS DIETA MILENAR — DESINSTALADOR TOTAL RR v5.0 (NUCLEARE)
#  REVERTE TUDO SEGUINDO A ORDEM ORIGINAL COM PURGE TOTAL.
# =============================================================================

set -uo pipefail
IFS=$'\n\t'

# --- Cores e Layout ---
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log_status() { echo -e "  ${GREEN}[✔]${NC} $1"; }
log_warn()   { echo -e "  ${YELLOW}[⚠]${NC} $1"; }
log_error()  { echo -e "  ${RED}[✘]${NC} $1"; }

# --- Variáveis (Espelhando o original) ---
INSTALL_DIR="/var/www/dieta-milenar"
SOCIALPROOF_DIR="/var/www/socialproof"
APP_USER="dieta"
APP_GROUP="dieta"
DB_NAME="dieta_milenar"
DB_USER="dieta_user"
PHP_VER=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null || true)

# --- Verificações ---
[[ ${EUID:-999} -eq 0 ]] || { echo -e "${RED}Execute como root!${NC}"; exit 1; }

# --- ETAPA 1: Parar serviços e remover configs ---
etapa_1() {
    echo -e "\n${CYAN}${BOLD}--- ETAPA 1: PARANDO SERVIÇOS E REMOVENDO CONFIGS ---${NC}"
    
    log_status "Limpando processos PM2..."
    if id -u "$APP_USER" >/dev/null 2>&1; then
        sudo -u "$APP_USER" pm2 kill >/dev/null 2>&1 || true
    fi
    killall -9 pm2 2>/dev/null || true

    log_status "Parando e desabilitando Nginx, MySQL e PHP..."
    systemctl stop nginx mysql "php${PHP_VER:-*}-fpm" >/dev/null 2>&1 || true
    systemctl disable nginx mysql >/dev/null 2>&1 || true
    
    log_status "Removendo vhosts do Nginx..."
    rm -f /etc/nginx/sites-enabled/dieta-milenar /etc/nginx/sites-available/dieta-milenar >/dev/null 2>&1 || true
}

# --- etapa_3() {
    echo -e "\n${RED}${BOLD}--- ETAPA 3: REMOÇÃO COMPLETA DO MYSQL (PURGE TOTAL) ---${NC}"
    
    log_status "Matando processos MySQL remanescentes..."
    killall -9 mysqld mysql 2>/dev/null || true

    log_status "Removendo locks do APT..."
    rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock 2>/dev/null || true
    dpkg --configure -a >/dev/null 2>&1 || true

    log_status "Executando purge sem interação..."
    export DEBIAN_FRONTEND=noninteractive
    
    apt-get purge -y mysql-server mysql-client mysql-common \
    mysql-server-core-* mysql-client-core-* mariadb-server mariadb-client \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" || true

    log_status "Removendo resíduos físicos do MySQL..."
    rm -rf /etc/mysql /var/lib/mysql /var/log/mysql /var/run/mysqld /etc/apparmor.d/usr.sbin.mysqld

    log_status "Limpando dependências..."
    apt-get autoremove -y --purge >/dev/null 2>&1 || true
} 2: Remover dados e usuários ---
etapa_2() {
    echo -e "\n${CYAN}${BOLD}--- ETAPA 2: REMOVENDO DADOS E USUÁRIOS ---${NC}"
    
    log_status "Removendo bancos de dados (se MySQL ativo)..."
    mysql -u root -e "DROP DATABASE IF EXISTS \`${DB_NAME}\`; DROP DATABASE IF EXISTS \`socialproof\`; DROP USER IF EXISTS '${DB_USER}'@'localhost';" >/dev/null 2>&1 || true
    
    log_status "Removendo diretórios da aplicação..."
    rm -rf "$INSTALL_DIR" "$SOCIALPROOF_DIR" /var/www/phpmyadmin /var/log/dieta-milenar >/dev/null 2>&1 || true

    log_status "Removendo usuário de sistema '$APP_USER'..."
    if id -u "$APP_USER" >/dev/null 2>&1; then
        userdel -r "$APP_USER" >/dev/null 2>&1 || true
    fi
}

# --- ETAPA 3: Remoção completa do MySQL (PURGE TOTAL) ---
etapa_3() {
    echo -e "\n${RED}${BOLD}--- ETAPA 3: REMOÇÃO COMPLETA DO MYSQL (PURGE TOTAL) ---${NC}"
    
    log_status "Matando processos MySQL remanescentes..."
    killall -9 mysqld mysql 2>/dev/null || true

    log_status "Removendo locks do APT..."
    rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock 2>/dev/null || true
    dpkg --configure -a >/dev/null 2>&1 || true

    log_status "Executando purge sem interação..."
    export DEBIAN_FRONTEND=noninteractive
    
    apt-get purge -y mysql-server mysql-client mysql-common \
    mysql-server-core-* mysql-client-core-* mariadb-server mariadb-client \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" || true

    log_status "Removendo resíduos físicos do MySQL..."
    rm -rf /etc/mysql /var/lib/mysql /var/log/mysql /var/run/mysqld /etc/apparmor.d/usr.sbin.mysqld

    log_status "Limpando dependências..."
    apt-get autoremove -y --purge >/dev/null 2>&1 || true
}

# --- ETAPA 4: Remover pacotes (Nginx, PHP, Node, PM2) ---
etapa_4() {
    echo -e "\n${RED}${BOLD}--- ETAPA 4: REMOÇÃO TOTAL DE PACOTES (NGINX, PHP, NODE, PM2) ---${NC}"
    
    log_status "Expurgando Nginx..."
    apt-get purge -y nginx nginx-common nginx-full >/dev/null 2>&1 || true
    rm -rf /etc/nginx /var/log/nginx /var/www/html >/dev/null 2>&1 || true

    log_status "Expurgando PHP e extensões..."
    apt-get purge -y "php${PHP_VER:-*}-*" php-common >/dev/null 2>&1 || true
    rm -rf /etc/php /var/log/php >/dev/null 2>&1 || true

    log_status "Expurgando Node.js e Certbot..."
    apt-get purge -y nodejs certbot python3-certbot-nginx >/dev/null 2>&1 || true
    rm -f /etc/apt/sources.list.d/nodesource.list >/dev/null 2>&1 || true

    log_status "Removendo PM2 Global..."
    npm uninstall -g pm2 >/dev/null 2>&1 || true
    rm -f $(which pm2) /usr/local/bin/pm2 /usr/bin/pm2 >/dev/null 2>&1 || true
    
    apt-get autoremove -y --purge >/dev/null 2>&1 || true
}

# --- ETAPA 5: Limpeza de arquivos de origem e temporários ---
etapa_5() {
    echo -e "\n${CYAN}${BOLD}--- ETAPA 5: LIMPEZA DE ARQUIVOS DE ORIGEM E TEMPORÁRIOS ---${NC}"
    log_status "Limpando caches e instaladores..."
    rm -rf /root/.pm2 /home/ubuntu/.pm2 /home/ubuntu/install.sh /home/ubuntu/Dieta-Milenar >/dev/null 2>&1 || true
    apt-get clean >/dev/null 2>&1 || true
}

# --- Menu ---
while true; do
    clear
    echo -e "${RED}${BOLD}====================================================="
    echo -e "      MENU DE DESINSTALAÇÃO - DIETA MILENAR"
    echo -e "=====================================================${NC}"
    echo -e "1) Executar Etapa 1 (Parar Serviços e Configs)"
    echo -e "2) Executar Etapa 2 (Remover Dados e Usuários)"
    echo -e "3) Executar Etapa 3 (${RED}Purge Total MySQL${NC})"
    echo -e "4) Executar Etapa 4 (${RED}Purge Total Nginx, PHP, Node, PM2${NC})"
    echo -e "5) Executar Etapa 5 (Limpeza de Temporários)"
    echo -e "-----------------------------------------------------"
    echo -e "6) ${RED}${BOLD}DESINSTALAÇÃO COMPLETA (ETAPAS 1 A 5)${NC}"
    echo -e "0) Sair"
    echo -e "====================================================="
    echo -n "Escolha uma opção: "
    read -r OPCAO

    case $OPCAO in
        1) etapa_1; read -p "Enter..." ;;
        2) etapa_2; read -p "Enter..." ;;
        3) 
            echo -e "${RED}Isso apagará o MySQL por completo!${NC}"
            read -p "Confirmar? (s/n): " c; [[ $c == "s" ]] && etapa_3
            read -p "Enter..." ;;
        4) 
            echo -e "${RED}Isso apagará Nginx, PHP e Node do servidor!${NC}"
            read -p "Confirmar? (s/n): " c; [[ $c == "s" ]] && etapa_4
            read -p "Enter..." ;;
        5) etapa_5; read -p "Enter..." ;;
        6)
            echo -e "${RED}${BOLD}ALERTA NUCLEAR: O SERVIDOR SERÁ COMPLETAMENTE LIMPO!${NC}"
            read -p "Digite 'Y' para confirmar: " c
            if [[ $c == "Y" ]]; then
                etapa_1 && etapa_2 && etapa_3 && etapa_4 && etapa_5
                echo -e "\n${GREEN}${BOLD}✅ TUDO FOI REMOVIDO COM SUCESSO!${NC}"
                exit 0
            fi
            ;;
        0) exit 0 ;;
        *) echo "Opção inválida!"; sleep 1 ;;
    esac
done