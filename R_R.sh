#!/bin/bash
# =============================================================================
#  SaaS DIETA MILENAR — DESINSTALADOR TOTAL RR v2.0 (O MAIS COMPLETO)
#  REVERTE TUDO QUE O INSTALADOR FEZ.
#  ATENÇÃO: EXTREMAMENTE DESTRUTIVO. USE APENAS EM MÁQUINAS DEDICADAS.
# =============================================================================

set -euo pipefail
IFS=$'\n\t'
umask 027

# --- Cores e Layout ---
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
log_status() { echo -e "  ${GREEN}[✔]${NC} $1"; }
log_warn()   { echo -e "  ${YELLOW}[⚠]${NC} $1"; }
log_error()  { echo -e "  ${RED}[✘]${NC} $1"; exit 1; }

# --- Helpers ---
on_err() { log_error "Falha na linha $1 (cmd: $2)"; }
trap 'on_err "$LINENO" "$BASH_COMMAND"' ERR

# --- Variáveis de Configuração (DEVE ESPELHAR O INSTALADOR) ---
INSTALL_DIR="/var/www/dieta-milenar"
SOCIALPROOF_DIR="/var/www/socialproof"
APP_USER="dieta"
APP_GROUP="dieta"
DB_NAME="dieta_milenar"
DB_USER="dieta_user"
PHP_VER=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null || true)
PMA_DIR="/var/www/phpmyadmin" # Pode ou não ter sido instalado

export DEBIAN_FRONTEND=noninteractive

# --- Verificações Iniciais ---
[[ ${EUID:-999} -eq 0 ]] || log_error "Execute como root: sudo RR"

# Lock anti-concorrência
install -d -m 0755 /run/lock
exec 9>/run/lock/dieta-milenar-uninstall.lock
flock -n 9 || log_error "Desinstalador já está rodando (lock /run/lock/dieta-milenar-uninstall.lock)"

echo -e "\n${RED}${BOLD}🚨 INICIANDO DESINSTALAÇÃO DA DIETA MILENAR 🚨${NC}\n"
echo -e "  ${RED}${BOLD}ESTE SCRIPT IRÁ REMOVER TODOS OS COMPONENTES DA APLICAÇÃO${NC}"
echo -e "  ${RED}${BOLD}DIETA MILENAR E SEUS DADOS. ISSO É IRREVERSÍVEL!${NC}"
echo -e "  ${RED}${BOLD}NÃO EXECUTE EM SERVIDORES COM OUTRAS APLICAÇÕES!${NC}"
echo -e "\n  ${YELLOW}Serão removidos:${NC}"
echo -e "  - Arquivos da aplicação em ${INSTALL_DIR} e ${SOCIALPROOF_DIR}"
echo -e "  - Bancos de dados '${DB_NAME}' e 'socialproof'"
echo -e "  - Usuário MySQL '${DB_USER}'"
echo -e "  - Usuário de sistema '${APP_USER}'"
echo -e "  - Configurações do Nginx e PM2 (específicas da Dieta Milenar)"
echo -e "  - Pacotes como Node.js, PHP-FPM, Certbot (se não forem dependências críticas de outros)"
echo -e "  - Diretório de origem do instalador e do projeto (se existirem em /home/ubuntu)"
echo -e "\n  ${BOLD}${RED}CONFIRME APENAS SE ESTA MÁQUINA É DEDICADA À DIETA MILENAR.${NC}"
read -r -p "  DIGITE 'SIM' PARA CONTINUAR OU QUALQUER OUTRA COISA PARA CANCELAR: " CONFIRM_UNINSTALL
[[ "$CONFIRM_UNINSTALL" != "SIM" ]] && log_error "Desinstalação cancelada pelo usuário."

# --- ETAPA 1: Parar serviços e remover configs ---
echo -e "\n${CYAN}${BOLD}--- ETAPA 1: PARANDO SERVIÇOS E REMOVENDO CONFIGURAÇÕES ---${NC}"

