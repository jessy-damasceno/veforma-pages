# Fluxo de aquisição (landing + confirmação) · plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar `/conectar` (landing com planos + checkout) e `/conectar/ativacao` (polling do status, `complete` e redirect para o painel Brindefly) conforme o spec [`docs/superpowers/specs/2026-10-15-fluxo-aquisicao-design.md`](../specs/2026-10-15-fluxo-aquisicao-design.md).

**Architecture:** Next.js App Router com páginas RSC finas e ilhas `'use client'` que falam direto com a client-api da Veforma via hooks gerados pelo Kubb (TanStack Query + axios), como no web-store da Brindefly. A regra "status → rota" e o hook de status ficam em um único lugar; a lógica das etapas da ativação é uma função pura separada da apresentação. Ao concluir, `window.location.assign(callbackUrl)` leva o brindeiro ao callback da api-rest e daí ao painel Brindefly.

**Tech Stack:** Next 16.4 · React 19 · TypeScript 6 · Tailwind 4 + shadcn (radix) · TanStack Query 5 · axios · Kubb 4.39 · sonner · lucide-react · Biome · Cloudflare Workers (OpenNext).

## Global Constraints

- Convenções em [`CLAUDE.md`](../../../CLAUDE.md): named exports (páginas/layouts com `export default`), props com `interface`, `import type`, `??` em vez de `||`, `as const` em vez de enum, sem `any`, Zod de `@/lib/zod`, `cn` de `@/utils/cn`, constantes usadas por 2+ arquivos em `@/constants`, tipos compartilhados em `@/@types`.
- Versões **exatas** no `package.json` (`.npmrc` já tem `save-exact=true`).
- **Sem commits nem `git add`**: Rodrigo commita manualmente ao fim de cada tarefa. Sem deploy manual.
- **Sem testes automatizados** (convenção Brindefly). Cada tarefa termina com `pnpm lint && pnpm typecheck && pnpm build` verdes e, quando couber, uma verificação manual descrita no passo.
- O `linkToken` só existe na query string (`?linkToken=`). Nunca em `localStorage`, cookie ou store.
- Copy em pt-BR. Nunca "pagamento confirmado" (decisão D11): usar "Cartão confirmado".
- `src/http/generated/` é gerado pelo Kubb: **não editar**; regenerar com `pnpm kb:generate`.
- O CLI do shadcn gera `import { cn } from "cn"`: corrigir para `@/utils/cn` depois de cada `add`.
- Depois de qualquer passo que rode `pnpm dlx shadcn` ou `pnpm kb:generate`, rodar `pnpm lint:check` para o Biome formatar.
- A pasta `src/app/(landing)/` do scaffold vira `src/app/(connect)/conectar/` na Tarefa 4. **Antes de começar, avisar a Jessy**: se ela já tiver arquivos em `(landing)`, mover junto.

---

### Task 1: Dependências, env, providers e componentes base

**Files:**
- Modify: `package.json` (dependências e script `kb:generate`)
- Modify: `src/config/env.ts`
- Modify: `.env.example`, `.env` (local)
- Modify: `../.github/workflows/ci.yml`, `../.github/workflows/deploy.yml`
- Create: `src/lib/react-query.ts`
- Create: `src/components/providers/query-provider.tsx`
- Create: `src/components/ui/sonner.tsx`
- Create: `src/components/ui/card.tsx`, `src/components/ui/skeleton.tsx` (shadcn)
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `env.NEXT_PUBLIC_VEFORMA_CLIENT_API_URL: string`, `env.NEXT_PUBLIC_BRINDEFLY_PANEL_URL: string` em `@/config/env`; `makeQueryClient(): QueryClient` em `@/lib/react-query`; `QueryProvider`, `Toaster`, `Card`/`CardContent`/`CardHeader`/`CardTitle`/`CardDescription`, `Skeleton`.

- [ ] **Step 1: Instalar dependências**

```bash
cd brindefly-partner
pnpm add @tanstack/react-query@5.104.3 axios@1.20.0 sonner@2.0.8
pnpm add -D @kubb/cli@4.39.3 @kubb/core@4.39.3 @kubb/plugin-oas@4.39.3 @kubb/plugin-ts@4.39.3 @kubb/plugin-react-query@4.39.3
```

Expected: `package.json` com as versões exatas acima. (Kubb 5.x mudou o layout de pacotes e não carrega esta config; ficar na linha 4.39.)

- [ ] **Step 2: Adicionar o script do Kubb em `package.json`**

Dentro de `"scripts"`, depois de `"cf-typegen"`:

```json
    "kb:generate": "kubb generate --config kubb.config.ts",
```

- [ ] **Step 3: Variáveis de ambiente**

`src/config/env.ts`:

```ts
import { z } from '@/lib/zod'

// Variáveis NEXT_PUBLIC_* precisam ser lidas estaticamente (process.env.NOME)
// para o Next inliná-las no bundle do cliente.
const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_VEFORMA_CLIENT_API_URL: z.url(),
  NEXT_PUBLIC_BRINDEFLY_PANEL_URL: z.url(),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_VEFORMA_CLIENT_API_URL:
    process.env.NEXT_PUBLIC_VEFORMA_CLIENT_API_URL,
  NEXT_PUBLIC_BRINDEFLY_PANEL_URL: process.env.NEXT_PUBLIC_BRINDEFLY_PANEL_URL,
})
```

`.env.example` (arquivo inteiro):

```bash
# URL pública deste site (sem barra no fim). Usada em metadataBase.
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# client-api da Veforma (navegador fala direto com ela). Homologação:
NEXT_PUBLIC_VEFORMA_CLIENT_API_URL=https://api-client-hml.veforma.com.br

# Painel da Brindefly, usado só como link de saída quando a conexão já terminou.
NEXT_PUBLIC_BRINDEFLY_PANEL_URL=http://localhost:5173
```

Copiar as duas linhas novas também para o `.env` local.

Em `../.github/workflows/ci.yml`, no bloco `env:` do job `check`, adicionar:

```yaml
      NEXT_PUBLIC_VEFORMA_CLIENT_API_URL: https://api-client-hml.veforma.com.br
      NEXT_PUBLIC_BRINDEFLY_PANEL_URL: http://localhost:5173
```

Em `../.github/workflows/deploy.yml`, no bloco `env:` do job `deploy`, adicionar:

```yaml
      NEXT_PUBLIC_VEFORMA_CLIENT_API_URL: ${{ vars.NEXT_PUBLIC_VEFORMA_CLIENT_API_URL }}
      NEXT_PUBLIC_BRINDEFLY_PANEL_URL: ${{ vars.NEXT_PUBLIC_BRINDEFLY_PANEL_URL }}
```

- [ ] **Step 4: QueryClient e provider**

`src/lib/react-query.ts`:

```ts
import { QueryClient } from '@tanstack/react-query'

// Um QueryClient por sessão do navegador (criado dentro do QueryProvider).
export const makeQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
      },
    },
  })
```

`src/components/providers/query-provider.tsx`:

```tsx
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'

import { makeQueryClient } from '@/lib/react-query'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

- [ ] **Step 5: Toaster (sonner) e componentes shadcn**

`src/components/ui/sonner.tsx` (escrito à mão; o do shadcn depende de `next-themes`, que não usamos):

```tsx
'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'

export function Toaster(props: ToasterProps) {
  return <Sonner theme="light" position="top-right" richColors {...props} />
}
```

```bash
pnpm dlx shadcn@latest add card skeleton -y
sed -i "s#from \"cn\"#from '@/utils/cn'#" src/components/ui/card.tsx src/components/ui/skeleton.tsx
pnpm lint:check
```

Expected: `src/components/ui/card.tsx` e `skeleton.tsx` criados, importando `cn` de `@/utils/cn`.

- [ ] **Step 6: Ligar provider e toaster no layout raiz**

`src/app/layout.tsx` (arquivo inteiro):

```tsx
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import type { ReactNode } from 'react'

