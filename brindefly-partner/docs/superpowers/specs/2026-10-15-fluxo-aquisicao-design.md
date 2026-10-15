# Fluxo de aquisição (landing + confirmação) · design

Data: 2026-10-15 · Status: aprovado por Rodrigo · Contexto em [`docs/01-contexto-e-fluxo.md`](../../01-contexto-e-fluxo.md), APIs em [`docs/02-apis-veforma.md`](../../02-apis-veforma.md), telas em [`docs/03-telas.md`](../../03-telas.md), decisões e pendências em [`docs/04-decisoes-e-pendencias.md`](../../04-decisoes-e-pendencias.md).

## Objetivo

Implementar o fluxo 02 (Aquisição) do protótipo do Bruno neste projeto: a landing com os planos (`/conectar`) e a tela de confirmação/ativação (`/conectar/ativacao`), falando com a client-api da Veforma direto do navegador e, ao concluir, redirecionando o brindeiro para o painel Brindefly sem botão intermediário.

## Decisões de arquitetura (travadas em 15/10)

| Decisão | Escolha | Alternativa descartada |
|---------|---------|------------------------|
| Quem chama a client-api | **Navegador**, com TanStack Query e hooks gerados (padrão do web-store) | BFF no servidor do Next (sem CORS, host privado) e híbrido |
| Rotas | **Duas**: `/conectar?linkToken=` e `/conectar/ativacao?linkToken=` | Uma rota decidindo pelo status |
| Client HTTP | **Kubb** a partir do spec vivo de hml, tipos + hooks react-query em `src/http/veforma-client-api` (config no formato do panel-admin; ver "Ajustes") | Client escrito à mão |
| Modo mock | **Não**. Desenvolvimento contra hml com Stripe em modo teste (Paulo configura) | Máquina de estados em memória |
| Retorno à Brindefly | **Redirect na mesma aba** para o `callbackUrl` devolvido pelo `complete`; sem botão "Acessar painel Veforma" | Nova aba + botão (doc v15 do Paulo) |
| Hospedagem | Mantém Cloudflare Workers (OpenNext) já validado | `output: 'export'` estático; possível depois, já que nada roda no servidor |

Consequências: o CORS da client-api para a nossa origem (hml, prod e `localhost:3000`) é bloqueante para qualquer teste (P3); o host da client-api é público (`NEXT_PUBLIC_*`), o que é aceitável porque a API é feita para o navegador.

## Rotas e estrutura de arquivos

```
src/app/
  layout.tsx                                   html, Poppins, globals.css, metadata base (já existe)
  page.tsx                                     "/" → redirect('/conectar')
  not-found.tsx                                (já existe)
  (connect)/                                   route group do fluxo 02 (substitui o (landing) atual)
    layout.tsx                                 QueryProvider + Toaster + casca visual da Veforma
    _lib/route-for-status.ts                   regra única: status → rota
    conectar/
      page.tsx                                 RSC: metadata "Planos"; monta <ConnectionGate> com as seções da landing como children
      _components/connection-gate.tsx          'use client' (dentro de <Suspense>): lê ?linkToken, consulta status, decide
      _components/invalid-link.tsx             estado sem token / 404
      _components/plans-section.tsx            'use client': GET /plans + checkout
      _components/...                          seções estáticas da landing (Jessy): hero, problema, com-a-veforma, como-funciona, feito-para-brindefly, links-e-qr
      ativacao/
        page.tsx                               RSC: metadata "Ativando sua assinatura"; <Suspense><ActivationProgress/></Suspense>
        _components/activation-progress.tsx    'use client': polling, etapas, complete, redirect
        _components/activation-steps.tsx       lista de etapas (apresentação)
        _components/activation-failed.tsx      FAILED + "Tentar de novo"
        _components/activation-completed.tsx   COMPLETED na chegada + link para o painel Brindefly
        _lib/activation-steps.ts               função pura: status → estado das 6 etapas
src/components/providers/query-provider.tsx    'use client': QueryClientProvider
src/components/ui/                             shadcn: button (existe), card, skeleton, sonner
src/config/env.ts                              + NEXT_PUBLIC_VEFORMA_CLIENT_API_URL, NEXT_PUBLIC_BRINDEFLY_PANEL_URL
src/constants/connection.ts                    statuses, etapas (copy), intervalo de polling, tempo mínimo por etapa
src/constants/plans.ts                         tabela de recursos por plano (conteúdo do front)
src/hooks/use-connection-request.ts            hook único de status (sobre o gerado), com refetchInterval opcional
src/http/api-client.ts                         axios: baseURL = env.NEXT_PUBLIC_VEFORMA_CLIENT_API_URL, sem credentials
src/http/veforma-client-api/                   Kubb (não editar)
src/lib/kubb.ts                                wrapper do plugin react-query (igual ao panel-admin)
src/lib/react-query.ts                         QueryClient (retry 0 em queries de status)
src/utils/error-handler.ts                     { code, title, message } da Veforma → { title, description }
kubb.config.ts · script kb:generate
```

