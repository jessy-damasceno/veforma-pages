# brindefly-partner

Landing page e fluxo de conexão do aplicativo **Veforma** na loja de aplicativos da Brindefly. Fluxo: painel Brindefly → landing com planos (este projeto) → checkout no Stripe (link gerado por API já existente, fora deste repo) → retorno para a tela de configuração → volta ao painel.

Repositório `vorisc/veforma-pages` (GitHub); este projeto vive em `brindefly-partner/`. O git fica na raiz do repo.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind 4 (`@tailwindcss/turbopack`) + shadcn (radix, new-york) · lucide-react · Zod 4 · Biome · pnpm · Cloudflare Workers via `@opennextjs/cloudflare` + wrangler.

## Convenções herdadas da Brindefly

- pnpm, versões **exatas** no `package.json` (`.npmrc` com `save-exact`), Biome (aspas simples, sem ponto e vírgula, vírgula final, 80 colunas), alias `@/*` → `./src/*`.
- Named exports (páginas e layouts do App Router são a exceção: `export default`); props com `interface`; `import type`; `??` em vez de `||`; `as const` em vez de enum; sem `any`.
- Ordem no componente: hooks → queries/mutations → form → memos → funções → constantes derivadas. Sub-componente que cresce vira pasta com `index.tsx`.
- Zod importado de `@/lib/zod` (error map pt-BR); `cn` em `@/utils/cn`; constantes usadas por 2+ arquivos em `@/constants`; tipos compartilhados em `@/@types/<dominio>.ts`; env pública em `@/config/env`.
- Booleanos de UI com `useBoolean` (usehooks-ts), não `useState(false)`.
- Código em inglês; UI, docs e commits (descrição) em português quando fizer sentido; mensagem de commit em inglês.

## Estrutura (App Router)

- `src/app/layout.tsx`: html, fonte (`next/font`), `globals.css`, metadata base.
- Uma pasta `(grupo)/` por fluxo com seu próprio `layout.tsx`: `(landing)/` é a landing com os planos. Checkout/retorno e configuração entram como novos grupos.
- Componentes locais de uma página ficam em `_components/` ao lado dela (pasta privada do Next, equivalente ao `-components` do TanStack Router na Brindefly). Componentes compartilhados em `src/components/<feature>/`; shadcn em `src/components/ui/`.
- Server Components por padrão; `'use client'` só onde há interação.
- `pnpm dlx shadcn@latest add <comp>` gera `import { cn } from "cn"` (o CLI não respeita o alias `@/utils/cn`). Corrigir para `@/utils/cn` e rodar `pnpm lint:check` para formatar.
- O site é **exportado estático** (`output: 'export'`) e publicado no Cloudflare Pages: nada de rotas de API (`route.ts`), server actions, middleware, `cookies()`/`headers()` nem renderização por requisição. Dados da API (ex.: o `?linkToken` da página de conexão) são lidos e buscados no navegador, em componente `'use client'` (`useSearchParams` dentro de `<Suspense>`).

## Cloudflare

- Cloudflare Pages, projeto `brindefly-partner-hml` (domínio `brindefly-hml.veforma.com.br`). O build gera a pasta `out/`, publicada pelo CI com `wrangler pages deploy`. Não existe Worker nem `wrangler.jsonc`.
- `next/image` com `images.unoptimized` (export estático não tem otimizador de imagem).
- Cabeçalhos do Pages em `public/_headers`.
- Variáveis públicas vão em `.env` (`NEXT_PUBLIC_*`, inlinadas no build). Não existem segredos de runtime: tudo que entra no build é público.

## Versionamento

- Branch `tipo/DEV-1234-descricao-curta`; commit `tipo(DEV-1234): mensagem` em inglês. Tipos: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert.
- Hooks (Husky, instalados pelo `prepare`): `pre-commit` lint-staged + typecheck · `commit-msg` valida o padrão · `pre-push` build.
- Sem `Co-Authored-By` nem rodapé de IA nos commits e PRs.

## Next.js 16

O `next dev` mantém um bloco gerenciado em `AGENTS.md` (commitado) mandando ler `node_modules/next/dist/docs/` antes de escrever código. Vale para este arquivo também: APIs e convenções mudaram em relação ao Next que você conhece.

## Regras de trabalho

- **Nunca** `git commit`, `git push`, `git merge` ou criar PR; o dev commita manualmente. Ler com `git status`/`git diff` é livre.
- Nunca rodar `wrangler pages deploy` manualmente; o deploy sai do CI.
- Toda proposta passa por auto-auditoria antes de ser apresentada: (1) cria segunda fonte da verdade? (2) decisões combinadas geram incoerência? (3) existe caminho mais simples?
