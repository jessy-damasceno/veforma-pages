# 01 · Contexto e fluxo

## O produto

A **Veforma** é um visualizador 3D para brindes: o comprador gira o produto, troca a cor, aplica a própria logo por tipo de impressão e vê em realidade aumentada pelo celular. A **Brindefly** é a plataforma de e-commerce dos brindeiros (lojistas). A integração coloca a Veforma como um aplicativo na loja de aplicativos do painel Brindefly: o brindeiro "conecta", escolhe um plano, deixa o cartão na Stripe e a Veforma configura a loja sozinha (sem script, sem dev).

## As partes

| Parte | O que é | Dono |
|-------|---------|------|
| **panel-admin** + **api-rest** | Painel do brindeiro e API admin da Brindefly. Têm a loja de aplicativos, o botão "Conectar" e o callback que recebe a chave da loja | Brindefly |
| **web-store** + **api-ecommerce** | Loja do brindeiro e API pública. Mostram o botão "Ver em 3D" na página do produto | Brindefly |
| **public-api** (`api[-hml].veforma.com.br`) | API servidor-a-servidor da Veforma: pedido de conexão, troca da chave, viewer, acesso ao painel | Veforma |
| **client-api** (`api-client[-hml].veforma.com.br`) | API do navegador da Veforma: planos, checkout, status da conexão, conclusão, webhook da Stripe, sessão do painel | Veforma |
| **brindefly-partner** (este projeto) | Páginas que a client-api serve ao brindeiro durante a aquisição: landing com planos e tela de confirmação/ativação | Veforma (repo `vorisc/veforma-pages`) |
| Painel Veforma (`app.veforma.com.br`, fora deste repo) | Painel do brindeiro depois de assinar: métricas, modelos 3D, links/QR, assinatura | Veforma |

Pessoas: **Paulo** escreveu os dois documentos de referência (fluxo de conexão v15 e levantamento técnico v10). **Bruno** fez o protótipo de telas (`vorisc.github.io/veforma-screens`). **Jessy** faz a landing com os planos. **Rodrigo** estrutura o projeto e a arquitetura.

## Os cinco fluxos do protótipo e o que é nosso

| # | Fluxo | Contexto | Telas | Nosso? |
|---|-------|----------|-------|--------|
| 01 | Ativação | Painel Brindefly | Loja de aplicativos · Detalhe do app (botão Conectar) | Não (Brindefly, tarefas V05/V06) |
| 02 | **Aquisição** | Veforma | **Página de vendas (planos) · Confirmação e ativação** | **Sim, inteiro** |
| 03 | Vitrine 3D | Loja do brindeiro | Página de produto com "Ver em 3D" | Não (Brindefly, V07/V08) |
| 04 | Catálogo PDF | Veforma | QR code no PDF · Viewer | Não (fora desta entrega) |
| 05 | Painel | Veforma | Login, visão geral, modelos, impressão, links/QR, lista de desejos, assinatura, conta | Não (painel Veforma, em desenvolvimento) |

## Fluxo ponta a ponta

