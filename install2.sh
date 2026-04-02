#!/usr/bin/env bash
# =============================================================================
#  INSTALADOR PROFISSIONAL — SaaS Dieta Milenar
#  Versão: 1.2.0
#  Compatível: Ubuntu 20.04+ / Debian 11+
#  Modo: Idempotente (pode rodar múltiplas vezes sem dano)
# =============================================================================

set -euo pipefail

# ─── Cores ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()    { echo -e "${GREEN}[✔]${NC} $1"; }
warn()   { echo -e "${YELLOW}[⚠]${NC} $1"; }
error()  { echo -e "${RED}[✘]${NC} $1"; exit 1; }
header() { echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${NC}"; \
           echo -e "${BOLD}${CYAN}  $1${NC}"; \
           echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}"; }

# ─── Verificação de root ───────────────────────────────────────────────────────
[[ $EUID -ne 0 ]] && error "Execute como root: sudo bash install.sh"

# =============================================================================
#  MENU INICIAL
# =============================================================================
echo -e "\n${BOLD}${CYAN}══════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}   SaaS Dieta Milenar — Instalador v1.2  ${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════${NC}\n"
echo -e "  ${BOLD}[1]${NC} Iniciar Instalação completa"
echo -e "  ${BOLD}[2]${NC} Atualizar Arquivos (mover arquivos + build)\n"
read -rp "  Escolha uma opção [1/2]: " MENU_OPTION

if [[ "$MENU_OPTION" == "2" ]]; then
  # ===========================================================================
  #  MODO ATUALIZAÇÃO — move arquivos + build
  # ===========================================================================
  header "MODO ATUALIZAÇÃO DE ARQUIVOS"

  REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  PROJECT_SRC="$REPO_DIR/DietaMilelar"
  SOCIALPROOF_SRC="$REPO_DIR/SocialProof"

  [[ ! -d "$PROJECT_SRC" ]] && error "Pasta 'DietaMilelar' não encontrada em $REPO_DIR."

  INSTALL_DIR="/var/www/dieta-milenar"
  SOCIALPROOF_DIR="/var/www/socialproof"

  read -rp "  Diretório de instalação [padrão: $INSTALL_DIR]: " CUSTOM_INSTALL_DIR
  [[ -n "$CUSTOM_INSTALL_DIR" ]] && INSTALL_DIR="$CUSTOM_INSTALL_DIR"

  # ── Mover arquivos do projeto principal ──────────────────────────────────────
  log "Copiando DietaMilelar → $INSTALL_DIR ..."
  mkdir -p "$INSTALL_DIR"
  rsync -a \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='.env' \
    "$PROJECT_SRC/" "$INSTALL_DIR/"
  log "Arquivos copiados"

  # ── Mover SocialProof se existir ─────────────────────────────────────────────
  if [[ -d "$SOCIALPROOF_SRC" ]]; then
    log "Copiando SocialProof → $SOCIALPROOF_DIR ..."
    mkdir -p "$SOCIALPROOF_DIR"
    rsync -a --exclude='.git' --exclude='DataBaseFULL' "$SOCIALPROOF_SRC/" "$SOCIALPROOF_DIR/"
    chown -R www-data:www-data "$SOCIALPROOF_DIR"
    log "SocialProof copiado"
  else
    warn "Pasta SocialProof não encontrada — pulando."
  fi

  # ── Build do frontend ─────────────────────────────────────────────────────────
  log "Instalando dependências npm..."
  cd "$INSTALL_DIR"
  npm install --silent

  log "Gerando build de produção (Vite)..."
  npm run build

  if [[ ! -f "$INSTALL_DIR/dist/index.html" ]]; then
    error "Build falhou — dist/index.html não encontrado. Verifique os erros acima."
  fi
  log "Build gerado com sucesso: $INSTALL_DIR/dist/"

  npm prune --omit=dev --silent

  # ── Ajustar permissões ────────────────────────────────────────────────────────
  chown -R root:www-data "$INSTALL_DIR"
  chmod -R 750 "$INSTALL_DIR"
  chmod 600 "$INSTALL_DIR/.env" 2>/dev/null || true
  chmod -R 775 "$INSTALL_DIR/public"
  chmod -R 775 "$INSTALL_DIR/socialmembers"
  chown -R www-data:www-data "$INSTALL_DIR/public"
  chown -R www-data:www-data "$INSTALL_DIR/socialmembers"

  # ── Reiniciar PM2 ─────────────────────────────────────────────────────────────
  if command -v pm2 &>/dev/null; then
    log "Reiniciando aplicação no PM2..."
    pm2 restart dieta-milenar 2>/dev/null || pm2 start "$INSTALL_DIR/ecosystem.config.cjs" --env production
    pm2 save
  else
    warn "PM2 não encontrado. Inicie a aplicação manualmente."
  fi

  echo ""
  echo -e "${GREEN}${BOLD}"
  echo "  ┌──────────────────────────────────────────────────────┐"
  echo "  │         Atualização concluída com sucesso!           │"
  echo "  └──────────────────────────────────────────────────────┘"
  echo -e "${NC}"
  echo -e "  ${BOLD}App dir:${NC}  $INSTALL_DIR"
  echo -e "  ${BOLD}Build:${NC}    $INSTALL_DIR/dist/"
  echo ""
  echo -e "  ${CYAN}pm2 logs dieta-milenar${NC}  → Ver logs em tempo real"
  echo ""
  exit 0