log_status "Parando PM2 e removendo apps..."
if id -u "$APP_USER" >/dev/null 2>&1; then
  sudo -u "$APP_USER" -g "$APP_GROUP" pm2 stop dieta-milenar >/dev/null 2>&1 || true
  sudo -u "$APP_USER" -g "$APP_GROUP" pm2 delete dieta-milenar >/dev/null 2>&1 || true
  sudo -u "$APP_USER" -g "$APP_GROUP" pm2 save --force >/dev/null 2>&1 || true
  pm2 unstartup systemd -u "$APP_USER" --hp /var/lib/"$APP_USER" >/dev/null 2>&1 || true
else
  log_warn "Usuário '$APP_USER' não encontrado, pulando remoção de PM2 app."
fi
npm uninstall -g pm2 >/dev/null 2>&1 || true # Remove PM2 global (se instalado globalmente)

log_status "Parando e desabilitando Nginx..."
systemctl stop nginx >/dev/null 2>&1 || true
systemctl disable nginx >/dev/null 2>&1 || true
rm -f /etc/nginx/sites-enabled/dieta-milenar >/dev/null 2>&1 || true
rm -f /etc/nginx/sites-available/dieta-milenar >/dev/null 2>&1 || true
rm -f /var/log/nginx/dieta-milenar.access.log >/dev/null 2>&1 || true
rm -f /var/log/nginx/dieta-milenar.error.log >/dev/null 2>&1 || true
# Tenta reiniciar Nginx se ainda estiver ativo (para limpar configs)
systemctl reload nginx >/dev/null 2>&1 || systemctl start nginx >/dev/null 2>&1 || true

log_status "Parando e desabilitando MySQL..."
systemctl stop mysql >/dev/null 2>&1 || true
systemctl disable mysql >/dev/null 2>&1 || true

if [[ -n "$PHP_VER" ]]; then
  log_status "Parando e desabilitando PHP-FPM ${PHP_VER}..."
  systemctl stop "php${PHP_VER}-fpm" >/dev/null 2>&1 || true
  systemctl disable "php${PHP_VER}-fpm" >/dev/null 2>&1 || true
fi

# --- ETAPA 2: Remover dados e usuários ---
echo -e "\n${CYAN}${BOLD}--- ETAPA 2: REMOVENDO DADOS E USUÁRIOS ---${NC}"

log_status "Removendo bancos de dados e usuário MySQL..."
if command -v mysql >/dev/null 2>&1 && mysql -u root -e "SELECT 1" >/dev/null 2>&1; then
  mysql -u root <<SQL_DEL_DB >/dev/null 2>&1 || true