import { QueryProvider } from '@/components/providers/query-provider'
import { Toaster } from '@/components/ui/sonner'
import { env } from '@/config/env'
import { SITE } from '@/constants/site'

import '@/styles/globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Verificar**

```bash
pnpm lint && pnpm typecheck && env -u PORT -u NODE_ENV pnpm build
```

Expected: três comandos sem erro; o build lista `○ /` e `○ /_not-found`.

---

### Task 2: Client HTTP e geração do Kubb

**Files:**
- Create: `src/http/client.ts`
- Create: `kubb.config.ts`
- Modify: `biome.json` (override para `src/http/generated`)
- Generate: `src/http/generated/**` (via `pnpm kb:generate`)

**Interfaces:**
- Consumes: `env.NEXT_PUBLIC_VEFORMA_CLIENT_API_URL` (Task 1).
- Produces: `client`, `RequestConfig`, `ResponseConfig`, `ResponseErrorConfig<TError> = AxiosError<TError>`, `Client` em `@/http/client`; hooks e tipos gerados em `@/http/generated`: `useFetchPlans()`, `useGetConnectionRequest({ linkToken }, { query })`, `useCreateConnectionCheckout({ mutation })` com `mutate({ linkToken, data: { planSlug } })`, `useCompleteConnectionRequest({ mutation })` com `mutate({ linkToken })`, `useRetryConnectionRequest({ mutation })` com `mutate({ linkToken })`; tipos `FetchPlans200`, `GetConnectionRequestQueryResponse`, `PlansSlugEnumKey`, `CreateConnectionCheckout201`, `CompleteConnectionRequestMutationResponse`.

- [ ] **Step 1: Client axios**

`src/http/client.ts` (molde: template axios do `@kubb/plugin-client` + `client.ts` do web-store, sem auth e sem `withCredentials`):

```ts
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'

import { env } from '@/config/env'

export type RequestConfig<TData = unknown> = {
  baseURL?: string
  url?: string
  method?: 'GET' | 'PUT' | 'PATCH' | 'POST' | 'DELETE' | 'OPTIONS' | 'HEAD'
  params?: unknown
  data?: TData | FormData
  responseType?:
    | 'arraybuffer'
    | 'blob'
    | 'document'
    | 'json'
    | 'text'
    | 'stream'
  signal?: AbortSignal
  validateStatus?: (status: number) => boolean
  headers?: AxiosRequestConfig['headers']
  paramsSerializer?: AxiosRequestConfig['paramsSerializer']
}

export type ResponseConfig<TData = unknown> = {
  data: TData
  status: number
  statusText: string
  headers: AxiosResponse['headers']
}

export type ResponseErrorConfig<TError = unknown> = AxiosError<TError>

export type Client = <TResponseData, _TError = unknown, TRequestData = unknown>(
  config: RequestConfig<TRequestData>,
) => Promise<ResponseConfig<TResponseData>>

const defaultConfig: Partial<RequestConfig> = {
  baseURL: env.NEXT_PUBLIC_VEFORMA_CLIENT_API_URL,
  paramsSerializer: {
    indexes: null,
  },
}

export const api = axios.create(defaultConfig)

export const client = async <
  TResponseData,
  TError = unknown,
  TRequestData = unknown,
>(
  config: RequestConfig<TRequestData>,
): Promise<ResponseConfig<TResponseData>> => {
  return api
    .request<TResponseData, ResponseConfig<TResponseData>>({
      ...defaultConfig,
      ...config,
      headers: {
        ...defaultConfig.headers,
        ...config.headers,
      },
    })
    .catch((error: AxiosError<TError>) => {
      throw error
    })
}

export default client
```

- [ ] **Step 2: Config do Kubb**

`kubb.config.ts` na raiz do projeto:

```ts
import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginTs } from '@kubb/plugin-ts'

export default defineConfig({
  name: 'veforma-client-api',
  root: '.',
  input: {
    path: 'https://api-client-hml.veforma.com.br/docs/openapi.json',
  },
  output: {
    clean: true,
    path: './src/http/generated',
    extension: {
      '.ts': '',
    },
  },
  hooks: {
    done: [
      'pnpm biome format --write src/http/generated',
      'pnpm biome check --write src/http/generated',
    ],
  },
  plugins: [
    pluginOas({ validate: false }),
    pluginTs(),
    pluginReactQuery({
      paramsType: 'inline',
      pathParamsType: 'object',
      suspense: false,
      client: {
        dataReturnType: 'data',
        // sem ".ts": o tsconfig não tem allowImportingTsExtensions
        importPath: '../../client',
      },
    }),
  ],
})
```

- [ ] **Step 3: Biome não linta o código gerado**

Em `biome.json`, adicionar no nível raiz (irmão de `"linter"`):

```json
  "overrides": [
    {
      "includes": ["src/http/generated/**"],
      "linter": {
        "enabled": false
      }
    }
  ],
```

- [ ] **Step 4: Gerar**

```bash
pnpm kb:generate
```

Expected: `Plugins: 3 successful` e `Generated: 22 files`. Arquivos em `src/http/generated/hooks/` incluem `useFetchPlans.ts`, `useGetConnectionRequest.ts`, `useCreateConnectionCheckout.ts`, `useCompleteConnectionRequest.ts`, `useRetryConnectionRequest.ts`; `src/http/generated/index.ts` reexporta hooks e tipos. Os imports dos hooks são `from '../../client'` (sem `.ts`).

- [ ] **Step 5: Verificar**

```bash
pnpm lint && pnpm typecheck && env -u PORT -u NODE_ENV pnpm build
```

Expected: sem erros. Se o `typecheck` reclamar de `Client` ou `ResponseErrorConfig` nos hooks, o `client.ts` do Step 1 está diferente do template; comparar os nomes exportados.

---

### Task 3: Tipos, constantes, hook de status, regra de rota e utils

**Files:**
- Create: `src/@types/connection.ts`
- Create: `src/constants/connection.ts`
- Create: `src/constants/plans.ts`
- Create: `src/hooks/use-connection-request.ts`
- Create: `src/app/(connect)/_lib/route-for-status.ts`
- Create: `src/app/(connect)/conectar/ativacao/_lib/activation-steps.ts`
- Create: `src/utils/error-handler.ts`
- Create: `src/utils/formatters.ts`
- Delete: `src/hooks/.gitkeep`, `src/@types/.gitkeep`

**Interfaces:**
- Consumes: hooks/tipos gerados (Task 2).
- Produces:
  - `ConnectionRequest`, `ConnectionRequestStatus` (`@/@types/connection`)
  - `IN_PROGRESS_STATUSES`, `CONNECTION_POLLING_INTERVAL_MS = 2000`, `ACTIVATION_STEP_MIN_VISIBLE_MS = 900`, `CONNECTION_POLLING_FAILURES_BEFORE_WARNING = 3`, `LINK_TOKEN_PARAM = 'linkToken'`, `ACTIVATION_STEPS` (`@/constants/connection`)
  - `PLAN_FEATURES`, `FEATURED_PLAN_SLUG` (`@/constants/plans`)
  - `useConnectionRequest(linkToken: string | null, { poll?: boolean })` → `{ ...query, connectionRequest, isNotFound, consecutiveFailures }`
  - `CONNECT_ROUTES`, `routeForStatus(status)`, `withLinkToken(route, linkToken)`
  - `countStepsDone(status, completeDone)`, `getActivationSteps(doneCount)`, `ActivationStep`, `ActivationStepState`
  - `errorHandler(error: unknown): HandledError`
  - `formatCurrencyFromCents(cents)`, `formatLimit(value: number | null)`

