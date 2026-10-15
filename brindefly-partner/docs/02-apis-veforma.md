# 02 · APIs da Veforma

Duas APIs, dois públicos. Este projeto só fala com a **client-api**. A public-api está aqui porque explica de onde vêm o `linkToken` e o `callbackUrl` e para onde vai o `exchangeCode`.

| API | Homologação | Produção | Docs | Quem chama |
|-----|-------------|----------|------|------------|
| client-api | `https://api-client-hml.veforma.com.br` | a confirmar (`api-client.veforma.com.br`) | `/docs/` · spec `/docs/openapi.json` | navegador do brindeiro (este projeto) e Stripe (webhook) |
| public-api | `https://api-hml.veforma.com.br` | `https://api.veforma.com.br` | `/docs/` · spec `/docs/openapi.json` | api-rest e api-ecommerce da Brindefly, servidor a servidor |

Cópia dos specs em [`openapi/`](openapi/) (baixados em 2026-10-15). Não há `servers` no spec; os hosts acima vêm dos documentos do Paulo e da URL dos docs.

## Formato de erro (as duas APIs)

Todo 4xx/5xx responde:

```json
{ "code": "CONNECTIONS/STORE_ALREADY_CONNECTED", "title": "...", "message": "...", "errors": [{ "field": "...", "message": "..." }] }
```

`errors` só aparece em validação (400). Códigos conhecidos: `CONNECTIONS/STORE_ALREADY_CONNECTED` (409), `EXCHANGE_CODE_ALREADY_USED` (409). Os demais não estão documentados; tratar genericamente por `code` + `message`.

## client-api · o que este projeto consome

Nenhum destes endpoints exige autenticação: o `linkToken` na URL é a credencial. Todos os ids são ULID.

### `GET /api/v1/plans` · Listar os planos da landing

```json
200 { "plans": [ {
  "id": "01J...", "name": "Profissional", "description": "..." | null,
  "slug": "essencial" | "basico" | "profissional",
  "priceInCents": 19700, "trialDays": 14,
  "limits": { "monthlyViews": 80000 | null, "modelRequests": number | null, "qrCodeLinks": number | null }
} ] }
```

`null` em `limits` significa ilimitado. A lista de recursos por plano do protótipo (realidade aumentada, links/QR, visualização por tipo de impressão, lista de prioridade) **não vem da API**: é conteúdo do front.

### `GET /api/v1/connections/{linkToken}` · Buscar o pedido de conexão

```json
200 { "connectionRequest": { "status": "PENDING" | "CHECKOUT_COMPLETED" | "STORE_CONNECTED" | "PRODUCTS_SYNCED" | "COMPLETED" | "FAILED", "failureReason": string | null } }
```

É só isso: não vem nome da loja, dono nem plano escolhido. Serve para (a) decidir se mostra landing ou confirmação e (b) o polling da confirmação. Na primeira consulta após o checkout, se ainda estiver `PENDING`, a client-api confere a sessão na Stripe e dispara a conexão (decisão D6 do Paulo), então a própria consulta de status "destrava" o fluxo mesmo que o webhook atrase.

Erros esperados: 404 (token inexistente). Pedido `COMPLETED` responde 200 com `status: "COMPLETED"` (confirmado 15/10). Como a confirmação da Stripe é assíncrona, logo depois do checkout o status pode vir `PENDING` por alguns segundos.

### `POST /api/v1/connections/{linkToken}/checkout` · Criar o checkout do plano

```json
body: { "planSlug": "essencial" | "basico" | "profissional" }
201  { "checkoutUrl": "https://checkout.stripe.com/..." }
```

A página faz `window.location.assign(checkoutUrl)`. O `success_url` e o `cancel_url` são configurados na client-api; o `success_url` volta para a confirmação com o mesmo `linkToken`. A sessão da Stripe leva o id do ConnectionRequest em `metadata`.

### `POST /api/v1/connections/{linkToken}/complete` · Concluir a conexão

