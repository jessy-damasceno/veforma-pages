# 04 · Decisões e pendências

## Decisões travadas que nos afetam

Fonte: "Fluxo de conexão Veforma" v15 (Paulo, 08/10, 28 decisões resolvidas) e "Integração Veforma · Levantamento técnico" v10 (Paulo, 13/10, atualizado 14/10). Só o que muda o que construímos aqui.

| Ref. | Decisão | Efeito neste projeto |
|------|---------|----------------------|
| D2 | O `callbackUrl` vem no pedido de conexão e fica no ConnectionRequest | Não construímos URL de retorno; usamos a que o `complete` devolve |
| D3 | `exchangeCode` vale 10 min | O redirect precisa acontecer logo depois do `complete`; não guardar o `callbackUrl` para depois |
| D5 | A loja na Veforma só é criada depois do checkout | Antes do checkout não existe Store; a landing não mostra "sua loja X" |
| D6 | Webhook e tela de progresso chamam o mesmo use case; a consulta de status destrava o fluxo | O polling não é só leitura: a primeira consulta após o checkout pode disparar a conexão |
| D7 | Falha → `FAILED` + motivo; "Tentar de novo" retoma da etapa | Tela precisa do estado de falha e do botão de retry |
| D8 | Textos e animação da tela de progresso são do front; backend só expõe status | Mapeamento etapa ↔ status é nosso (ver 03-telas) |
| D9 | Loja já conectada → 409 `STORE_ALREADY_CONNECTED` | Acontece na public-api (lado Brindefly), não aqui |
| D11 | 14 dias grátis com cartão salvo; nada cobrado no checkout; UI diz "cartão confirmado"/"assinatura ativada", nunca "pagamento confirmado" | Copy da etapa 1 e dos planos |
| — | O link de conexão não expira; a página dele é a landing com os planos | `linkToken` sem validade; landing e confirmação no mesmo link |
| — | Se o navegador fechar no meio, reabrir o link cai na tela de progresso, não na landing | Roteamento por status na chegada |
| — | O token volta da Stripe no `success_url` | Confirmação lê o `linkToken` da URL |
| — | Os produtos sincronizam dentro da conexão (`PRODUCTS_SYNCED`) | Etapa "Sincronizando produtos" tem status real |
| v15 (superada) | Callback abre em nova aba; aba da Veforma fica com "Acessar painel Veforma" | **Substituída pela decisão abaixo** |

## Decisão nova (Rodrigo, 15/10/2026)

**A tela de confirmação não tem botão de painel. Ao concluir, redireciona direto para o `callbackUrl`, que termina no painel Brindefly.** Motivo: o brindeiro saiu do painel Brindefly para conectar e deve voltar para lá; o acesso ao painel Veforma já existe pelo botão "Acessar painel" dentro do painel Brindefly (V09–V11).

Viabilidade verificada no código da api-rest (15/10): a sessão do painel é um cookie `brindeflyToken` com `httpOnly`, `secure` e `SameSite=None` fora do ambiente local, e o callback usa `request.verifyStoreAccess()` (molde do Melhor Envio). Uma navegação de aba inteira (`location.assign`) a partir do nosso domínio **envia** esse cookie para a api-rest, então o callback autentica, troca a chave e redireciona ao painel. O que não funciona é `fetch`/XHR do nosso domínio: tem que ser navegação.

## Pendências (resolver antes ou durante a arquitetura)