- [ ] **Step 1: Tipos**

`src/@types/connection.ts`:

```ts
import type { GetConnectionRequestQueryResponse } from '@/http/generated'

export type ConnectionRequest =
  GetConnectionRequestQueryResponse['connectionRequest']

export type ConnectionRequestStatus = ConnectionRequest['status']
```

- [ ] **Step 2: Constantes da conexão e das etapas**

`src/constants/connection.ts`:

```ts
import type { ConnectionRequestStatus } from '@/@types/connection'

export const CONNECTION_REQUEST_STATUS = {
  PENDING: 'PENDING',
  CHECKOUT_COMPLETED: 'CHECKOUT_COMPLETED',
  STORE_CONNECTED: 'STORE_CONNECTED',
  PRODUCTS_SYNCED: 'PRODUCTS_SYNCED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const satisfies Record<ConnectionRequestStatus, ConnectionRequestStatus>

/** A Veforma ainda está trabalhando: a tela de ativação continua consultando. */
export const IN_PROGRESS_STATUSES: readonly ConnectionRequestStatus[] = [
  'CHECKOUT_COMPLETED',
  'STORE_CONNECTED',
  'PRODUCTS_SYNCED',
]

export const CONNECTION_POLLING_INTERVAL_MS = 2000
export const CONNECTION_POLLING_FAILURES_BEFORE_WARNING = 3
export const ACTIVATION_STEP_MIN_VISIBLE_MS = 900
export const ACTIVATION_REDIRECT_DELAY_MS = 600

export const LINK_TOKEN_PARAM = 'linkToken'

export interface ActivationStepDefinition {
  id: string
  label: string
  /** Status da API a partir do qual a etapa conta como concluída. */
  doneAt: ConnectionRequestStatus
}

// Etapas do protótipo do Bruno. As cosméticas (3 e 5) acompanham a real anterior.
// Copy conforme D11: "Cartão confirmado", nunca "pagamento confirmado".
export const ACTIVATION_STEPS: readonly ActivationStepDefinition[] = [
  { id: 'card', label: 'Cartão confirmado', doneAt: 'CHECKOUT_COMPLETED' },
  {
    id: 'store',
    label: 'Conectando à sua loja Brindefly',
    doneAt: 'STORE_CONNECTED',
  },
  {
    id: 'viewer',
    label: 'Adicionando o 3D às páginas de produto',
    doneAt: 'STORE_CONNECTED',
  },
  {
    id: 'products',
    label: 'Sincronizando produtos e variações',
    doneAt: 'PRODUCTS_SYNCED',
  },
  {
    id: 'ar',
    label: 'Ativando a realidade aumentada',
    doneAt: 'PRODUCTS_SYNCED',
  },
  { id: 'finish', label: 'Finalizando a configuração', doneAt: 'COMPLETED' },
]
```

- [ ] **Step 3: Tabela de recursos dos planos (conteúdo do front)**

`src/constants/plans.ts`:

```ts
import type { PlansSlugEnumKey } from '@/http/generated'

type PlanLimitKey = 'monthlyViews' | 'modelRequests' | 'qrCodeLinks'

export type PlanFeature =
  | {
      kind: 'flag'
      label: string
      note?: string
      availability: Record<PlansSlugEnumKey, boolean>
    }
  | {
      kind: 'limit'
      label: string
      note?: string
      limit: PlanLimitKey
    }

const ALL_PLANS: Record<PlansSlugEnumKey, boolean> = {
  essencial: true,
  basico: true,
  profissional: true,
}

// Ordem e textos do protótipo (pages/02-fluxo-aquisicao/1-pagina-de-vendas.html).
// Valores numéricos vêm de GET /plans (limits); aqui só o que é conteúdo.
export const PLAN_FEATURES: readonly PlanFeature[] = [
  { kind: 'flag', label: '3D integrado à Brindefly', availability: ALL_PLANS },
  { kind: 'limit', label: 'Modelos disponíveis', limit: 'modelRequests' },
  {
    kind: 'limit',
    label: 'Views por mês',
    limit: 'monthlyViews',
    note: 'R$ 0,02 por view extra',
  },
  { kind: 'flag', label: 'Métricas de engajamento', availability: ALL_PLANS },
  { kind: 'flag', label: 'Realidade aumentada', availability: ALL_PLANS },
  {
    kind: 'flag',
    label: 'Links e QR Codes para campanhas',
    availability: { essencial: false, basico: true, profissional: true },
  },
  {
    kind: 'flag',
    label: 'Visualização por tipo de impressão',
    availability: { essencial: false, basico: false, profissional: true },
  },
  {
    kind: 'flag',
    label: 'Lista de prioridade para novos modelos',
    availability: { essencial: false, basico: false, profissional: true },
  },
]

export const FEATURED_PLAN_SLUG: PlansSlugEnumKey = 'profissional'
```

- [ ] **Step 4: Utils**

`src/utils/error-handler.ts`:

```ts
import type { ResponseErrorConfig } from '@/http/client'

interface VeformaApiError {
  code: string
  title: string
  message: string
}

export interface HandledError {
  code: string
  title: string
  description: string
}

const NETWORK_ERROR: HandledError = {
  code: 'NETWORK/UNAVAILABLE',
  title: 'Não foi possível falar com a Veforma',
  description: 'Verifique sua conexão e tente de novo.',
}

export function errorHandler(error: unknown): HandledError {
  const data = (error as ResponseErrorConfig<VeformaApiError> | undefined)
    ?.response?.data

  if (data?.code) {
    return { code: data.code, title: data.title, description: data.message }
  }

  return NETWORK_ERROR
}
```

`src/utils/formatters.ts`:

```ts
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('pt-BR')

export const formatCurrencyFromCents = (cents: number): string =>
  currencyFormatter.format(cents / 100)

/** `null` em limits significa ilimitado. */
export const formatLimit = (value: number | null): string =>
  value === null ? 'Ilimitado' : numberFormatter.format(value)
```

- [ ] **Step 5: Regra de rota por status**

`src/app/(connect)/_lib/route-for-status.ts`:

```ts
import type { ConnectionRequestStatus } from '@/@types/connection'
import { LINK_TOKEN_PARAM } from '@/constants/connection'

export const CONNECT_ROUTES = {
  landing: '/conectar',
  activation: '/conectar/ativacao',
} as const

export type ConnectRoute = (typeof CONNECT_ROUTES)[keyof typeof CONNECT_ROUTES]

/** Única regra de roteamento do fluxo: PENDING fica na landing, o resto vai para a ativação. */
export const routeForStatus = (status: ConnectionRequestStatus): ConnectRoute =>
  status === 'PENDING' ? CONNECT_ROUTES.landing : CONNECT_ROUTES.activation

export const withLinkToken = (route: ConnectRoute, linkToken: string): string =>
  `${route}?${LINK_TOKEN_PARAM}=${encodeURIComponent(linkToken)}`
```

- [ ] **Step 6: Hook único de status**

`src/hooks/use-connection-request.ts`:

```ts
import { useRef } from 'react'

import {
  CONNECTION_POLLING_INTERVAL_MS,
  IN_PROGRESS_STATUSES,
} from '@/constants/connection'
import { useGetConnectionRequest } from '@/http/generated'

interface UseConnectionRequestOptions {
  /** Consulta a cada 2 s enquanto o status estiver em andamento. */
  poll?: boolean
}

export function useConnectionRequest(
  linkToken: string | null,
  { poll = false }: UseConnectionRequestOptions = {},
) {
  const query = useGetConnectionRequest(
    { linkToken: linkToken ?? undefined },
    {
      query: {
        staleTime: 0,
        refetchIntervalInBackground: true,
        refetchInterval: (current) => {
          if (!poll) return false

          const status = current.state.data?.connectionRequest.status

          return status && IN_PROGRESS_STATUSES.includes(status)
            ? CONNECTION_POLLING_INTERVAL_MS
            : false
        },
      },
    },
  )

  // Falhas seguidas desde a última resposta boa (para o aviso "tentando reconectar").
  const lastSuccessRef = useRef({ dataUpdatedAt: 0, errorUpdateCount: 0 })

  if (query.dataUpdatedAt !== lastSuccessRef.current.dataUpdatedAt) {
    lastSuccessRef.current = {
      dataUpdatedAt: query.dataUpdatedAt,
      errorUpdateCount: query.errorUpdateCount,
    }
  }

  const consecutiveFailures =
    query.errorUpdateCount - lastSuccessRef.current.errorUpdateCount

  return {
    ...query,
    connectionRequest: query.data?.connectionRequest ?? null,
    isNotFound: query.error?.response?.status === 404,
    consecutiveFailures,
  }
}
```

- [ ] **Step 7: Lógica pura das etapas**

`src/app/(connect)/conectar/ativacao/_lib/activation-steps.ts`:

```ts
import type { ConnectionRequestStatus } from '@/@types/connection'
import { ACTIVATION_STEPS } from '@/constants/connection'

export type ActivationStepState = 'pending' | 'active' | 'done'

export interface ActivationStep {
  id: string
  label: string
  state: ActivationStepState
}

const STATUS_RANK: Record<ConnectionRequestStatus, number> = {
  FAILED: -1,
  PENDING: 0,
  CHECKOUT_COMPLETED: 1,
  STORE_CONNECTED: 2,
  PRODUCTS_SYNCED: 3,
  COMPLETED: 4,
}

/**
 * Quantas etapas o backend já concluiu. A última ("Finalizando") só conta
 * quando o `complete` respondeu, porque COMPLETED sem callbackUrl é reentrada.
 */
export const countStepsDone = (
  status: ConnectionRequestStatus,
  completeDone: boolean,
): number => {
  if (completeDone) return ACTIVATION_STEPS.length

  const rank = STATUS_RANK[status]

  return ACTIVATION_STEPS.filter(
    (step) => step.doneAt !== 'COMPLETED' && STATUS_RANK[step.doneAt] <= rank,
  ).length
}

/** Primeiras `doneCount` etapas concluídas, a seguinte ativa, o resto pendente. */
export const getActivationSteps = (doneCount: number): ActivationStep[] =>
  ACTIVATION_STEPS.map((step, index) => ({
    id: step.id,
    label: step.label,
    state:
      index < doneCount ? 'done' : index === doneCount ? 'active' : 'pending',
  }))
```

Conferência à mão (sem teste automatizado): `countStepsDone('CHECKOUT_COMPLETED', false) === 1`, `('STORE_CONNECTED', false) === 3`, `('PRODUCTS_SYNCED', false) === 5`, `('COMPLETED', true) === 6`, `('FAILED', false) === 0`; `getActivationSteps(3)` → done, done, done, active, pending, pending; `getActivationSteps(6)` → tudo done.

- [ ] **Step 8: Remover os `.gitkeep` que viraram pastas reais e verificar**

```bash
rm -f src/hooks/.gitkeep src/@types/.gitkeep
pnpm lint && pnpm typecheck
```

Expected: sem erros. (`activation-steps.ts` fica numa pasta `_lib` que ainda não tem página; o Next ignora pastas com `_`.)

---

### Task 4: Estrutura de rotas, gate por status e componentes compartilhados do fluxo

**Files:**
- Move: `src/app/(landing)/layout.tsx` → `src/app/(connect)/layout.tsx`; `src/app/(landing)/page.tsx` → `src/app/(connect)/conectar/page.tsx`; `src/app/(landing)/_components/` → `src/app/(connect)/conectar/_components/`
- Create: `src/app/page.tsx`
- Create: `src/app/(connect)/_components/invalid-link.tsx`, `error-card.tsx`, `connection-gate.tsx`
- Create: `src/components/brand/partnership-badge.tsx`
- Create: `public/brand/brindefly-simbolo-white.png`, `public/brand/veforma-simbolo-white.svg`
- Create: `src/app/(connect)/conectar/_components/landing-skeleton.tsx`, `hero-section.tsx`

**Interfaces:**
- Consumes: `useConnectionRequest`, `routeForStatus`, `withLinkToken`, `CONNECT_ROUTES`, `LINK_TOKEN_PARAM`, `errorHandler`, `env`, `Card`, `Button`, `Skeleton`.
- Produces: `InvalidLink`, `ErrorCard({ title, description, onRetry, isRetrying? })`, `ConnectionGate({ children, fallback })`, `PartnershipBadge`, `LandingSkeleton`, `HeroSection`.

- [ ] **Step 1: Mover o route group**

```bash
mkdir -p 'src/app/(connect)/conectar'
mv 'src/app/(landing)/layout.tsx' 'src/app/(connect)/layout.tsx'
mv 'src/app/(landing)/page.tsx' 'src/app/(connect)/conectar/page.tsx'
mv 'src/app/(landing)/_components' 'src/app/(connect)/conectar/_components'
rmdir 'src/app/(landing)'
rm -f 'src/app/(connect)/conectar/_components/.gitkeep'
```

- [ ] **Step 2: Layout do fluxo**

`src/app/(connect)/layout.tsx` (arquivo inteiro):

```tsx
import type { ReactNode } from 'react'

interface ConnectLayoutProps {
  children: ReactNode
}

// Casca das páginas de aquisição (landing e ativação): fundo neutro da Veforma.
export default function ConnectLayout({ children }: ConnectLayoutProps) {
  return <main className="flex flex-1 flex-col bg-muted">{children}</main>
}
```

- [ ] **Step 3: Raiz redireciona para a landing**

`src/app/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

import { CONNECT_ROUTES } from '@/app/(connect)/_lib/route-for-status'

export default function HomePage() {
  redirect(CONNECT_ROUTES.landing)
}
```

- [ ] **Step 4: Logos e selo de parceria**

```bash
mkdir -p public/brand
curl -sL https://vorisc.github.io/veforma-screens/assets/logos/brindefly-simbolo-white.png -o public/brand/brindefly-simbolo-white.png
curl -sL https://vorisc.github.io/veforma-screens/assets/logos/veforma-simbolo-white.svg -o public/brand/veforma-simbolo-white.svg
file public/brand/*
```

Expected: `PNG image data` e `SVG Scalable Vector Graphics image`.

`src/components/brand/partnership-badge.tsx`:

```tsx
import { Plus } from 'lucide-react'
import Image from 'next/image'

// Selo "Brindefly + Veforma" do protótipo. `unoptimized`: sem binding de imagens no Workers.
export function PartnershipBadge() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="grid size-14 place-items-center rounded-full bg-brindefly">
        <Image
          src="/brand/brindefly-simbolo-white.png"
          alt="Brindefly"
          width={28}
          height={28}
          className="h-7 w-auto"
          unoptimized
        />
      </div>
      <Plus className="size-5 text-muted-foreground" aria-hidden />
      <div className="grid size-14 place-items-center rounded-full bg-primary">
        <Image
          src="/brand/veforma-simbolo-white.svg"
          alt="Veforma"
          width={28}
          height={28}
          className="size-7"
          unoptimized
        />
      </div>
    </div>
  )
}
```