DROP DATABASE IF EXISTS \`${DB_NAME}\`;
DROP DATABASE IF EXISTS \`socialproof\`;
DROP USER IF EXISTS '${DB_USER}'@'localhost';
DROP USER IF EXISTS '${DB_USER}'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL_DEL_DB
  log_status "Bancos e usuário MySQL removidos."
else
  log_warn "Não foi possível conectar ao MySQL como root. Remova manualmente."
fi

log_status "Removendo diretórios da aplicação..."
rm -rf "$INSTALL_DIR" >/dev/null 2>&1 || true
rm -rf "$SOCIALPROOF_DIR" >/dev/null 2>&1 || true
rm -rf "$PMA_DIR" >/dev/null 2>&1 || true # Remove phpMyAdmin se foi instalado
rm -rf /var/log/dieta-milenar >/dev/null 2>&1 || true

log_status "Removendo usuário de sistema '$APP_USER'..."
if id -u "$APP_USER" >/dev/null 2>&1; then
  userdel -r "$APP_USER" >/dev/null 2>&1 || true # -r remove home dir
  groupdel "$APP_GROUP" >/dev/null 2>&1 || true
  log_status "Usuário '$APP_USER' removido."
else
  log_warn "Usuário '$APP_USER' não encontrado."
fi

# --- ETAPA 3: Remoção completa do MySQL (sem resíduos) ---
echo -e "\n${CYAN}${BOLD}--- ETAPA 3: REMOÇÃO COMPLETA DO MYSQL (PURGE TOTAL) ---${NC}"

_purge_mysql() {
  # ── 3.1 Garante que o serviço esteja rodando para dropar os DBs ──────────
  log_status "Iniciando MySQL temporariamente para limpeza de bancos..."
  systemctl start mysql >/dev/null 2>&1 || true
  sleep 2

  # ── 3.2 Dropa TODOS os bancos não-sistema ────────────────────────────────
  if command -v mysql >/dev/null 2>&1 && mysql -u root -e "SELECT 1" >/dev/null 2>&1; then
    log_status "Dropando todos os bancos de dados de usuário..."
    # Lista bancos excluindo os do sistema e executa DROP para cada um
    mysql -u root -Bse "
      SELECT schema_name FROM information_schema.schemata
      WHERE schema_name NOT IN
        ('information_schema','performance_schema','mysql','sys');
    " 2>/dev/null | while IFS= read -r db; do
      [[ -z "$db" ]] && continue
      mysql -u root -e "DROP DATABASE IF EXISTS \`${db}\`;" >/dev/null 2>&1 && \
        log_status "  Banco '${db}' removido." || \
        log_warn  "  Falha ao dropar '${db}' (ignorado)."
    done
    # Remove todos os usuários não-root / não-sistema
    mysql -u root -Bse "
      SELECT CONCAT(\"'\",user,\"'@'\",host,\"'\")
      FROM mysql.user
      WHERE user NOT IN ('root','mysql.sys','mysql.infoschema','mysql.session','debian-sys-maint');
    " 2>/dev/null | while IFS= read -r usr; do
      [[ -z "$usr" ]] && continue
      mysql -u root -e "DROP USER IF EXISTS ${usr};" >/dev/null 2>&1 || true
    done
    mysql -u root -e "FLUSH PRIVILEGES;" >/dev/null 2>&1 || true
    log_status "Todos os bancos de usuário e contas MySQL removidos."
  else
    log_warn "Não foi possível conectar ao MySQL como root. Prosseguindo com purge de arquivos."
  fi

  # ── 3.3 Para o serviço antes de purgar ───────────────────────────────────
  log_status "Parando MySQL antes do purge..."
  systemctl stop mysql  >/dev/null 2>&1 || true
  systemctl disable mysql >/dev/null 2>&1 || true
  killall -9 mysqld mysqld_safe >/dev/null 2>&1 || true

  # ── 3.4 Purga pacotes MySQL (apenas mysql-*, não libmysqlclient) ─────────
  log_status "Purgando pacotes mysql-*..."
  # Coleta pacotes instalados cujo nome começa com mysql-
  MYSQL_PKGS=$(dpkg -l 'mysql-*' 2>/dev/null \
    | awk '/^ii/{print $2}' \
    | grep -v '^libmysqlclient' || true)
  if [[ -n "$MYSQL_PKGS" ]]; then
    # shellcheck disable=SC2086
    apt-get remove --purge -y $MYSQL_PKGS >/dev/null 2>&1 || true
    log_status "Pacotes removidos: $MYSQL_PKGS"
  else
    log_warn "Nenhum pacote mysql-* encontrado para remover."
  fi
  # Remove também o meta-pacote mysql-server caso exista com outro nome
  apt-get remove --purge -y \
    mysql-server mysql-client mysql-common \
    mysql-server-core-* mysql-client-core-* \
    >/dev/null 2>&1 || true

  # ── 3.5 Remove resíduos de arquivos (dados, configs, logs, sockets) ──────
  log_status "Removendo resíduos de arquivos do MySQL..."
  rm -rf /etc/mysql                       # configs
  rm -rf /var/lib/mysql                   # datadir (todos os bancos em disco)
  rm -rf /var/lib/mysql-files             # secure-file-priv
  rm -rf /var/log/mysql                   # logs
  rm -f  /var/run/mysqld/mysqld.sock      # socket
  rm -f  /tmp/mysql.sock                  # socket alternativo
  rm -f  /etc/apparmor.d/usr.sbin.mysqld  # perfil apparmor (se existir)
  apparmor_parser -R /etc/apparmor.d/usr.sbin.mysqld >/dev/null 2>&1 || true
  rm -f  /etc/logrotate.d/mysql-server    # logrotate
  rm -f  /etc/init.d/mysql               # init script legado
  update-rc.d mysql remove >/dev/null 2>&1 || true

  # ── 3.6 Remove usuário de sistema 'mysql' apenas se não houver outros ────
  #        serviços dependendo dele (checagem conservadora)
  if id -u mysql >/dev/null 2>&1; then
    # Só remove se não houver processo rodando como mysql
    if ! pgrep -u mysql >/dev/null 2>&1; then
      userdel mysql >/dev/null 2>&1 || true
      groupdel mysql >/dev/null 2>&1 || true
      log_status "Usuário de sistema 'mysql' removido."
    else
      log_warn "Processo rodando como 'mysql' detectado — usuário de sistema preservado."
    fi
  fi

  apt-get autoremove --purge -y >/dev/null 2>&1 || true
  log_status "MySQL completamente removido e sem resíduos."
}

if dpkg -l 'mysql-*' 2>/dev/null | grep -q '^ii' || command -v mysqld >/dev/null 2>&1; then
  _purge_mysql
else
  log_warn "MySQL não detectado no sistema. Etapa de purge ignorada."
fi

# --- ETAPA 4: Remover pacotes ---
echo -e "\n${CYAN}${BOLD}--- ETAPA 4: REMOVENDO PACOTES (COM CAUTELA) ---${NC}"

log_status "Removendo pacotes específicos da aplicação (sem purgar essenciais)..."
# Remove pacotes que o instalador adicionou e que não são dependências críticas do SO
apt-get remove -y --purge \
  nodejs \
  php-mysql \
  php-mbstring \
  php-zip \
  php-gd \
  php-curl \
  python3-certbot-nginx \
  certbot >/dev/null 2>&1 || true

# Remover repositório NodeSource
rm -f /etc/apt/sources.list.d/nodesource.list >/dev/null 2>&1 || true
rm -f /etc/apt/keyrings/nodesource.gpg >/dev/null 2>&1 || true

# Limpeza geral de pacotes não utilizados
apt-get autoremove -y --purge >/dev/null 2>&1 || true
apt-get clean >/dev/null 2>&1 || true
log_status "Pacotes específicos e cache removidos."

# --- ETAPA 5: Limpeza de arquivos de origem e temporários ---
echo -e "\n${CYAN}${BOLD}--- ETAPA 5: LIMPEZA DE ARQUIVOS DE ORIGEM E TEMPORÁRIOS ---${NC}"

log_status "Removendo arquivos temporários do PM2..."
rm -rf /root/.pm2 >/dev/null 2>&1 || true
if id -u "$APP_USER" >/dev/null 2>&1; then
  rm -rf /var/lib/"$APP_USER"/.pm2 >/dev/null 2>&1 || true # Home do usuário dieta
fi

# Remover o próprio script instalador/desinstalador e o diretório de origem do projeto
# ATENÇÃO: Isso remove arquivos do diretório de onde o instalador foi executado.
# A pasta /home/ubuntu não é removida, mas o conteúdo específico sim.
log_status "Removendo arquivos de origem do instalador e do projeto (se existirem)..."
if [[ -f "/home/ubuntu/install.sh" ]]; then
  rm -f "/home/ubuntu/install.sh" >/dev/null 2>&1 || true
  log_status "Arquivo /home/ubuntu/install.sh removido."
fi
if [[ -d "/home/ubuntu/Dieta-Milenar" ]]; then
  rm -rf "/home/ubuntu/Dieta-Milenar" >/dev/null 2>&1 || true
  log_status "Diretório /home/ubuntu/Dieta-Milenar removido."
fi
# Remover o próprio script RR (se estiver em /usr/local/bin)
if [[ "$0" == "/usr/local/bin/RR" ]]; then
  rm -f "/usr/local/bin/RR" >/dev/null 2>&1 || true
  log_status "O próprio script RR (/usr/local/bin/RR) foi removido."
fi

# --- RESUMO FINAL ---
echo -e "\n${GREEN}${BOLD}✅ DESINSTALAÇÃO DA DIETA MILENAR CONCLUÍDA. ✅${NC}"
echo -e "  ${YELLOW}Verifique manualmente se há resíduos ou se outros serviços foram afetados.${NC}"
echo -e "  ${CYAN}Para uma limpeza completa de um servidor não dedicado, considere reinstalar o SO.${NC}"
echo -e "\n${BOLD}Execute: ${CYAN}history -d $(history 1 | awk '{print $1}') && history -d $(history 1 | awk '{print $1}')${NC} para remover este comando do histórico."