O `linkToken` vive só na query string. Nunca em `localStorage`, cookie ou estado global.

### `route-for-status.ts`

```ts
export const routeForStatus = (status: ConnectionRequestStatus): '/conectar' | '/conectar/ativacao' =>
  status === 'PENDING' ? '/conectar' : '/conectar/ativacao'
```

As duas páginas usam esta função para decidir o `router.replace(route + '?linkToken=...')`. Sem token ou com 404 nenhuma página redireciona: mostra o estado "link inválido".

## Camada HTTP

- `kubb.config.ts`: igual ao do panel-admin. `input.path = \`${NEXT_PUBLIC_VEFORMA_CLIENT_API_URL}/docs/openapi.json\`` (lido do `.env`), saída `./src/http/veforma-client-api` com `barrelType: 'named'`, `format/lint: false` e `extension: { '.ts': '' }`, plugins `pluginOas()`, `pluginTs({ output: { path: 'types' } })` e `reactQueryPlugin('@/http/api-client')` de `src/lib/kubb.ts` (query keys por recurso, hooks suspense), hook `done` com `biome check`. Kubb 4.39 (a 5.x mudou o layout de pacotes).
- O spec tem `operationId`, então os hooks saem como `useFetchPlans`, `useGetConnectionRequest`, `useCreateConnectionCheckout`, `useCompleteConnectionRequest`, `useRetryConnectionRequest`.
- `client.ts`: cópia enxuta do `client.ts` do web-store (axios, `paramsSerializer.indexes: null`), **sem** `withCredentials` e sem interceptors de auth.
- Erros: todo 4xx/5xx chega como `AxiosError<{ code, title, message, errors? }>`; `error-handler.ts` devolve `{ title, description }` para toast ou card, com fallback "Não foi possível falar com a Veforma".

## Landing `/conectar`

1. `page.tsx` (RSC) exporta `metadata` e renderiza `<Suspense fallback={<LandingSkeleton/>}><ConnectionGate>{seções}</ConnectionGate></Suspense>`.
2. `ConnectionGate`: `useSearchParams().get('linkToken')`. Sem token → `<InvalidLink/>`. Com token → `useConnectionRequest(linkToken)`; carregando → skeleton; 404 → `<InvalidLink/>`; outro erro → card de erro com "Tentar de novo" (refetch); `PENDING` → renderiza `children`; qualquer outro status → `router.replace(routeForStatus(status) + ?linkToken)`.
3. `PlansSection`: `useFetchPlans()`; ordena por `priceInCents`; cada card junta `name`, `description`, `priceInCents` (formatado em BRL), `trialDays` e `limits` com a tabela de recursos de `constants/plans.ts` (por `slug`). O card `profissional` é o destaque. CTA → `useCreateConnectionCheckout` com `{ linkToken, data: { planSlug } }`; sucesso → `window.location.assign(checkoutUrl)`; erro → toast; botão desabilitado enquanto pendente.
4. As seções estáticas são RSC puras, sem dados: a Jessy trabalha nelas sem tocar na lógica. Copy da oferta (50% OFF × 14 dias) é decisão dela com produto (P5); o componente de plano mostra `trialDays` quando > 0.

## Confirmação `/conectar/ativacao`