fi

# =============================================================================
#  INSTALAÇÃO COMPLETA (opção 1)
# =============================================================================
PROJECT_SRC="$REPO_DIR/DietaMilelar"
SOCIALPROOF_SRC="$REPO_DIR/SocialProof"

[[ ! -d "$PROJECT_SRC" ]] && error "Pasta 'DietaMilelar' não encontrada em $REPO_DIR. Clone o repositório corretamente."

# =============================================================================
#  ETAPA 0 — CONFIGURAÇÃO INTERATIVA
# =============================================================================
header "CONFIGURAÇÃO DO SISTEMA"

# ─── Detectar IP público automaticamente ──────────────────────────────────────
echo -e "${BOLD}Detectando IP público da máquina...${NC}"

PUBLIC_IP=""
for SERVICE in "https://api.ipify.org" "https://ipecho.net/plain" "https://checkip.amazonaws.com"; do
  PUBLIC_IP=$(curl -s --max-time 5 "$SERVICE" 2>/dev/null | tr -d '[:space:]')
  if [[ "$PUBLIC_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    break
  fi
  PUBLIC_IP=""
done

if [[ -z "$PUBLIC_IP" ]]; then
  warn "Não foi possível detectar o IP público. Usando IP local como fallback."
  PUBLIC_IP=$(hostname -I | awk '{print $1}')
fi

echo -e "  IP público detectado: ${CYAN}${BOLD}$PUBLIC_IP${NC}\n"

# ─── Domínio ou IP ────────────────────────────────────────────────────────────
read -rp "  Deseja usar um domínio no lugar do IP? [s/N]: " USE_DOMAIN

if [[ "$USE_DOMAIN" == "s" || "$USE_DOMAIN" == "S" ]]; then
  read -rp "  Digite o domínio (ex: meusite.com.br): " DOMAIN
  DOMAIN=$(echo "$DOMAIN" | tr -d '[:space:]' | sed 's|https\?://||' | sed 's|/.*||')
  [[ -z "$DOMAIN" ]] && error "Domínio não pode ser vazio."
  log "Usando domínio: $DOMAIN"
  USE_SSL=true
else
  DOMAIN="$PUBLIC_IP"
  log "Usando IP público: $DOMAIN"
  USE_SSL=false
fi

# ─── Portas fixas ─────────────────────────────────────────────────────────────
APP_PORT=3000

# ─── Banco de dados ───────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Configuração do Banco de Dados:${NC}\n"

read -rp "  Nome do banco de dados   [padrão: dieta_milenar]: " DB_NAME
DB_NAME=${DB_NAME:-dieta_milenar}

read -rp "  Usuário MySQL            [padrão: dieta_user]:    " DB_USER
DB_USER=${DB_USER:-dieta_user}

while true; do
  read -rsp "  Senha MySQL (oculta):    " DB_PASS; echo
  [[ -n "$DB_PASS" ]] && break
  warn "A senha não pode ser vazia. Tente novamente."
done

# ─── Segurança ────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Configurações de Segurança:${NC}\n"

read -rp "  JWT Secret [Enter = gerar automaticamente]: " JWT_SECRET
JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 32)}
log "JWT Secret configurado"

# ─── Stripe ───────────────────────────────────────────────────────────────────
echo ""
read -rp "  Stripe Secret Key [sk_live_... ou sk_test_... | Enter = pular]: " STRIPE_KEY
if [[ -z "$STRIPE_KEY" ]]; then
  warn "Stripe não configurado. Pagamentos via cartão não funcionarão até configurar no .env"
