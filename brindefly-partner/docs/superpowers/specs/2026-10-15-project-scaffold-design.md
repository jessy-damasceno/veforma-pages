# brindefly-partner · estrutura inicial do projeto

Data: 2026-10-15 · Status: aprovado e implementado

## Objetivo

Subir a base do projeto `brindefly-partner` no repositório `vorisc/veforma-pages` para que a landing page do aplicativo Veforma (planos) possa começar imediatamente, mantendo as convenções da Brindefly dentro de um projeto Next.js.

## Contexto do produto

Loja de aplicativos da Brindefly → o lojista clica em "conectar Veforma" → cai nesta landing → escolhe um plano → a API existente gera o link de checkout do Stripe → após pagar, volta para uma tela de configuração → é redirecionado ao painel da Brindefly.

Este scaffold cobre só a landing. Checkout (retorno) e configuração entram depois como novos route groups; a integração com a API do Stripe já existe fora deste repo e será conectada quando o contexto for passado.

## Decisões travadas

| Decisão | Escolha | Por quê |
|---------|---------|---------|
| Framework | Next.js 16 (App Router, Turbopack) | Pedido do time; facilita landing + páginas de fluxo |
| Hospedagem | Cloudflare Workers via `@opennextjs/cloudflare` | Segue a infra da Brindefly. Cloudflare Pages não suporta mais Next (`next-on-pages` descontinuado) |
| Commits | `tipo(DEV-1234): mensagem` | Mesmo padrão dos repos Brindefly (ClickUp) |
| Stripe | Fora do scaffold | API já implementada; só estrutura de pastas para a landing |
| Lint/format | Biome, regras da Brindefly + domains `next`/`react` | Igual web-store/panel-admin |
| UI | Tailwind 4 + shadcn (radix, new-york), lucide | Igual web-store |
| Fonte | Poppins via `next/font` (placeholder) | Padrão Brindefly até existir identidade da Veforma |
| Cache | Sem R2/ISR, `cacheComponents` desligado | Landing estática; evita validar o adapter com cache agora |

## Estrutura

```
veforma-pages/
  README.md · .github/workflows/{ci,deploy}.yml
  brindefly-partner/
    CLAUDE.md · AGENTS.md (bloco gerenciado pelo next dev) · README.md
    package.json (versões exatas) · pnpm-workspace.yaml (onlyBuiltDependencies)
    next.config.ts · open-next.config.ts · wrangler.jsonc · components.json
    biome.json · tsconfig.json · .husky/ · .env.example · .vscode/
    public/_headers
    src/
      app/layout.tsx · not-found.tsx
      app/(landing)/{layout,page}.tsx · _components/
      components/ui/button.tsx
      config/env.ts · constants/site.ts · lib/zod.ts · utils/cn.ts
      styles/globals.css · hooks/ · @types/
```

## Particularidades

- O git fica na raiz do repo; Husky é instalado com `prepare: cd .. && husky brindefly-partner/.husky` e cada hook faz `cd brindefly-partner`.
- O CLI do shadcn gera `import { cn } from "cn"`; corrigir para `@/utils/cn` após cada `add`.
- `next dev` recria `AGENTS.md` com um bloco gerenciado; o arquivo é commitado e aponta para `CLAUDE.md`.
- CI valida `opennextjs-cloudflare build` (bundle do Worker), não só `next build`.
- Deploy no push para `master` exige `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (secrets) e `NEXT_PUBLIC_SITE_URL` (variável) no GitHub.

## Verificação feita

`pnpm lint`, `pnpm typecheck`, `pnpm build`, `opennextjs-cloudflare build`, `wrangler dev` servindo `/` (200) e `/nada` (404), `next dev` (200), `cf-typegen`, hook `commit-msg` com mensagem válida/inválida/merge.
