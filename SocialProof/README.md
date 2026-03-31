# 🤖 Social Proof Engine — Projeto Unificado

Sistema completo de chat orquestrado com bots + hooks React para landing pages.

---

## 📁 Estrutura

```
/
├── index.php                    ← Roteador principal PHP (raiz ou subpasta)
├── .htaccess                    ← Roteamento Apache
├── schema.sql                   ← Schema completo do banco de dados
├── cron.php                     ← Script para cron job
│
├── includes/
│   ├── config.php               ← Configuração central + Singleton DB + helpers
│   ├── engine.php               ← Motor de execução das timelines
│   └── claude.php               ← Integração Claude API (Anthropic)
│
├── api/
│   └── index.php                ← API REST completa (todas as rotas)
│
├── admin/
│   └── index.php                ← Painel administrativo responsivo
│
├── widget/
│   └── index.php                ← Widget iframe embeddável (chat ao vivo)
│
└── src/                         ← Componentes React (landing page)
    ├── hooks/
    │   ├── useCookieConsent.ts  ← Gerencia consentimento de cookies
    │   ├── useCountdown.ts      ← Contador regressivo para ofertas
    │   └── useScrollProgress.ts ← Progresso de scroll da página
    ├── utils/
    │   └── schemas.ts           ← Schema.org (Course + FAQ) para SEO
    └── types/
        └── index.ts             ← Tipos TypeScript compartilhados
```

---

## ⚡ Instalação (Backend PHP)

### 1. Banco de Dados
```sql
mysql -u root -p < schema.sql
```

### 2. Configuração
Edite `includes/config.php` — variáveis de ambiente têm prioridade:
```bash
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=socialproof
```
Ou edite os valores `define()` diretamente.

### 3. Cron Job
```
*/5 * * * * php /var/www/html/socialproof/cron.php >> /tmp/socialproof.log 2>&1
```

### 4. Embed
```html
<iframe 
  src="https://seudominio.com/widget/?room=SEU-SLUG" 
  width="400" height="600" frameborder="0"
  style="border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,0.3)">
</iframe>
```

---

## ⚛️ Uso dos Hooks React

### useCookieConsent
```tsx
import { useCookieConsent } from './src/hooks/useCookieConsent';

const { hasConsented, acceptCookies } = useCookieConsent();
```

### useCountdown
```tsx
import { useCountdown } from './src/hooks/useCountdown';

const { hours, minutes, seconds, isExpired } = useCountdown(30); // 30 minutos
```

### useScrollProgress
```tsx
import { useScrollProgress } from './src/hooks/useScrollProgress';

const progress = useScrollProgress(); // 0-100%
```

### schemas.ts (SEO)
```tsx
import { getCourseSchema, getFAQSchema } from './src/utils/schemas';

<script type="application/ld+json">{getCourseSchema()}</script>
<script type="application/ld+json">{getFAQSchema(faqItems)}</script>
```

---

## 🔐 Segurança
- Rotas `/api/` protegidas por `X-Admin-Token`
- `includes/` bloqueado via `.htaccess`
- Inputs sanitizados via PDO prepared statements
- Token de cron separado do token admin

---

## 📊 APIs

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/api/chat/messages?room=SLUG&last_id=0` | Público | Feed do chat |
| GET | `/api/chat/rooms/SLUG` | Público | Info da sala |
| POST | `/api/chat/track` | Público | Analytics |
| GET | `/api/bots` | Admin | Listar bots |
| POST | `/api/bots` | Admin | Criar bot |
| GET | `/api/archetypes` | Admin | Listar arquétipos |
| POST | `/api/archetypes` | Admin | Criar arquétipo |
| GET | `/api/rooms` | Admin | Listar salas |
| POST | `/api/rooms` | Admin | Criar sala |
| PUT | `/api/rooms/ID/status` | Admin | Ativar/pausar sala |
| GET | `/api/blocks?room_id=X` | Admin | Listar blocos |
| POST | `/api/blocks` | Admin | Criar bloco |
| PUT | `/api/blocks/ID/status` | Admin | Ativar/pausar bloco |
| POST | `/api/generate` | Admin | Gerar timeline com IA |
| GET | `/api/timeline?block_id=X` | Admin | Ver timeline |
| DELETE | `/api/timeline/BLOCK_ID` | Admin | Limpar timeline |
| GET | `/api/analytics?room_id=X` | Admin | Analytics da sala |
| GET/POST | `/api/settings` | Admin | Configurações |
| GET | `/api/cron?token=X` | Token | Trigger manual |
| GET | `/api/ping` | Público | Health check |

---

## 📦 Origem dos arquivos

| Arquivo | Fonte | Motivo |
|---------|-------|--------|
| `includes/config.php` | 1TESTE / socialproof_final | Versão mais completa (env vars, helpers, v2.0) |
| `includes/engine.php` | 1TESTE / socialproof_final | Versão mais robusta |
| `includes/claude.php` | 1TESTE / socialproof_final | Versão mais robusta |
| `api/index.php` | 1TESTE / socialproof_final | Mais mensagens de erro, VALID_MSG_TYPES const |
| `admin/index.php` | 1TESTE / socialproof_final | Responsivo, sidebar mobile, animações |
| `widget/index.php` | 1TESTE / socialproof_final | Typing indicator, analytics, scroll detection |
| `.htaccess` | socialproof_final | Proteção includes + roteamento |
| `schema.sql` | 1TESTE | Schema completo com arquétipos padrão |
| `src/hooks/*.ts` | dieta-milenar | Hooks React para landing page |
| `src/utils/schemas.ts` | dieta-milenar | SEO Schema.org |
| `src/types/index.ts` | Gerado | Tipos TS unificados |