fi
STRIPE_KEY=${STRIPE_KEY:-sk_test_PLACEHOLDER}

# ─── Diretórios fixos ─────────────────────────────────────────────────────────
INSTALL_DIR="/var/www/dieta-milenar"
SOCIALPROOF_DIR="/var/www/socialproof"

# ─── Resumo ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║        Resumo da Configuração            ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}"
echo -e "  Endereço:      ${CYAN}$DOMAIN${NC}"
echo -e "  Porta backend: ${CYAN}$APP_PORT${NC} (interno, via PM2)"
echo -e "  Porta frontend:${CYAN}80${NC} (público, via Nginx)"
echo -e "  Banco:         ${CYAN}$DB_NAME${NC}"
echo -e "  Usuário DB:    ${CYAN}$DB_USER${NC}"
echo -e "  App dir:       ${CYAN}$INSTALL_DIR${NC}"
echo -e "  SocialProof:   ${CYAN}$SOCIALPROOF_DIR${NC}"
echo -e "  phpMyAdmin:    ${CYAN}http://$DOMAIN/phpmyadmin${NC}"
echo ""

read -rp "Confirmar e iniciar instalação? [s/N]: " CONFIRM
[[ "$CONFIRM" != "s" && "$CONFIRM" != "S" ]] && echo "Instalação cancelada." && exit 0

# =============================================================================
#  ETAPA 1 — DEPENDÊNCIAS DO SISTEMA
# =============================================================================
header "ETAPA 1 — Instalando dependências do sistema"

# ─── Para Apache2 se estiver rodando (libera porta 80) ───────────────────────
if systemctl is-active --quiet apache2 2>/dev/null; then
  warn "Apache2 detectado na porta 80 — parando para liberar para o Nginx..."
  systemctl stop apache2
  systemctl disable apache2 2>/dev/null || true
  log "Apache2 parado e desativado do boot"
fi

apt-get update -qq
apt-get install -y -qq \
  curl \
  git \
  unzip \
  nginx \
  mysql-server \
  openssl \
  build-essential \
  php \
  php-mbstring \
  php-zip \
  php-gd \
  php-json \
  php-curl \
  php-mysql \
  php-fpm

log "Dependências do sistema instaladas"

# ─── Node.js 20 LTS ───────────────────────────────────────────────────────────
if ! command -v node &>/dev/null || [[ $(node -v | grep -oP '\d+' | head -1) -lt 18 ]]; then
  log "Instalando Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
  apt-get install -y -qq nodejs
else
  log "Node.js já instalado: $(node -v)"
fi

# ─── PM2 ──────────────────────────────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
  log "Instalando PM2..."
  npm install -g pm2 --quiet
else
  log "PM2 já instalado: $(pm2 -v)"
fi

# =============================================================================
#  ETAPA 2 — CONFIGURAÇÃO DO MYSQL
# =============================================================================
header "ETAPA 2 — Configurando MySQL"

systemctl enable mysql --quiet
systemctl start mysql

# Ubuntu 22+ usa unix_socket para root — funciona sem senha
MYSQL_ROOT_CMD="mysql -u root"

$MYSQL_ROOT_CMD <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
CREATE DATABASE IF NOT EXISTS \`socialproof\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON \`socialproof\`.* TO '${DB_USER}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`socialproof\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

log "Banco '${DB_NAME}' e usuário '${DB_USER}' configurados"

# =============================================================================
#  ETAPA 3 — INSTALAÇÃO DO PHPMYADMIN
# =============================================================================
header "ETAPA 3 — Instalando phpMyAdmin"

PMA_VERSION="5.2.1"
PMA_DIR="/var/www/phpmyadmin"
PMA_ZIP="/tmp/phpmyadmin.zip"

if [[ ! -d "$PMA_DIR" ]]; then
  log "Baixando phpMyAdmin ${PMA_VERSION}..."
  curl -fsSL "https://files.phpmyadmin.net/phpMyAdmin/${PMA_VERSION}/phpMyAdmin-${PMA_VERSION}-all-languages.zip" \
    -o "$PMA_ZIP"
  log "Extraindo phpMyAdmin..."
  unzip -q "$PMA_ZIP" -d /tmp/pma_extract
  mv "/tmp/pma_extract/phpMyAdmin-${PMA_VERSION}-all-languages" "$PMA_DIR"
  rm -f "$PMA_ZIP"
  rm -rf /tmp/pma_extract