```json
200 { "callbackUrl": "https://api.brindefly.com.br/integrations/veforma/callback?exchangeCode=...&externalReference=..." }
```

Chamar **uma vez**, quando o status chegar a `PRODUCTS_SYNCED`. Gera o `exchangeCode` (hash guardado, 10 min, uso único), marca `COMPLETED` e devolve o `callbackUrl` registrado no pedido com os parâmetros já montados. A página redireciona para essa URL (mesma aba).

### `POST /api/v1/connections/{linkToken}/retry` · Tentar de novo

```json
200 { "connectionRequest": { "status": ..., "failureReason": string | null } }
```

Só faz sentido com `FAILED`. Retoma da etapa que falhou; o cartão já está salvo.

### Não consumimos (mas existem na client-api)

| Endpoint | Para quê | Quem usa |
|----------|----------|----------|
| `POST /api/v1/webhooks/stripe` (`Stripe-Signature`) | Processa `checkout.session.completed` (`payment_status: "no_payment_required"`) e, depois, `invoice.paid` / `invoice.payment_failed` | Stripe |
| `GET /api/v1/sessions/panel-access?token=` | Troca o token de 5 min gerado pela public-api pelo cookie `veformaToken` e redireciona (302) ao painel Veforma; token inválido → `?error=<código>` | navegador, vindo do botão "Acessar painel" no painel Brindefly |
| `GET /api/v1/me` (cookie `veformaToken`) | `{ user: { id, name, email }, store: { id, name }, role: "OWNER" \| "MEMBER" }` | painel Veforma |

## public-api · o lado da Brindefly (contexto)

| Endpoint | Auth | Request | Response |
|----------|------|---------|----------|
| `POST /api/v1/connections` | credenciais no body | `clientId`, `clientSecret`, `storeName`, `externalStoreId`, `ownerEmail`, `ownerName?`, `externalReference` (≥3, aleatório, novo por conexão), `callbackUrl` (uri) | `201 { connectionUrl }` · 409 `STORE_ALREADY_CONNECTED` |
| `POST /api/v1/connections/api-key` | credenciais no body | `clientId`, `clientSecret`, `exchangeCode` | `201 { apiKey: "vfk_..." }` (mostrada uma vez) · 409 `EXCHANGE_CODE_ALREADY_USED` |
| `POST /api/v1/panel-access` | `Bearer vfk_...` | — | `201 { panelUrl }` (token de 5 min, novo a cada chamada) |
| `GET /api/v1/products/{sku}/viewer` | `Bearer vfk_...` | — | `200 { viewerUrl }` (assinada) · 404 sem 3D |
| `GET /api/v1/viewer/products/{storeProductId}?expires&signature` | assinatura na URL | — | `{ product: { id, sku, coverImageUrl, glbFileUrl, viewerSettings }, printTypes: [...] }` |

Detalhes do que a api-rest faz com isso estão em [01-contexto-e-fluxo.md](01-contexto-e-fluxo.md#o-que-a-brindefly-faz-do-lado-dela-para-não-reinventar).

## O que a client-api precisa saber sobre este projeto

A client-api **constrói URLs que apontam para cá**. Precisam estar alinhadas com as nossas rotas antes de homologar:

| Configuração na Veforma | Aponta para | Hoje no documento do Paulo |
|-------------------------|-------------|----------------------------|
| `connectionUrl` devolvido pela public-api | `/conectar?linkToken=…` | `https://app.veforma.com.br/conectar?linkToken=...` |
| `success_url` do Stripe Checkout | `/conectar/ativacao?linkToken=…` | "tela de progresso com o linkToken"; o protótipo usa `?session_id={CHECKOUT_SESSION_ID}` |
| `cancel_url` do Stripe Checkout | `/conectar?linkToken=…` | não documentado |
| CORS da client-api | origem deste projeto (hml e prod) | não documentado |

As rotas estão definidas; faltam o host (P1) e o CORS (P3), em [04-decisoes-e-pendencias.md](04-decisoes-e-pendencias.md).