```
Brindeiro          panel-admin        api-rest            public-api         brindefly-partner        client-api         Stripe
   |  Conectar         |                  |                   |                    |                      |                |
   |------------------>| POST /integrations/veforma/connect   |                    |                      |                |
   |                   |----------------->| POST /api/v1/connections (clientId, clientSecret, storeName,  |                |
   |                   |                  |  externalStoreId, ownerEmail, ownerName, externalReference, callbackUrl)       |
   |                   |                  |<------------------| 201 { connectionUrl: ".../conectar?linkToken=..." }        |
   |  abre connectionUrl (hoje: nova aba, como Melhor Envio)  |                    |                      |                |
   |---------------------------------------------------------------------------->| GET /connections/:linkToken (status)     |
   |                                      LANDING com planos (Jessy)             |--------------------->|                |
   |  escolhe plano ---------------------------------------------------------->| POST /connections/:linkToken/checkout     |
   |                                                                             |   { planSlug } -----> | 201 { checkoutUrl }
   |  vai para o Stripe Checkout (cartão salvo, 14 dias grátis, nada cobrado) ---------------------------------------------->|
   |<-- success_url = tela de CONFIRMAÇÃO com o mesmo linkToken ------------------------------------------------------------|
   |                                                                             |   webhook checkout.session.completed ----|
   |                                      CONFIRMAÇÃO (polling 2 s)              |--GET /connections/:linkToken-->|       |
   |                                      PENDING → CHECKOUT_COMPLETED → STORE_CONNECTED → PRODUCTS_SYNCED      |       |
   |                                                                             |--POST /connections/:linkToken/complete->|
   |                                                                             |<-200 { callbackUrl: "...callback?exchangeCode=&externalReference=" }
   |  REDIRECIONA para callbackUrl (nossa mudança: mesma aba, sem botão) ------>|                      |                |
   |                   |                  |<--GET /integrations/veforma/callback?exchangeCode&externalReference------------|
   |                   |                  | POST /api/v1/connections/api-key (clientId, clientSecret, exchangeCode)       |
   |                   |                  |<------------------| 201 { apiKey: "vfk_..." }                                   |
   |                   |                  | grava apiKey em Integration.credentials da loja                                |
   |<------------------|<-----------------| 302 ${ADMIN_PANEL_BASE_URL}/app/applications/:id/veforma?status=connected | ?error=CODE
```

### Passo a passo da nossa parte (fluxo 02)

1. **Chegada.** O brindeiro abre `connectionUrl` (`/conectar?linkToken=...`). A página consulta `GET /api/v1/connections/{linkToken}`. Com `status: PENDING` mostra a landing com os planos. Com qualquer outro status (checkout já feito, conexão em andamento, concluída ou falha) cai direto na tela de confirmação, porque o link não expira e o brindeiro pode fechar o navegador no meio. O caminho inverso não existe: a confirmação nunca devolve à landing sozinha, porque `PENDING` logo depois do checkout costuma ser a Stripe ainda não ter avisado a Veforma.
2. **Planos.** `GET /api/v1/plans` devolve `essencial`, `basico`, `profissional` com `priceInCents`, `trialDays` e `limits`. Ao escolher, `POST /api/v1/connections/{linkToken}/checkout { planSlug }` devolve `checkoutUrl` e a página manda o navegador para a Stripe.
3. **Stripe Checkout.** Salva o cartão e cria a assinatura em `trialing` (14 dias). Nada é cobrado agora. O `success_url` (configurado na client-api) volta para a tela de confirmação com o mesmo `linkToken`.
4. **Confirmação/ativação.** A página consulta o status a cada 2 s. A client-api avança sozinha, pelo webhook da Stripe ou pela primeira consulta de status (os dois chamam o mesmo use case): `CHECKOUT_COMPLETED` → `STORE_CONNECTED` (cria User, Store, StoreMember OWNER, StoreConnection) → `PRODUCTS_SYNCED` (lê os SKUs da loja e cria um StoreProduct por SKU com modelo 3D). Os textos e a animação são do front (decisão D8 do Paulo); o backend só expõe o status.
5. **Conclusão.** Com `PRODUCTS_SYNCED`, a página chama `POST /api/v1/connections/{linkToken}/complete`. A client-api gera o `exchangeCode` (uso único, 10 min), marca `COMPLETED` e devolve o `callbackUrl` que a Brindefly mandou no passo 1, já com `exchangeCode` e `externalReference` na query.
6. **Retorno à Brindefly.** No documento do Paulo (v15) o callback abria em **nova aba** e a aba da Veforma ficava com o botão "Acessar painel Veforma". **A decisão nova (Rodrigo, 15/10) é não ter botão: a tela redireciona direto para o `callbackUrl` na mesma aba.** O callback da api-rest troca o código pela chave e redireciona o brindeiro para a página do app no painel Brindefly com `?status=connected` ou `?error=CODE`. Ver [04-decisoes-e-pendencias.md](04-decisoes-e-pendencias.md) para as implicações.
7. **Falha.** Qualquer etapa pode levar o pedido a `FAILED` com `failureReason`. A tela mostra o erro e "Tentar de novo", que chama `POST /api/v1/connections/{linkToken}/retry`; a nova tentativa continua da etapa onde parou (o cartão já está salvo).