else
  log "phpMyAdmin já instalado em $PMA_DIR"
fi

PMA_BLOWFISH=$(openssl rand -hex 32)
cat > "$PMA_DIR/config.inc.php" <<PMACONF
<?php
\$cfg['blowfish_secret'] = '${PMA_BLOWFISH}';
\$i = 1;
\$cfg['Servers'][\$i]['auth_type']       = 'cookie';
\$cfg['Servers'][\$i]['host']            = '127.0.0.1';
\$cfg['Servers'][\$i]['port']            = '3306';
\$cfg['Servers'][\$i]['connect_type']    = 'tcp';
\$cfg['Servers'][\$i]['compress']        = false;
\$cfg['Servers'][\$i]['AllowNoPassword'] = false;
\$cfg['UploadDir'] = '';
\$cfg['SaveDir']   = '';
PMACONF

mkdir -p "$PMA_DIR/tmp"
chown -R www-data:www-data "$PMA_DIR"
chmod 750 "$PMA_DIR/tmp"

# Detecta versão do PHP para o socket do php-fpm
PHP_VERSION=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;' 2>/dev/null || echo "8.3")
PHP_FPM_SOCK="/var/run/php/php${PHP_VERSION}-fpm.sock"

systemctl enable "php${PHP_VERSION}-fpm" --quiet 2>/dev/null || true
systemctl start  "php${PHP_VERSION}-fpm"          2>/dev/null || true

log "phpMyAdmin configurado — PHP ${PHP_VERSION}"

# =============================================================================
#  ETAPA 4 — MOVIMENTAÇÃO DOS ARQUIVOS DO PROJETO
# =============================================================================
header "ETAPA 4 — Movendo arquivos do projeto"

# ─── Projeto principal: DietaMilelar → /var/www/dieta-milenar ─────────────────
log "Copiando DietaMilelar → $INSTALL_DIR ..."
mkdir -p "$INSTALL_DIR"
rsync -a \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  "$PROJECT_SRC/" "$INSTALL_DIR/"

# ─── SocialProof → /var/www/socialproof ───────────────────────────────────────
if [[ -d "$SOCIALPROOF_SRC" ]]; then
  log "Copiando SocialProof → $SOCIALPROOF_DIR ..."
  mkdir -p "$SOCIALPROOF_DIR"
  rsync -a --exclude='.git' --exclude='DataBaseFULL' "$SOCIALPROOF_SRC/" "$SOCIALPROOF_DIR/"

  # ─── Atualiza config.php com credenciais locais ───────────────────────────
  cat > "$SOCIALPROOF_DIR/includes/config.php" <<SPCONF
<?php
// ============================================================
// config.php — Social Proof Engine (gerado pelo instalador)
// ============================================================

define('APP_VERSION', '2.0.0');
define('CLAUDE_MODEL', 'claude-opus-4-5');

date_default_timezone_set('America/Sao_Paulo');

define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'socialproof');
define('DB_USER', '${DB_USER}');
define('DB_PASS', '${DB_PASS}');

class DB {
    private static \$instance = null;

    public static function conn(): PDO {
        if (self::\$instance === null) {
            try {
                self::\$instance = new PDO(
                    'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                    DB_USER,
                    DB_PASS,
                    [
                        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES   => false,
                        PDO::ATTR_TIMEOUT            => 10,
                    ]
                );
                self::\$instance->exec("SET time_zone = '-03:00'");
            } catch (PDOException \$e) {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                die(json_encode(['error' => 'Database connection failed', 'details' => \$e->getMessage()], JSON_UNESCAPED_UNICODE));
            }
        }
        return self::\$instance;
    }

    public static function fetch(string \$sql, array \$params = []): ?array {
        \$stmt = self::conn()->prepare(\$sql);
        \$stmt->execute(\$params);
        return \$stmt->fetch() ?: null;
    }

    public static function fetchAll(string \$sql, array \$params = []): array {
        \$stmt = self::conn()->prepare(\$sql);
        \$stmt->execute(\$params);
        return \$stmt->fetchAll();
    }

    public static function insert(string \$sql, array \$params = []): string {
        \$stmt = self::conn()->prepare(\$sql);
        \$stmt->execute(\$params);
        return self::conn()->lastInsertId();
    }

