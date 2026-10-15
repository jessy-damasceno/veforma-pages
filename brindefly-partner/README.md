# brindefly-partner

Landing page e fluxo de conexão do aplicativo **Veforma** na loja de aplicativos da Brindefly: o lojista chega aqui vindo do painel, escolhe um plano, paga no Stripe e volta para configurar a integração.

Next.js (App Router) exportado como site estático (`output: 'export'`) e hospedado no **Cloudflare Pages**.

## Contexto

Fluxo ponta a ponta, APIs da Veforma, telas e pendências em [`docs/`](docs/README.md). Leia antes de implementar.

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
| `kb:generate` | Regenera `src/http/veforma-client-api` a partir de `${NEXT_PUBLIC_VEFORMA_CLIENT_API_URL}/docs/openapi.json` (lê o `.env`) |

## Estrutura

```
src/
  app/
    layout.tsx                      html lang pt-BR, fonte, globals.css, QueryProvider, Toaster
    page.tsx                        "/" → /conectar
    not-found.tsx
    (connect)/                      fluxo 02 · Aquisição
      layout.tsx                    fundo neutro do fluxo
      _lib/route-for-status.ts      regra única: status → rota
      _components/                  connection-gate, invalid-link, error-card
      conectar/                     landing com os planos ("/conectar?linkToken=")
        _components/                hero, planos, checkout (Jessy)
        ativacao/                   confirmação ("/conectar/ativacao?linkToken=", success_url do Stripe)
          _components/              progresso, etapas, falha, concluído
          _lib/activation-steps.ts  status → etapas (função pura)
  components/brand/                 selo Brindefly + Veforma
  components/providers/             QueryProvider
  components/ui/                    shadcn + sonner
  config/env.ts                     NEXT_PUBLIC_* validadas com Zod
  constants/                        connection (status, etapas, polling), plans (recursos), site
  hooks/use-connection-request.ts   hook único de status (polling opcional)
  http/api-client.ts                axios para a client-api da Veforma
  http/veforma-client-api/          Kubb (pnpm kb:generate) — não editar
  lib/kubb.ts                       wrapper do plugin react-query (query keys por recurso), igual ao panel-admin
  lib/                              zod (pt-BR), react-query
  styles/globals.css                Tailwind 4 + tokens da Veforma
  utils/                            cn, error-handler, formatters
  @types/connection.ts
```

## Versionamento

Branch por task `tipo/DEV-1234-descricao-curta`; commit `tipo(DEV-1234): mensagem` (mensagem em inglês). O hook `commit-msg` valida; `pre-commit` roda lint-staged + typecheck; `pre-push` roda o build.

O git fica na raiz do repositório (`veforma-pages`), por isso o `prepare` instala os hooks com `husky brindefly-partner/.husky`.

## Deploy (Cloudflare Pages)

- `next build` gera o site estático em `out/` (sem rotas de API, server actions nem middleware).
- CI em `.github/workflows/ci.yml` roda lint, typecheck e build em PRs e nas branches principais.
- Deploy em `.github/workflows/deploy.yml` no push para `master`: publica `out/` no projeto do Pages `brindefly-partner-hml` (`https://brindefly-hml.veforma.com.br`). Usa o environment `hml` (variables `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_VEFORMA_CLIENT_API_URL`, `NEXT_PUBLIC_BRINDEFLY_PANEL_URL` e `CLOUDFLARE_PAGES_PROJECT`) e os secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`.