## Credenciais que circulam (quem vê o quê)

| Credencial | Gerada por | Onde fica | Transporte | Validade | Passa por este projeto? |
|------------|------------|-----------|------------|----------|-------------------------|
| `clientId` + `clientSecret` (`vfs_...`) da plataforma | Backoffice Veforma | env da api-rest (`VEFORMA_CLIENT_ID`, `VEFORMA_SECRET`) | body, servidor a servidor | permanente | **Não** |
| `linkToken` | public-api (passo 1) | URL do navegador (`?linkToken=`) | URL | não expira; inválido após `COMPLETED` | **Sim** (é a nossa "sessão") |
| `exchangeCode` | client-api (`complete`) | URL do callback | redirect | uso único, 10 min | **Sim**, só de passagem no `callbackUrl` |
| `externalReference` | api-rest (passo 1) | ConnectionRequest; volta no callback | URL | enquanto a conexão estiver pendente | Só de passagem no `callbackUrl` |
| chave da loja `vfk_...` | public-api (troca) | `Integration.credentials` na Brindefly | `Authorization: Bearer` | não expira (v1) | **Nunca** |

O `linkToken` é o único segredo que a página manipula. Ele identifica o pedido de conexão e, sozinho, permite criar checkout, consultar status e concluir. Não guardar em lugar nenhum além da URL.

## Máquina de estados do pedido de conexão (`ConnectionRequest.status`)

```
PENDING ──checkout concluído──▶ CHECKOUT_COMPLETED ──▶ STORE_CONNECTED ──▶ PRODUCTS_SYNCED ──complete──▶ COMPLETED
   │                                   │                      │                    │
   └───────────────────────────────────┴──────────────────────┴────────────────────┴──falha──▶ FAILED ──retry──▶ (volta à etapa que falhou)
```

Nenhum status fala em pagamento: o checkout salva o cartão e cria a assinatura em teste. A cobrança vem depois, por `invoice.paid`, fora desta entrega.

## O que a Brindefly faz do lado dela (para não reinventar)

- **V03 `POST /integrations/veforma/connect`**: pede o link à public-api e devolve `connectionUrl` ao painel. O `externalReference` é um UUID guardado na `Integration` da loja com `apiKey: null` (pendente) e reaproveitado enquanto pendente.
- **V04 `GET /integrations/veforma/callback`**: rota autenticada pelo cookie de sessão do painel (`brindeflyToken`, JWT de 1 h, `httpOnly`, `SameSite=None`). Acha a loja pelo `externalReference`, troca o `exchangeCode` pela chave na public-api, grava e **sempre** redireciona para `${ADMIN_PANEL_BASE_URL}/app/applications/:id/veforma` com `?status=connected` ou `?error=<code>` (inclusive sessão expirada). `409 EXCHANGE_CODE_ALREADY_USED` com chave já gravada conta como sucesso.
- **V06 página do app no painel**: botão "Conectar" que abre `connectionUrl`. Hoje o molde (Melhor Envio) abre em nova aba com `window.open(url, '_blank')`.
- **V07/V08**: `GET /products/:slug/viewer` na api-ecommerce e botão "Ver em 3D" na loja. Não nos afeta.
- **V09–V11**: "Acessar painel Veforma" dentro do painel Brindefly, via `POST /api/v1/panel-access` (public-api, 201 `{ panelUrl }`, token de 5 min) e `GET /api/v1/sessions/panel-access?token=` (client-api, grava cookie `veformaToken` e redireciona). É assim que o brindeiro chega ao painel Veforma depois; não precisa de botão na nossa tela.
