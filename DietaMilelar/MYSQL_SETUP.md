# Dieta Milenar — Configuração MySQL

## 1. Criar o banco de dados

### Localhost (Termux):
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS dieta_milenar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root dieta_milenar < schema.sql
```

### Hospedagem compartilhada (via phpMyAdmin ou SSH):
1. Painel de controle → MySQL → Criar banco `seusite_dieta`
2. Importar `schema.sql` pelo phpMyAdmin

---

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Editar .env com seus dados de banco
nano .env
```

---

## 3. Instalar dependências

```bash
npm install
```

---

## 4. Rodar o projeto

```bash
npm run dev
```

---

## Login inicial

| Campo | Valor |
|-------|-------|
| Email | admin@dietasmilenares.com |
| Senha | admin123 |

---

## Arquivos modificados

| Arquivo | O que mudou |
|---------|-------------|
| `server.ts` | Substituído Firebase por MySQL + JWT. Todas as rotas REST implementadas. |
| `src/context/DataContext.tsx` | Substituído Firebase SDK por chamadas REST `/api/*` com JWT. |
| `src/firebase.ts` | Stub vazio (mantido para não quebrar imports). |
| `schema.sql` | Schema MySQL completo com seed de dados. |
| `.env.example` | Variáveis de ambiente necessárias. |
| `package.json` | Removido `firebase`, adicionado `mysql2`, `bcrypt`, `jsonwebtoken`. |

## Estrutura das tabelas

users → plans → orders → commissions → withdrawals
     ↓
categories → subcategories → ebooks
bonuses / bots → timelines → timeline_blocks