| # | Pendência | Quem resolve | Por que importa |
|---|-----------|--------------|-----------------|
| **P1** | **Domínio e rotas deste projeto.** O documento diz `https://app.veforma.com.br/conectar?linkToken=...`, mas `app.veforma.com.br` é o painel Veforma. Definir o host de hml e prod deste projeto e o path da landing (`/conectar`?) e da confirmação. Rotas definidas (15/10): landing /conectar, confirmação /conectar/ativacao, sempre com ?linkToken=. Falta só o host. | Rodrigo + Paulo | A public-api monta o `connectionUrl` e a client-api monta o `success_url`/`cancel_url` com isso |
| **P2** | **`success_url` e `cancel_url` do Stripe.** Qual rota, e com `?linkToken=` (documento) ou `?session_id={CHECKOUT_SESSION_ID}` (protótipo)? Recomendação: `linkToken` basta, a client-api confere a sessão sozinha (D6) | Paulo | Define a URL da confirmação |
| **P3** | **CORS da client-api** para a origem deste projeto (hml, prod e `localhost:3000`) | Paulo | Sem isso nenhuma chamada do navegador passa |
| **P4** | **Reentrada depois de `COMPLETED`.** Se a aba fechar entre o `complete` e o redirect, o `exchangeCode` some com ela. `complete` de novo reemite um código ou dá erro? O status do link vira "inválido"? | Paulo | Define o estado "Concluído sem retorno" da tela e se precisamos de `retry` aqui |
| **P5** (Jessy decide com produto) | **Oferta: "50% OFF no primeiro mês" (protótipo) × "14 dias grátis" (D11, `trialDays`).** Qual vale? Existe cupom na Stripe? | Produto/Veforma + Jessy | Copy da landing e da etapa 1 |
| **P6** | **Sessão do painel Brindefly expira em 1 h e o link não expira.** Se o brindeiro demorar mais de 1 h entre clicar em Conectar e concluir, o callback chega sem cookie: a api-rest redireciona com `?error`, o `exchangeCode` expira em 10 min e a Veforma já marcou `COMPLETED`; um novo "Conectar" dá 409. Opções: (a) a api-rest autenticar o callback só pelo `externalReference` (que é aleatório e já identifica a loja), sem sessão; (b) a Veforma permitir reemitir o código; (c) a nossa tela avisar "você será levado ao painel Brindefly; se pedir login, entre e clique em Conectar de novo" e a Veforma tratar o 409 como "reenviar callback". Recomendação: (a), é a menor mudança e remove a corrida | Paulo + time Brindefly (V04) | É o único caminho de falha sem recuperação hoje |
| P6 · posição (Rodrigo, 15/10) | **Risco aceito**: o brindeiro faz login de novo. Só fecha de verdade se o V04, ao cair sem sessão, mandar para o login com retorno ao próprio callback (que carrega o `exchangeCode`) e o login acontecer em menos de 10 min; sem isso, o novo "Conectar" recebe 409. Nada a fazer neste projeto | Time Brindefly | — |
| **P7** (Rodrigo leva ao time Brindefly) | **Nova aba ou mesma aba no painel Brindefly (V06).** O molde (Melhor Envio) abre `connectionUrl` com `window.open(_blank)`. Com o nosso redirect final, o brindeiro termina com duas abas do painel. Recomendação: V06 abrir na mesma aba | Time Brindefly | Experiência do retorno |
| **P8** | **E-mail "Enviamos todas informações para o seu e-mail".** A Veforma envia algo ao concluir? Com o quê? | Paulo | Copy do rodapé |
| **P9** (respondido em parte, 15/10) | **Erros não documentados** da client-api (códigos além dos dois conhecidos) e o que `GET /connections/{linkToken}` responde para token de pedido `COMPLETED`. Em especial: o que `GET /connections/{linkToken}` responde para pedido `COMPLETED` (200, 404 ou 410) e se a verificação da Stripe na primeira consulta (D6) é síncrona, ou seja, se a resposta já vem com o status avançado. A tela de ativação para de consultar depois do `complete` e devolve o brindeiro à landing quando lê `PENDING`; esses dois comportamentos dependem das respostas. **Respostas (Rodrigo, 15/10):** o GET de pedido `COMPLETED` responde **200 com `status: "COMPLETED"`**; a confirmação da Stripe é **assíncrona**, então o primeiro GET depois do checkout pode vir `PENDING`. Por isso a ativação **não** devolve à landing: continua consultando em `PENDING` com a etapa 1 em andamento e, após 60 s, mostra um link para os planos. | Paulo | Tratamento de erro na tela |
| **P10** (resolvido 15/10: Stripe em modo teste e token pela homolog da Brindefly) | **Credenciais de homologação da Stripe** (modo teste) e um `linkToken` de hml para testar ponta a ponta sem passar pela api-rest | Paulo | Desenvolvimento local |

## Fora do escopo deste projeto

Painel Veforma e login (fluxo 05), viewer e botão "Ver em 3D" (fluxo 03), catálogo PDF e QR (fluxo 04), webhooks da Stripe além do checkout (fim do teste, cobrança, falha de pagamento), desconexão/revogação, e qualquer tela dentro do painel Brindefly (fluxo 01).