A cor `bg-brindefly` entra no `globals.css` na Task 8; até lá o Tailwind ignora a classe (sem erro).

- [ ] **Step 5: Estados compartilhados: link inválido e erro**

`src/app/(connect)/_components/invalid-link.tsx`:

```tsx
import { PartnershipBadge } from '@/components/brand/partnership-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { env } from '@/config/env'

export function InvalidLink() {
  return (
    <div className="grid flex-1 place-items-center px-6 py-12">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          <PartnershipBadge />
          <div>
            <h1 className="font-bold text-xl tracking-tight">
              Este link não é válido
            </h1>
            <p className="mt-1.5 text-muted-foreground text-sm">
              Volte ao painel da Brindefly e clique em Conectar na página do
              aplicativo Veforma.
            </p>
          </div>
          <Button asChild size="lg" className="w-full">
            <a href={env.NEXT_PUBLIC_BRINDEFLY_PANEL_URL}>
              Ir para o painel Brindefly
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

`src/app/(connect)/_components/error-card.tsx`:

```tsx
import { LoaderCircle, TriangleAlert } from 'lucide-react'

import { PartnershipBadge } from '@/components/brand/partnership-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorCardProps {
  title: string
  description: string
  onRetry: () => void
  isRetrying?: boolean
}

export function ErrorCard({
  title,
  description,
  onRetry,
  isRetrying = false,
}: ErrorCardProps) {
  return (
    <div className="grid flex-1 place-items-center px-6 py-12">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          <PartnershipBadge />
          <div className="flex flex-col items-center gap-2">
            <TriangleAlert className="size-6 text-destructive" aria-hidden />
            <h1 className="font-bold text-xl tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          <Button
            size="lg"
            className="w-full"
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying && <LoaderCircle className="animate-spin" aria-hidden />}
            Tentar de novo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 6: Gate da landing**

`src/app/(connect)/_components/connection-gate.tsx`:

```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'

import { ErrorCard } from '@/app/(connect)/_components/error-card'
import { InvalidLink } from '@/app/(connect)/_components/invalid-link'
import {
  CONNECT_ROUTES,
  routeForStatus,
  withLinkToken,
} from '@/app/(connect)/_lib/route-for-status'
import { LINK_TOKEN_PARAM } from '@/constants/connection'
import { useConnectionRequest } from '@/hooks/use-connection-request'
import { errorHandler } from '@/utils/error-handler'

interface ConnectionGateProps {
  children: ReactNode
  /** Mostrado enquanto consulta o status ou enquanto redireciona. */
  fallback: ReactNode
}

// Só deixa a landing aparecer com o pedido PENDING. Qualquer outro status vai
// para a ativação; sem token ou 404 mostra "link inválido" sem redirecionar.
export function ConnectionGate({ children, fallback }: ConnectionGateProps) {
  const router = useRouter()
  const linkToken = useSearchParams().get(LINK_TOKEN_PARAM)

  const {
    connectionRequest,
    isPending,
    isError,
    error,
    isNotFound,
    isFetching,
    refetch,
  } = useConnectionRequest(linkToken)

  const status = connectionRequest?.status
  const targetRoute = status ? routeForStatus(status) : null
  const shouldRedirect = targetRoute !== null && targetRoute !== CONNECT_ROUTES.landing

  useEffect(() => {
    if (shouldRedirect && targetRoute && linkToken) {
      router.replace(withLinkToken(targetRoute, linkToken))
    }
  }, [shouldRedirect, targetRoute, linkToken, router])

  if (!linkToken || isNotFound) return <InvalidLink />

  if (isPending || shouldRedirect) return <>{fallback}</>

  if (isError) {
    const { title, description } = errorHandler(error)

    return (
      <ErrorCard
        title={title}
        description={description}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    )
  }

  return <>{children}</>
}
```

- [ ] **Step 7: Skeleton e hero da landing**

`src/app/(connect)/conectar/_components/landing-skeleton.tsx`:

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function LandingSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
      <Skeleton className="mx-auto h-10 w-3/4 max-w-xl" />
      <Skeleton className="mx-auto h-5 w-1/2 max-w-md" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}
```

`src/app/(connect)/conectar/_components/hero-section.tsx` (ponto de partida para a Jessy; copy do protótipo):

```tsx
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 pt-16 pb-8 text-center">
      <span className="rounded-full border bg-background px-3 py-1 font-medium text-xs">
        Brindefly + Veforma 3D
      </span>
      <h1 className="font-bold text-4xl tracking-tight">
        Seu cliente visualiza o resultado antes de pedir o orçamento
      </h1>
      <p className="max-w-xl text-muted-foreground">
        A Veforma adiciona um visualizador 3D à sua loja Brindefly para o
        cliente escolher cores, tipos de impressão e aplicar a própria logo no
        produto.
      </p>
      <Button asChild size="lg">
        <a href="#planos">Ver planos</a>
      </Button>
    </section>
  )
}
```

- [ ] **Step 8: Página da landing com o gate**

`src/app/(connect)/conectar/page.tsx` (arquivo inteiro; `PlansSection` chega na Task 5, por enquanto fica só o hero):

```tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ConnectionGate } from '@/app/(connect)/_components/connection-gate'

import { HeroSection } from './_components/hero-section'
import { LandingSkeleton } from './_components/landing-skeleton'

export const metadata: Metadata = {
  title: 'Planos',
}

// useSearchParams dentro do gate exige Suspense na prerenderização.
export default function ConnectPage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <ConnectionGate fallback={<LandingSkeleton />}>
        <HeroSection />
      </ConnectionGate>
    </Suspense>
  )
}
```

- [ ] **Step 9: Verificar**

```bash
pnpm lint && pnpm typecheck && env -u PORT -u NODE_ENV pnpm build
```

Expected: build lista `○ /`, `○ /conectar`, `○ /_not-found`.

Verificação manual:

```bash
(env -u PORT -u NODE_ENV pnpm dev --port 3005 > /dev/null 2>&1 &) ; sleep 8
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:3005/
curl -s http://localhost:3005/conectar | grep -o 'Este link não é válido'
pkill -f 'next dev --port 3005'
```

Expected: `307 http://localhost:3005/conectar` e o texto `Este link não é válido`. Com `?linkToken=abc` no navegador: skeleton e depois "link inválido" (404 da Veforma) ou o card de erro (CORS ainda não liberado, pendência P3).

---

### Task 5: Planos e checkout

**Files:**
- Create: `src/app/(connect)/conectar/_components/plan-card.tsx`
- Create: `src/app/(connect)/conectar/_components/plans-section.tsx`
- Modify: `src/app/(connect)/conectar/page.tsx`

**Interfaces:**
- Consumes: `useFetchPlans`, `useCreateConnectionCheckout`, `FetchPlans200`, `PlansSlugEnumKey` (Task 2); `PLAN_FEATURES`, `FEATURED_PLAN_SLUG`, `formatCurrencyFromCents`, `formatLimit`, `errorHandler`, `LINK_TOKEN_PARAM` (Task 3).
- Produces: `PlanCard({ plan, featured, onSelect, isSelecting, disabled })`, `PlansSection`.

- [ ] **Step 1: Card do plano**

`src/app/(connect)/conectar/_components/plan-card.tsx`:

```tsx
import { Check, LoaderCircle, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PLAN_FEATURES } from '@/constants/plans'
import type { FetchPlans200 } from '@/http/generated'
import { cn } from '@/utils/cn'
import { formatCurrencyFromCents, formatLimit } from '@/utils/formatters'

export type Plan = FetchPlans200['plans'][number]

interface PlanCardProps {
  plan: Plan
  featured: boolean
  onSelect: (plan: Plan) => void
  isSelecting: boolean
  disabled: boolean
}

export function PlanCard({
  plan,
  featured,
  onSelect,
  isSelecting,
  disabled,
}: PlanCardProps) {
  return (
    <Card className={cn('flex flex-col', featured && 'border-foreground')}>
      <CardContent className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{plan.name}</h3>
            {featured && (
              <span className="rounded-full bg-primary px-2 py-0.5 font-medium text-[11px] text-primary-foreground">
                Mais escolhido
              </span>
            )}
          </div>
          {plan.description && (
            <p className="mt-1 text-muted-foreground text-sm">
              {plan.description}
            </p>
          )}
        </div>

        <div>
          <p className="font-bold text-3xl tracking-tight">
            {formatCurrencyFromCents(plan.priceInCents)}
            <span className="font-normal text-base text-muted-foreground">
              /mês
            </span>
          </p>
          {plan.trialDays > 0 && (
            <p className="mt-1 text-muted-foreground text-sm">
              {plan.trialDays} dias grátis. Nada é cobrado agora.
            </p>
          )}
        </div>

        <ul className="flex flex-col gap-2.5 text-sm">
          {PLAN_FEATURES.map((feature) => {
            const value =
              feature.kind === 'limit'
                ? formatLimit(plan.limits[feature.limit])
                : feature.availability[plan.slug]

            if (value === false) {
              return (
                <li
                  key={feature.label}
                  className="flex items-start gap-2.5 text-muted-foreground"
                >
                  <X className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span className="line-through">{feature.label}</span>
                  <span className="sr-only">(não incluso)</span>
                </li>
              )
            }

            return (
              <li key={feature.label} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p>{feature.label}</p>
                    {typeof value === 'string' && (
                      <span className="ml-auto shrink-0 rounded-md border bg-secondary px-2 py-0.5 font-medium text-xs">
                        {value}
                      </span>
                    )}
                  </div>
                  {feature.note && (
                    <p className="mt-0.5 text-muted-foreground text-xs">
                      {feature.note}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        <Button
          size="lg"
          className="mt-auto w-full"
          variant={featured ? 'default' : 'outline'}
          onClick={() => onSelect(plan)}
          disabled={disabled}
        >
          {isSelecting && <LoaderCircle className="animate-spin" aria-hidden />}
          Assinar {plan.name}
        </Button>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Seção de planos com checkout**

`src/app/(connect)/conectar/_components/plans-section.tsx`:

```tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { toast } from 'sonner'

import { ErrorCard } from '@/app/(connect)/_components/error-card'
import { Skeleton } from '@/components/ui/skeleton'
import { LINK_TOKEN_PARAM } from '@/constants/connection'
import { FEATURED_PLAN_SLUG } from '@/constants/plans'
import { useCreateConnectionCheckout, useFetchPlans } from '@/http/generated'
import { errorHandler } from '@/utils/error-handler'

import { type Plan, PlanCard } from './plan-card'

export function PlansSection() {
  const linkToken = useSearchParams().get(LINK_TOKEN_PARAM)

  const { data, isPending, isError, error, isFetching, refetch } =
    useFetchPlans()

  const {
    mutate: createCheckout,
    isPending: isCreatingCheckout,
    variables,
  } = useCreateConnectionCheckout({
    mutation: {
      onSuccess: ({ checkoutUrl }) => {
        // Navegação de aba inteira para o Stripe Checkout.
        window.location.assign(checkoutUrl)
      },
      onError: (mutationError) => {
        const { title, description } = errorHandler(mutationError)
        toast.error(title, { description })
      },
    },
  })

  const plans = useMemo(
    () =>
      [...(data?.plans ?? [])].sort((a, b) => a.priceInCents - b.priceInCents),
    [data],
  )

  function handleSelectPlan(plan: Plan) {
    if (!linkToken) return

    createCheckout({ linkToken, data: { planSlug: plan.slug } })
  }

  return (
    <section
      id="planos"
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16"
    >
      <div className="text-center">
        <h2 className="font-bold text-3xl tracking-tight">
          Escolha o plano ideal para sua loja
        </h2>
        <p className="mt-2 text-muted-foreground">
          Assine com o cartão e comece a usar hoje.
        </p>
      </div>

      {isPending && (
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      )}

      {isError && (
        <ErrorCard
          title={errorHandler(error).title}
          description={errorHandler(error).description}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      )}

      {!isPending && !isError && (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              featured={plan.slug === FEATURED_PLAN_SLUG}
              onSelect={handleSelectPlan}
              isSelecting={
                isCreatingCheckout && variables?.data.planSlug === plan.slug
              }
              disabled={isCreatingCheckout}
            />
          ))}
        </div>
      )}
    </section>
  )
}
```

O texto "Assine com o cartão e comece a usar hoje." é provisório: a oferta final (50% OFF × 14 dias, pendência P5) é da Jessy com produto.

- [ ] **Step 3: Montar na página**

Em `src/app/(connect)/conectar/page.tsx`, importar e renderizar a seção depois do hero:

```tsx
import { PlansSection } from './_components/plans-section'
```

```tsx
      <ConnectionGate fallback={<LandingSkeleton />}>
        <HeroSection />
        <PlansSection />
      </ConnectionGate>
```

- [ ] **Step 4: Verificar**

```bash
pnpm lint && pnpm typecheck && env -u PORT -u NODE_ENV pnpm build
```

Expected: sem erros. Manual (quando a Veforma liberar CORS e um `linkToken` de hml): abrir `/conectar?linkToken=<token>`, ver os três planos ordenados por preço com "Mais escolhido" no Profissional, clicar em "Assinar" e cair no Stripe Checkout em modo teste. Com erro da API, toast com `title`/`message` da Veforma.

---

### Task 6: Tela de ativação

**Files:**
- Create: `src/app/(connect)/conectar/ativacao/page.tsx`
- Create: `src/app/(connect)/conectar/ativacao/_components/activation-card.tsx`
- Create: `src/app/(connect)/conectar/ativacao/_components/activation-step-list.tsx`
- Create: `src/app/(connect)/conectar/ativacao/_components/activation-failed.tsx`
- Create: `src/app/(connect)/conectar/ativacao/_components/activation-completed.tsx`
- Create: `src/app/(connect)/conectar/ativacao/_components/activation-progress.tsx`

**Interfaces:**
- Consumes: `useConnectionRequest`, `useCompleteConnectionRequest`, `useRetryConnectionRequest`, `countStepsDone`, `getActivationSteps`, `ACTIVATION_STEPS`, `ACTIVATION_STEP_MIN_VISIBLE_MS`, `ACTIVATION_REDIRECT_DELAY_MS`, `CONNECTION_POLLING_FAILURES_BEFORE_WARNING`, `CONNECT_ROUTES`, `withLinkToken`, `LINK_TOKEN_PARAM`, `InvalidLink`, `ErrorCard`, `PartnershipBadge`, `errorHandler`, `env`.
- Produces: `ActivationProgress` (orquestra), `ActivationCard({ doneCount, callbackUrl, isReconnecting })`, `ActivationStepList({ steps })`, `ActivationFailed({ reason, onRetry, isRetrying })`, `ActivationCompleted`.

- [ ] **Step 1: Lista de etapas (apresentação)**

`src/app/(connect)/conectar/ativacao/_components/activation-step-list.tsx`:

```tsx
import { Check, LoaderCircle } from 'lucide-react'

import { cn } from '@/utils/cn'

import type { ActivationStep } from '../_lib/activation-steps'

interface ActivationStepListProps {
  steps: ActivationStep[]
}