1. `page.tsx` (RSC) exporta `metadata` e renderiza `<Suspense><ActivationProgress/></Suspense>`.
2. `ActivationProgress`:
   - Lê `linkToken`; sem token → `<InvalidLink/>`.
   - `useConnectionRequest(linkToken, { refetchInterval: 2000 enquanto status ∈ {CHECKOUT_COMPLETED, STORE_CONNECTED, PRODUCTS_SYNCED} })`.
   - `PENDING` na chegada (voltou do `cancel_url` ou abriu a URL à mão) → `router.replace('/conectar?linkToken=')`.
   - Em progresso → `<ActivationSteps states={getStepStates(status, now)}/>` com barra de progresso.
   - `PRODUCTS_SYNCED` → chama `useCompleteConnectionRequest` **uma única vez** (guarda com `useRef`); título vira "Tudo pronto! Voltando para a Brindefly…"; sucesso → `window.location.assign(callbackUrl)`. Erro no `complete` → card com a mensagem e "Tentar de novo" que repete só o `complete`.
   - `FAILED` → `<ActivationFailed reason={failureReason}/>` com "Tentar de novo" → `useRetryConnectionRequest`; sucesso → polling continua a partir do status devolvido.
   - `COMPLETED` na chegada → `<ActivationCompleted/>`: "Sua loja já está conectada à Veforma" + link para `env.NEXT_PUBLIC_BRINDEFLY_PANEL_URL`. Não chama `complete` de novo (P4 em aberto).
   - Erro de rede no polling: o intervalo continua; após 3 falhas consecutivas mostra "Tentando reconectar…" sob a lista; volta ao normal na primeira resposta.
3. `activation-steps.ts` (função pura, sem React): recebe o status e devolve as 6 etapas com `pending | active | done`, nesta ordem e com esta copy (D11: nada de "pagamento confirmado"):

   | # | Etapa | `done` quando |
   |---|-------|---------------|
   | 1 | Cartão confirmado | sempre (a página só existe depois do checkout) |
   | 2 | Conectando à sua loja Brindefly | `STORE_CONNECTED` ou posterior |
   | 3 | Adicionando o 3D às páginas de produto | junto com a 2 |
   | 4 | Sincronizando produtos e variações | `PRODUCTS_SYNCED` ou posterior |
   | 5 | Ativando a realidade aumentada | junto com a 4 |
   | 6 | Finalizando a configuração | resposta do `complete` |

   A primeira etapa não concluída fica `active` (spinner). O componente de apresentação aplica um **tempo mínimo visível por etapa** (constante, ~900 ms): quando o status pula várias etapas de uma vez, a UI conclui uma por vez, na ordem, para o brindeiro ver a sequência. A lógica de "o que o backend já concluiu" (função pura) fica separada da "o que já mostrei" (estado do componente).

## Env

| Variável | Uso | Exemplo (hml) |
|----------|-----|---------------|
| `NEXT_PUBLIC_SITE_URL` | `metadataBase` (já existe) | `https://<host-hml>` |
| `NEXT_PUBLIC_VEFORMA_CLIENT_API_URL` | `baseURL` do axios | `https://api-client-hml.veforma.com.br` |
| `NEXT_PUBLIC_BRINDEFLY_PANEL_URL` | link de saída no estado `COMPLETED` | `https://painel-hml.brindefly.com.br` (confirmar) |

Validadas em `config/env.ts` com Zod (`z.url()`). Inlinadas no build: uma build por ambiente; CI e `deploy.yml` passam as três.

## UI

shadcn `card`, `skeleton`, `sonner` (toast) além do `button`. Tokens preto e branco do protótipo em `globals.css` (`--primary: #111111`, `--muted: #f6f6f6`, `--border: #e6e6e6`, azul `#083fc9` só no selo). Layout do fluxo: fundo `muted`, card centralizado `max-w-lg` na confirmação; a landing é página longa. Selo "Brindefly + Veforma" como componente compartilhado em `src/components/brand/partnership-badge.tsx`.

## Erros e casos de borda (resumo)