    public static function query(string \$sql, array \$params = []): bool {
        \$stmt = self::conn()->prepare(\$sql);
        return \$stmt->execute(\$params);
    }

    public static function execute(string \$sql, array \$params = []): bool {
        return self::query(\$sql, \$params);
    }
}

function getSetting(string \$key): string {
    try {
        \$row = DB::fetch('SELECT \`value\` FROM settings WHERE \`key\` = ?', [\$key]);
        return \$row ? (string)\$row['value'] : '';
    } catch (Exception \$e) {
        return '';
    }
}

function setSetting(string \$key, string \$value): void {
    DB::query(
        'INSERT INTO settings (\`key\`, \`value\`) VALUES (?,?) ON DUPLICATE KEY UPDATE \`value\`=?, updated_at=NOW()',
        [\$key, \$value, \$value]
    );
}

function jsonResponse(array \$data, int \$code = 200): void {
    http_response_code(\$code);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    echo json_encode(\$data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function generateSlug(string \$text): string {
    \$text = mb_strtolower(\$text, 'UTF-8');
    \$from = ['á','à','ã','â','ä','é','è','ê','ë','í','ì','î','ï','ó','ò','õ','ô','ö','ú','ù','û','ü','ç','ñ'];
    \$to   = ['a','a','a','a','a','e','e','e','e','i','i','i','i','o','o','o','o','o','u','u','u','u','c','n'];
    \$text = str_replace(\$from, \$to, \$text);
    \$text = preg_replace('/[^a-z0-9\s-]/', '', \$text);
    \$text = preg_replace('/[\s-]+/', '-', \$text);
    return trim(\$text, '-');
}

function avatarUrl(string \$seed): string {
    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . urlencode(\$seed)
         . '&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf';
}
SPCONF

  chown -R www-data:www-data "$SOCIALPROOF_DIR"
  log "SocialProof copiado e configurado"
else
  warn "Pasta SocialProof não encontrada — pulando."
fi

# ─── Diretórios de upload e logs ──────────────────────────────────────────────
mkdir -p "$INSTALL_DIR/public/e-books"
mkdir -p "$INSTALL_DIR/public/proofs"
mkdir -p "$INSTALL_DIR/public/img"
mkdir -p "$INSTALL_DIR/socialmembers"
mkdir -p /var/log/dieta-milenar

log "Estrutura de diretórios criada"

# =============================================================================
#  ETAPA 5 — ARQUIVO .env
# =============================================================================
header "ETAPA 5 — Criando .env"

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

# =============================================================================
#  ETAPA 6 — DEPENDÊNCIAS NPM + BUILD DO FRONTEND
# =============================================================================
header "ETAPA 6 — Instalando dependências e buildando frontend"

cd "$INSTALL_DIR"

# ─── Injeta URL do SocialProof no ChatWidget ──────────────────────────────────
CHAT_WIDGET="$INSTALL_DIR/src/components/ChatWidget.tsx"
if [[ -f "$CHAT_WIDGET" ]]; then
  SOCIALPROOF_WIDGET_URL="http://${DOMAIN}/socialproof/widget/index.php?room=dieta-faraonica"
  sed -i "s|https://socialproof-production\.up\.railway\.app/widget/index\.php?room=dieta-faraonica|${SOCIALPROOF_WIDGET_URL}|g" "$CHAT_WIDGET"
  log "ChatWidget atualizado com URL do SocialProof: $SOCIALPROOF_WIDGET_URL"
else
  warn "ChatWidget.tsx não encontrado — verifique o caminho"
fi

# Instala todas as deps (devDeps são necessárias para o build do Vite)
log "Instalando dependências npm..."
npm install --silent

# Build do frontend (gera dist/)
log "Gerando build de produção (Vite)..."
npm run build

# Verifica se o build foi gerado
if [[ ! -f "$INSTALL_DIR/dist/index.html" ]]; then
  error "Build falhou — dist/index.html não encontrado. Verifique os erros acima."
fi
log "Build gerado com sucesso: $INSTALL_DIR/dist/"

# Remove devDependencies após o build (economiza ~300MB)
log "Removendo devDependencies..."
npm prune --omit=dev --silent

log "Dependências de produção prontas"

# =============================================================================
#  ETAPA 7 — IMPORTAÇÃO DO SCHEMA DO BANCO
# =============================================================================
header "ETAPA 7 — Importando schema do banco de dados"

SQL_FILE=""
SQL_FILE=$(find "$INSTALL_DIR" -maxdepth 4 -iname "db_atual.sql" | head -1)
if [[ -z "$SQL_FILE" ]]; then
  SQL_FILE=$(find "$INSTALL_DIR" -maxdepth 4 -iname "*.sql" | grep -iv migration | head -1)
fi

if [[ -n "$SQL_FILE" ]]; then
  log "Importando schema: $SQL_FILE"
  mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE" 2>/dev/null \
    && log "Schema importado com sucesso" \
    || warn "Schema já importado ou erro parcial (verifique manualmente)"
else
  warn "Nenhum arquivo SQL encontrado. Importe manualmente se necessário."
fi

# Migrations adicionais
for migration in "DataBase/migration_tickets.sql" "DataBase/migration_payment_proof.sql"; do
  if [[ -f "$INSTALL_DIR/$migration" ]]; then
    log "Aplicando migration: $migration"
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$INSTALL_DIR/$migration" 2>/dev/null \
      || warn "Migration $migration já aplicada ou falhou"
  fi
done

# ─── Banco do SocialProof ─────────────────────────────────────────────────────
SP_SQL=$(find "$SOCIALPROOF_DIR" -maxdepth 4 -iname "dbsp_atual.sql" | head -1)
if [[ -n "$SP_SQL" ]]; then
  log "Importando banco do SocialProof: $SP_SQL"
  mysql -u "$DB_USER" -p"$DB_PASS" socialproof < "$SP_SQL" 2>/dev/null \
    && log "Banco SocialProof importado com sucesso" \
    || warn "Banco SocialProof já importado ou erro parcial"
else
  warn "DBSP_Atual.sql não encontrado — importe manualmente"
fi

# =============================================================================
#  ETAPA 8 — PERMISSÕES
# =============================================================================
header "ETAPA 8 — Ajustando permissões"

chown -R root:www-data "$INSTALL_DIR"
chmod -R 750 "$INSTALL_DIR"
chmod 600 "$INSTALL_DIR/.env"
chmod -R 775 "$INSTALL_DIR/public"
chmod -R 775 "$INSTALL_DIR/socialmembers"
chown -R www-data:www-data "$INSTALL_DIR/public"
chown -R www-data:www-data "$INSTALL_DIR/socialmembers"
chown -R www-data:www-data /var/log/dieta-milenar

log "Permissões configuradas"

# =============================================================================
#  ETAPA 9 — PM2
# =============================================================================
header "ETAPA 9 — Configurando PM2"

cat > "$INSTALL_DIR/ecosystem.config.cjs" <<PM2
module.exports = {
  apps: [{
    name: 'dieta-milenar',
    script: 'server.ts',
    interpreter: 'node',
    interpreter_args: '--import tsx/esm',
    cwd: '${INSTALL_DIR}',
    exec_mode: 'fork',
    instances: 1,
    env: {
      NODE_ENV: 'production',
    },
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    error_file: '/var/log/dieta-milenar/error.log',
    out_file:   '/var/log/dieta-milenar/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
PM2

# Para instância anterior se existir (idempotente)
pm2 stop dieta-milenar 2>/dev/null || true
pm2 delete dieta-milenar 2>/dev/null || true

pm2 start "$INSTALL_DIR/ecosystem.config.cjs" --env production
pm2 save
pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true

log "Aplicação iniciada via PM2"

# =============================================================================
#  ETAPA 10 — NGINX
# =============================================================================
header "ETAPA 10 — Configurando Nginx"

rm -f /etc/nginx/sites-enabled/default

cat > "/etc/nginx/sites-available/dieta-milenar" <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    client_max_body_size 110M;

    access_log /var/log/nginx/dieta-milenar.access.log;
    error_log  /var/log/nginx/dieta-milenar.error.log;

    # ── phpMyAdmin ────────────────────────────────────────
    location /phpmyadmin {
        root /var/www;
        index index.php index.html;

        location ~ ^/phpmyadmin/(.+\.php)$ {
            try_files \$uri =404;
            root /var/www;
            fastcgi_pass unix:${PHP_FPM_SOCK};
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            include fastcgi_params;
        }

        location ~* ^/phpmyadmin/(.+\.(jpg|jpeg|gif|css|png|js|ico|html|xml|txt))$ {
            root /var/www;
        }
    }

    # ── SocialProof (PHP) ─────────────────────────────────
    location ^~ /socialproof {
        root /var/www;
        index index.php index.html;
        try_files \$uri \$uri/ /socialproof/index.php\$is_args\$args;

        location ~ ^/socialproof/.+\.php$ {
            root /var/www;
            try_files \$uri =404;
            fastcgi_pass unix:${PHP_FPM_SOCK};
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            include fastcgi_params;
        }
    }

    # ── Proxy Node (API + SPA React) ──────────────────────
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

    # ── Cache arquivos estáticos ──────────────────────────
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        proxy_pass http://127.0.0.1:${APP_PORT};
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
NGINX

ln -sf /etc/nginx/sites-available/dieta-milenar /etc/nginx/sites-enabled/
nginx -t && systemctl enable nginx && (systemctl is-active --quiet nginx && systemctl reload nginx || systemctl start nginx)

log "Nginx configurado (porta 80)"

# =============================================================================
#  ETAPA 11 — SSL
# =============================================================================
if [[ "$USE_SSL" == true ]]; then
  header "ETAPA 11 — SSL com Certbot (Let's Encrypt)"

  if ! command -v certbot &>/dev/null; then
    apt-get install -y -qq certbot python3-certbot-nginx
  fi

  read -rp "  Instalar certificado SSL gratuito para $DOMAIN? [s/N]: " DO_SSL
  if [[ "$DO_SSL" == "s" || "$DO_SSL" == "S" ]]; then
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" \
      && log "SSL instalado com sucesso para $DOMAIN" \
      || warn "SSL falhou. Configure manualmente: certbot --nginx -d $DOMAIN"
  else
    log "SSL ignorado. Configure depois com: certbot --nginx -d $DOMAIN"
  fi
else
  header "ETAPA 11 — SSL"
  warn "SSL não disponível para IP direto. Configure um domínio e execute:"
  echo -e "      ${CYAN}certbot --nginx -d SEU_DOMINIO${NC}"
fi

# =============================================================================
#  RESUMO FINAL
# =============================================================================
header "INSTALAÇÃO CONCLUÍDA"

echo -e "${GREEN}${BOLD}"
echo "  ┌─────────────────────────────────────────────────────┐"
echo "  │      SaaS Dieta Milenar — INSTALADO E RODANDO      │"
echo "  └─────────────────────────────────────────────────────┘"
echo -e "${NC}"
echo -e "  ${BOLD}Aplicação:${NC}      http://${DOMAIN}"
echo -e "  ${BOLD}phpMyAdmin:${NC}     http://${DOMAIN}/phpmyadmin"
echo -e "  ${BOLD}App dir:${NC}        $INSTALL_DIR"
echo -e "  ${BOLD}SocialProof:${NC}    $SOCIALPROOF_DIR"
echo -e "  ${BOLD}Banco:${NC}          $DB_NAME"
echo ""
echo -e "  ${BOLD}${YELLOW}━━━ LOGIN PADRÃO DO SISTEMA ━━━${NC}"
echo -e "  ${BOLD}E-mail:${NC}  admin@dietasmilenares.com"
echo -e "  ${BOLD}Senha:${NC}   admin123"
echo ""
echo -e "  ${BOLD}${YELLOW}━━━ LOGIN PHPMYADMIN ━━━${NC}"
echo -e "  ${BOLD}Usuário:${NC} $DB_USER"
echo -e "  ${BOLD}Senha:${NC}   (a senha que você digitou)"
echo -e "  ${BOLD}URL:${NC}     http://${DOMAIN}/phpmyadmin"
echo ""
echo -e "  ${BOLD}${RED}⚠  Troque a senha do admin imediatamente após o primeiro acesso!${NC}"
echo ""
echo -e "  ${BOLD}Comandos úteis:${NC}"
echo -e "  ${CYAN}pm2 status${NC}                    → Status da aplicação"
echo -e "  ${CYAN}pm2 logs dieta-milenar${NC}         → Ver logs em tempo real"
echo -e "  ${CYAN}pm2 restart dieta-milenar${NC}      → Reiniciar aplicação"
echo -e "  ${CYAN}systemctl status nginx${NC}         → Status do Nginx"
echo -e "  ${CYAN}systemctl status mysql${NC}         → Status do MySQL"
echo ""

# ─── Limpeza da pasta clonada ─────────────────────────────────────────────────
rm -rf "$REPO_DIR"
log "Pasta de instalação removida: $REPO_DIR"