export function ActivationStepList({ steps }: ActivationStepListProps) {
  return (
    <ol className="space-y-1 rounded-xl border p-2">
      {steps.map((step) => (
        <li
          key={step.id}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5',
            step.state === 'active' && 'bg-secondary',
          )}
        >
          <span
            className={cn(
              'grid size-6 shrink-0 place-items-center rounded-full',
              step.state === 'pending' && 'border border-input bg-background',
              step.state === 'done' && 'bg-primary text-primary-foreground',
            )}
          >
            {step.state === 'active' && (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            )}
            {step.state === 'done' && (
              <Check className="size-3.5" aria-hidden />
            )}
          </span>
          <span
            className={cn(
              'text-sm',
              step.state === 'pending' && 'text-muted-foreground',
            )}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  )
}
```

- [ ] **Step 2: Card da ativação (revela uma etapa por vez e faz o redirect)**

`src/app/(connect)/conectar/ativacao/_components/activation-card.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'

import { PartnershipBadge } from '@/components/brand/partnership-badge'
import { Card } from '@/components/ui/card'
import {
  ACTIVATION_REDIRECT_DELAY_MS,
  ACTIVATION_STEP_MIN_VISIBLE_MS,
  ACTIVATION_STEPS,
} from '@/constants/connection'

import { getActivationSteps } from '../_lib/activation-steps'
import { ActivationStepList } from './activation-step-list'

interface ActivationCardProps {
  /** Etapas que o backend já concluiu (função pura em _lib). */
  doneCount: number
  /** Quando preenchido, a tela termina a animação e navega para cá. */
  callbackUrl: string | null
  isReconnecting: boolean
}

export function ActivationCard({
  doneCount,
  callbackUrl,
  isReconnecting,
}: ActivationCardProps) {
  // "O que já mostrei" avança uma etapa por vez até alcançar "o que o backend concluiu".
  const [revealedCount, setRevealedCount] = useState(0)

  useEffect(() => {
    if (revealedCount >= doneCount) return

    const timer = setTimeout(
      () => setRevealedCount((count) => count + 1),
      ACTIVATION_STEP_MIN_VISIBLE_MS,
    )

    return () => clearTimeout(timer)
  }, [revealedCount, doneCount])

  const total = ACTIVATION_STEPS.length
  const isFinished = callbackUrl !== null && revealedCount >= total

  useEffect(() => {
    if (!isFinished || !callbackUrl) return

    const timer = setTimeout(() => {
      // Navegação de aba inteira: o callback da api-rest precisa do cookie
      // de sessão do painel Brindefly, que só vai em navegação, não em fetch.
      window.location.assign(callbackUrl)
    }, ACTIVATION_REDIRECT_DELAY_MS)

    return () => clearTimeout(timer)
  }, [isFinished, callbackUrl])

  const steps = getActivationSteps(revealedCount)
  const progress = (revealedCount / total) * 100

  return (
    <Card className="w-full max-w-lg overflow-hidden">
      <div className="h-1.5 bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-8">
        <PartnershipBadge />

        <div className="mt-6 text-center">
          <h1 className="font-bold text-xl tracking-tight">
            {isFinished
              ? 'Tudo pronto! A Veforma já está ativa'
              : 'Preparando a Veforma na sua loja'}
          </h1>
          <p className="mt-1.5 text-muted-foreground text-sm">
            {isFinished
              ? 'Voltando para o painel da Brindefly…'
              : 'Não feche esta página. Isso leva só alguns instantes.'}
          </p>
        </div>

        <div className="mt-8">
          <ActivationStepList steps={steps} />
        </div>

        {isReconnecting && (
          <p className="mt-4 text-center text-muted-foreground text-xs">
            Tentando reconectar com a Veforma…
          </p>
        )}
      </div>
    </Card>
  )
}
```

- [ ] **Step 3: Estados de falha e de reentrada**

`src/app/(connect)/conectar/ativacao/_components/activation-failed.tsx`:

```tsx
import { LoaderCircle, TriangleAlert } from 'lucide-react'

import { PartnershipBadge } from '@/components/brand/partnership-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ActivationFailedProps {
  reason: string | null
  onRetry: () => void
  isRetrying: boolean
}

export function ActivationFailed({
  reason,
  onRetry,
  isRetrying,
}: ActivationFailedProps) {
  return (
    <Card className="w-full max-w-lg">
      <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
        <PartnershipBadge />
        <div className="flex flex-col items-center gap-2">
          <TriangleAlert className="size-6 text-destructive" aria-hidden />
          <h1 className="font-bold text-xl tracking-tight">
            Não conseguimos concluir a configuração
          </h1>
          <p className="text-muted-foreground text-sm">
            {reason ?? 'Algo deu errado do lado da Veforma.'} Seu cartão já
            está salvo e nada foi cobrado.
          </p>
        </div>
        <Button
          size="lg"
          className="w-full"
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying && <LoaderCircle className="animate-spin" aria-hidden />}
          Tentar de novo
        </Button>
      </CardContent>
    </Card>
  )
}
```

`src/app/(connect)/conectar/ativacao/_components/activation-completed.tsx`:

```tsx
import { ArrowRight } from 'lucide-react'

import { PartnershipBadge } from '@/components/brand/partnership-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { env } from '@/config/env'