| Situação | Comportamento |
|----------|---------------|
| URL sem `linkToken` | "Este link não é válido" + instrução de voltar ao painel Brindefly e clicar em Conectar |
| `GET /connections` 404 | idem |
| client-api fora do ar na landing | card de erro com "Tentar de novo" |
| checkout falha | toast com `message` da Veforma |
| `cancel_url` (desistiu na Stripe) | cai em `/conectar/ativacao` com `PENDING` → volta para a landing |
| status avança sem webhook | o próprio polling destrava (D6); nada a fazer |
| `FAILED` | card + "Tentar de novo" (`retry`) |
| `complete` falha | card + "Tentar de novo" (repete `complete`) |
| aba fechada entre `complete` e o redirect | próxima abertura vê `COMPLETED` → mensagem + link para o painel Brindefly (P4) |
| sessão do painel Brindefly expirada no callback | fora deste projeto (P6, risco aceito) |

## Fora do escopo

Painel Veforma, viewer, catálogo PDF, webhooks da Stripe além do checkout, qualquer tela do painel Brindefly, testes automatizados (convenção da Brindefly), modo mock.

## Dependências externas para testar ponta a ponta

CORS da client-api para a nossa origem (P3), Stripe em modo teste na hml (P10, Rodrigo pede ao Paulo), um `linkToken` de hml válido, e as URLs deste projeto configuradas na Veforma (P1/P2) antes de homologar.

## Ajustes na implementação (15/10, revisão final)

Desvios aceitos em relação ao texto acima:

- `QueryProvider` e `Toaster` ficam no layout raiz (`src/app/layout.tsx`), não no `(connect)/layout.tsx`; o gate vive em `src/app/(connect)/_components/`.
- **Conclusão com contagem regressiva** (teste de 15/10: o redirect imediato era rápido demais). Etapas a `ACTIVATION_STEP_MIN_VISIBLE_MS` = 1,2 s cada; ao revelar as seis, o card mostra ícone de sucesso, "Tudo pronto! A Veforma já está ativa", "O 3D já pode ser usado nas páginas dos seus produtos" e um anel que esvazia em `ACTIVATION_REDIRECT_COUNTDOWN_S` = 5 s com o número no centro e "Voltando para o painel da Brindefly…". Sem botão (decisão de Rodrigo). A navegação final (`window.location.assign(callbackUrl)`) vive só em `activation-done.tsx`.
- **`success_url` da Veforma volta para a raiz** (`/?linkToken=`): `/` repassa a query para `/conectar` e o gate manda para `/conectar/ativacao`. Dois redirects, nenhum código extra.
- **Depois de pedir o `complete`, a tela para de consultar o status** e nada vindo da consulta pode desmontar o card (um 404/410 para pedido `COMPLETED` perderia o `callbackUrl` de uso único). O `callbackUrl` vem direto do `data` da mutation.
- Páginas restauradas do back-forward cache (Voltar a partir do Stripe ou do painel) recarregam (`useReloadOnBfcacheRestore`), para o estado React não voltar congelado.
- O gate só mostra erro quando não há dado em cache (`isError && !connectionRequest`); um refetch de fundo que falha não substitui a landing.
- Cliente axios com `timeout: 15_000`.
- Em aberto com a Veforma (P9): o que `GET /connections/{linkToken}` responde para pedido `COMPLETED`, e se a verificação da Stripe na primeira consulta (D6) é síncrona. A regra "`PENDING` na ativação volta para a landing" depende disso.
- **Kubb no formato do panel-admin** (15/10): wrapper `src/lib/kubb.ts` (query keys por recurso, hooks suspense), saída em `src/http/veforma-client-api/{hooks,types}` com `barrelType: 'named'`, client em `src/http/api-client.ts` (alias `@/http/api-client`), input lido de `NEXT_PUBLIC_VEFORMA_CLIENT_API_URL` no `.env`. Hooks de query recebem o path param posicional (`useGetConnectionRequest(linkToken, options)`); mutations continuam com `mutate({ linkToken, data })`.
- **`PENDING` na ativação não volta para a landing** (resposta do Paulo: a confirmação da Stripe é assíncrona). A tela consulta também em `PENDING`, mostra a etapa 1 em andamento com o subtítulo "Confirmando seu cartão com a Stripe" e, após `CHECKOUT_CONFIRMATION_GRACE_MS` (60 s), um link "volte para os planos". `GET` de pedido `COMPLETED` responde 200 com o status, então a reentrada mostra "Sua loja já está conectada".

