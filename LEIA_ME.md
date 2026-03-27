# Patch — Subcategorias Não Aparecem

## Aplicar no Railway (banco) PRIMEIRO:
```
mysql -h HOST -u USER -p DATABASE < fix_subcategorias.sql
```

## Substituir os arquivos no projeto:
- `src/context/DataContext.tsx`
- `src/components/LibrarySubcategories.tsx`
- `src/components/AdminDashboard.tsx`

---

## O que foi corrigido

### Banco (fix_subcategorias.sql)
| # | Problema | Fix |
|---|----------|-----|
| 1 | `saga-energia` com `active=0` | `UPDATE SET active=1` |
| 2 | 2 subcategorias com `category_id` inexistente | `DELETE` |
| 3 | 1 subcategoria com `name` vazio | `DELETE` |

### Código (3 arquivos)
| # | Arquivo | Problema | Fix |
|---|---------|----------|-----|
| 1 | DataContext.tsx | `normSubcategory` não mapeava `cover_image` | Adicionado `coverImage` |
| 2 | DataContext.tsx | `refreshCategories` não recarregava subcategories | Adicionado `setSubcategories` dentro de `refreshCategories` |
| 3 | DataContext.tsx | Não havia `refreshSubcategories` exposto | Criado e exposto no contexto |
| 4 | LibrarySubcategories.tsx | Desativar/reativar sub chamava `refreshCategories` | Trocado por `refreshSubcategories` |
| 5 | AdminDashboard.tsx | Desativar/reativar sub chamava `refreshCategories` | Trocado por `refreshSubcategories` |