// Pedido já COMPLETED ao abrir a página: o código de troca foi emitido numa
// aba anterior. Sem reemitir (pendência P4), só orienta a voltar ao painel.
export function ActivationCompleted() {
  return (
    <Card className="w-full max-w-lg">
      <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
        <PartnershipBadge />
        <div>
          <h1 className="font-bold text-xl tracking-tight">
            Sua loja já está conectada à Veforma
          </h1>
          <p className="mt-1.5 text-muted-foreground text-sm">
            Volte ao painel da Brindefly para continuar. Se o aplicativo ainda
            aparecer como pendente, clique em Conectar de novo.
          </p>
        </div>
        <Button asChild size="lg" className="w-full">
          <a href={env.NEXT_PUBLIC_BRINDEFLY_PANEL_URL}>
            Ir para o painel Brindefly <ArrowRight aria-hidden />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Orquestrador**

`src/app/(connect)/conectar/ativacao/_components/activation-progress.tsx`:

```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { ErrorCard } from '@/app/(connect)/_components/error-card'
import { InvalidLink } from '@/app/(connect)/_components/invalid-link'
import {
  CONNECT_ROUTES,
  withLinkToken,
} from '@/app/(connect)/_lib/route-for-status'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CONNECTION_POLLING_FAILURES_BEFORE_WARNING,
  LINK_TOKEN_PARAM,
} from '@/constants/connection'
import { useConnectionRequest } from '@/hooks/use-connection-request'
import {
  useCompleteConnectionRequest,
  useRetryConnectionRequest,
} from '@/http/generated'
import { errorHandler } from '@/utils/error-handler'

import { countStepsDone } from '../_lib/activation-steps'
import { ActivationCard } from './activation-card'
import { ActivationCompleted } from './activation-completed'
import { ActivationFailed } from './activation-failed'

export function ActivationProgress() {
  const router = useRouter()
  const linkToken = useSearchParams().get(LINK_TOKEN_PARAM)

  const {
    connectionRequest,
    isPending,
    isError,
    error,
    isNotFound,
    isFetching,
    refetch,
    consecutiveFailures,
  } = useConnectionRequest(linkToken, { poll: true })

  const [callbackUrl, setCallbackUrl] = useState<string | null>(null)
  const hasRequestedComplete = useRef(false)

  const {
    mutate: complete,
    isError: isCompleteError,
    error: completeError,
    isPending: isCompleting,
  } = useCompleteConnectionRequest({
    mutation: {
      onSuccess: (response) => setCallbackUrl(response.callbackUrl),
      onError: () => {
        hasRequestedComplete.current = false
      },
    },
  })

  const { mutate: retry, isPending: isRetrying } = useRetryConnectionRequest({
    mutation: {
      onSuccess: () => refetch(),
      onError: (mutationError) => {
        const { title, description } = errorHandler(mutationError)
        toast.error(title, { description })
      },
    },
  })

  const status = connectionRequest?.status

  // Voltou do cancel_url da Stripe (ou abriu a URL à mão): checkout não feito.
  useEffect(() => {
    if (status === 'PENDING' && linkToken) {
      router.replace(withLinkToken(CONNECT_ROUTES.landing, linkToken))
    }
  }, [status, linkToken, router])

  // Produtos sincronizados: concluir uma única vez.
  useEffect(() => {
    if (status !== 'PRODUCTS_SYNCED' || !linkToken) return
    if (hasRequestedComplete.current) return

    hasRequestedComplete.current = true
    complete({ linkToken })
  }, [status, linkToken, complete])

  function handleRetryComplete() {
    if (!linkToken) return

    hasRequestedComplete.current = true
    complete({ linkToken })
  }

  if (!linkToken || isNotFound) return <InvalidLink />

  if (isPending) return <Skeleton className="h-[28rem] w-full max-w-lg" />

  if (!connectionRequest) {
    const { title, description } = errorHandler(error)

    return (
      <ErrorCard
        title={title}
        description={description}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    )
  }

  if (status === 'FAILED') {
    return (
      <ActivationFailed
        reason={connectionRequest.failureReason}
        onRetry={() => retry({ linkToken })}
        isRetrying={isRetrying}
      />
    )
  }

  if (status === 'COMPLETED' && callbackUrl === null) {
    return <ActivationCompleted />
  }

  if (isCompleteError && !isCompleting) {
    const { title, description } = errorHandler(completeError)

    return (
      <ErrorCard
        title={title}
        description={description}
        onRetry={handleRetryComplete}
      />
    )
  }

  if (!status || status === 'PENDING') return null

  return (
    <ActivationCard
      doneCount={countStepsDone(status, callbackUrl !== null)}
      callbackUrl={callbackUrl}
      isReconnecting={
        isError && consecutiveFailures >= CONNECTION_POLLING_FAILURES_BEFORE_WARNING
      }
    />
  )
}
```

- [ ] **Step 5: Página**

`src/app/(connect)/conectar/ativacao/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

import { ActivationProgress } from './_components/activation-progress'

export const metadata: Metadata = {
  title: 'Ativando sua assinatura',
}

export default function ActivationPage() {
  return (
    <div className="grid flex-1 place-items-center px-6 py-12">
      <Suspense fallback={<Skeleton className="h-[28rem] w-full max-w-lg" />}>
        <ActivationProgress />
      </Suspense>
    </div>
  )
}
```

- [ ] **Step 6: Verificar**

```bash
pnpm lint && pnpm typecheck && env -u PORT -u NODE_ENV pnpm build
```

Expected: build lista `○ /conectar/ativacao`. Manual, com token de hml e Stripe em teste (pendências P3/P10):

1. Concluir um checkout de teste; o `success_url` cai em `/conectar/ativacao?linkToken=…`.
2. As etapas concluem uma a uma (≥ 0,9 s cada) acompanhando o status; o título muda para "Tudo pronto!" e a aba navega para o callback da api-rest, que redireciona ao painel Brindefly.
3. Abrir a mesma URL depois disso: card "Sua loja já está conectada à Veforma".
4. Abrir a URL com um pedido `PENDING`: volta para `/conectar`.
5. Simular queda de rede (DevTools offline) durante o polling: após 3 falhas aparece "Tentando reconectar…"; ao voltar, some.

---

### Task 7: Tokens visuais, build no Workers e documentação

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `README.md`, `CLAUDE.md`
- Modify: `docs/02-apis-veforma.md`, `docs/04-decisoes-e-pendencias.md`

**Interfaces:** nenhuma nova.

- [ ] **Step 1: Tokens preto e branco do protótipo**

Em `src/styles/globals.css`, substituir o bloco `:root { … }` e remover o bloco `.dark { … }` (o produto é só claro; o `@custom-variant dark` pode ficar):

```css
/* Tokens da Veforma (protótipo do Bruno · veforma-viewer/src/styles/globals.css) */
:root {
  --radius: 0.75rem;
  --background: #ffffff;
  --foreground: #0f0f0f;
  --card: #ffffff;
  --card-foreground: #0f0f0f;
  --popover: #ffffff;
  --popover-foreground: #0f0f0f;
  --primary: #111111;
  --primary-foreground: #ffffff;
  --secondary: #f4f4f4;
  --secondary-foreground: #0f0f0f;
  --muted: #f6f6f6;
  --muted-foreground: #6e6e6e;
  --accent: #f0f0f0;
  --accent-foreground: #0f0f0f;
  --destructive: oklch(0.577 0.245 27.325);
  --border: #e6e6e6;
  --input: #dcdcdc;
  --ring: #a3a3a3;
  --brindefly: #083fc9;
}
```

E dentro de `@theme inline { … }`, junto das outras cores:

```css
  --color-brindefly: var(--brindefly);
```

- [ ] **Step 2: Documentação do projeto**

Em `README.md`, na seção "Estrutura", substituir o bloco de árvore por:

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
  http/client.ts                    axios para a client-api da Veforma
  http/generated/                   Kubb (pnpm kb:generate) — não editar
  lib/                              zod (pt-BR), react-query
  styles/globals.css                Tailwind 4 + tokens da Veforma
  utils/                            cn, error-handler, formatters
  @types/connection.ts
```

Na tabela de scripts do `README.md`, adicionar a linha:

```
| `kb:generate` | Regenera `src/http/generated` a partir do OpenAPI de homologação da client-api |
```

Em `CLAUDE.md`, na seção "Estrutura (App Router)", trocar a linha que cita `(landing)/` por:

```
- `(connect)/` é o fluxo 02 (Aquisição): `conectar/` é a landing com os planos e `conectar/ativacao/` a confirmação. A regra "status → rota" fica em `(connect)/_lib/route-for-status.ts` e o hook de status em `hooks/use-connection-request.ts`; não duplicar.
```

E na seção "Convenções herdadas da Brindefly", adicionar:

```
- Hooks de API vêm do Kubb (`src/http/generated`, `pnpm kb:generate`), com TanStack Query e axios (`src/http/client.ts`), como no web-store. Erros da Veforma passam por `@/utils/error-handler`.
```

Em `docs/02-apis-veforma.md`, na tabela "O que a client-api precisa saber sobre este projeto", preencher a coluna "Aponta para": `connectionUrl` → `/conectar?linkToken=…`; `success_url` → `/conectar/ativacao?linkToken=…`; `cancel_url` → `/conectar?linkToken=…`.

Em `docs/04-decisoes-e-pendencias.md`, na linha de **P1**, acrescentar ao fim da coluna "Pendência": `Rotas definidas (15/10): landing /conectar, confirmação /conectar/ativacao, sempre com ?linkToken=. Falta só o host.`

- [ ] **Step 3: Verificação final (inclui o bundle do Workers)**

```bash
pnpm lint:check && pnpm lint && pnpm typecheck && env -u PORT -u NODE_ENV pnpm exec opennextjs-cloudflare build
```

Expected: `OpenNext build complete.` Em seguida:

```bash
(pnpm exec wrangler dev --port 8787 --local > /dev/null 2>&1 &) ; sleep 10
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8787/conectar
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8787/conectar/ativacao
pkill -f 'wrangler dev --port 8787'
```

Expected: `200` e `200`. Depois disso o trabalho fica pronto para Rodrigo revisar e commitar.
