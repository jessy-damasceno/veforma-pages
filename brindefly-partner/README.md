# brindefly-partner

Landing page e fluxo de conexão do aplicativo **Veforma** na loja de aplicativos da Brindefly: o lojista chega aqui vindo do painel, escolhe um plano, paga no Stripe e volta para configurar a integração.

Next.js (App Router) exportado como site estático (`output: 'export'`) e hospedado no **Cloudflare Pages**.

## Rodar local

1. `cp .env.example .env`
2. `pnpm install`
3. `pnpm dev` → http://localhost:3000

Se o seu shell exporta variáveis do monorepo da Brindefly (`PORT=3333`, `NODE_ENV=local`), elas **vencem** o `.env` e mudam a porta do `next dev`. Rode com `env -u PORT -u NODE_ENV pnpm dev` ou remova a exportação.

## Scripts

| Script | O que faz |
|--------|-----------|
| `dev` | `next dev` |
| `build` | `next build` |
| `typecheck` | `tsc --noEmit` |
| `lint` / `lint:format` / `lint:check` | Biome (lint · format · check com fix) |

## Estrutura

```
src/
  app/
    layout.tsx            html lang pt-BR, fonte, globals.css, metadata
    not-found.tsx
    (landing)/            landing page ("/") com os planos
      layout.tsx          header/footer da landing
      page.tsx
      _components/        componentes locais da landing
  components/ui/          shadcn
  config/env.ts           variáveis públicas validadas com Zod
  constants/              valores usados por 2+ arquivos (site.ts)
  hooks/
  lib/zod.ts              Zod com mensagens pt-BR (importar daqui, não de 'zod')
  utils/cn.ts
  styles/globals.css      Tailwind 4 + tokens do shadcn
  @types/
```

Páginas futuras (retorno do checkout, configuração da integração) entram como novos route groups ao lado de `(landing)`.

## Versionamento

Branch por task `tipo/DEV-1234-descricao-curta`; commit `tipo(DEV-1234): mensagem` (mensagem em inglês). O hook `commit-msg` valida; `pre-commit` roda lint-staged + typecheck; `pre-push` roda o build.

O git fica na raiz do repositório (`veforma-pages`), por isso o `prepare` instala os hooks com `husky brindefly-partner/.husky`.

## Deploy (Cloudflare Pages)

- `next build` gera o site estático em `out/` (sem rotas de API, server actions nem middleware).
- CI em `.github/workflows/ci.yml` roda lint, typecheck e build em PRs e nas branches principais.
- Deploy em `.github/workflows/deploy.yml` no push para `master`: publica `out/` no projeto do Pages `brindefly-partner-hml` (`https://brindefly-hml.veforma.com.br`). Usa o environment `hml` (variables `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL` e `CLOUDFLARE_PAGES_PROJECT`) e os secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`.
