# 03 · Telas

Fonte: protótipo do Bruno em `https://vorisc.github.io/veforma-screens/` (HTML estático com Tailwind no navegador). Só o fluxo **02 · Aquisição** é nosso. As outras telas estão descritas no fim para contexto.

## Identidade visual (tokens do protótipo)

Preto e branco, fonte **Poppins** 400/500/600/700, azul da Brindefly só no selo de parceria.

```css
--font-sans: "Poppins", ui-sans-serif, system-ui, sans-serif;
--color-background: #ffffff;  --color-foreground: #0f0f0f;
--color-primary: #111111;     --color-primary-foreground: #ffffff;
--color-secondary: #f4f4f4;   --color-muted: #f6f6f6;  --color-muted-foreground: #6e6e6e;
--color-accent: #f0f0f0;      --color-border: #e6e6e6; --color-input: #dcdcdc; --color-ring: #a3a3a3;
--color-brindefly: #083fc9;
--radius-lg: 0.75rem;  /* md = lg - 2px, xl = lg + 4px */
```

Os tokens vêm de `veforma-viewer/src/styles/globals.css` (repo da Veforma). Logos: `brindefly-simbolo-white.png` e `veforma-simbolo-white.svg`, cada um dentro de um círculo (azul Brindefly / preto Veforma) com um "+" entre eles.

## Tela 1 · Página de vendas (landing com planos) — Jessy

Protótipo: `pages/02-fluxo-aquisicao/1-pagina-de-vendas.html`. Página longa de vendas, em pt-BR.

**Seções, na ordem:**

1. **Hero.** Selo "Brindefly + Veforma 3D". Título "Seu cliente visualiza o resultado antes de pedir o orçamento". Texto: a Veforma adiciona um visualizador 3D à loja Brindefly para o cliente escolher cores, tipos de impressão e aplicar a própria logo. CTA "Ver planos com 50% OFF" (âncora para os planos). Linha "Como funciona · A integração é feita automaticamente". GIF do produto em 3D numa loja Brindefly trocando a cor e aplicando uma logo.
2. **O problema.** "O cliente ainda precisa imaginar como o brinde vai ficar": só vê a foto; alguém da equipe monta o mockup; aprovação por WhatsApp/e-mail; mudou a cor, nova prévia; o orçamento leva mais etapas.
3. **Com a Veforma.** O cliente vê a própria marca no produto na página da loja; escolhe cor e tipo de impressão em 3D; envia a logo e vê a aplicação na hora; gira e aproxima; vê em realidade aumentada em tamanho real; a equipe recebe o cliente com as escolhas definidas.
4. **Como funciona (3 passos com GIF).** 01 Escolhe a cor · 02 Aplica a própria logo · 03 Realidade aumentada (QR code abre no celular).
5. **Feito para a Brindefly.** "A gente deixa a Veforma pronta na sua loja Brindefly. Sem instalar código, sem precisar de desenvolvedor e sem configurar a integração por conta própria." Quatro itens: visualizador nas páginas de produto · catálogo e variações sincronizados · visual que se adapta à loja · painel para gerenciar os produtos em 3D.
6. **Planos.** "Escolha o plano ideal para sua loja · Comece com 50% OFF no primeiro mês em todos os planos."
7. **Links e QR Codes para campanhas** (bloco extra abaixo dos planos; texto cortado no protótipo).

**Planos do protótipo** (provisórios, `docs/06-planos.md` do repo de telas; só mensal; 50% OFF no primeiro mês):

| | Essencial | Básico | Profissional (destaque) |
|---|---|---|---|
| Mensal | R$ 97 | R$ 147 | R$ 197 |
| 3D integrado à Brindefly | sim | sim | sim |
| Modelos disponíveis | Ilimitado | Ilimitado | Ilimitado |
| Views por mês | 10 mil | 30 mil | 80 mil |
| | nota: R$ 0,02 por view extra | | |
| Métricas de engajamento | sim | sim | sim |
| Realidade aumentada | sim | sim | sim |
| Links e QR Codes para campanhas | não | sim | sim |
| Visualização por tipo de impressão | não | não | sim |
| Lista de prioridade para novos modelos | não | não | sim |

O CTA de cada card vai para `2-confirmacao.html?plano=<key>`. **No produto real** o clique chama `POST /connections/{linkToken}/checkout { planSlug }` e manda para a Stripe; a confirmação vem depois do checkout, não direto do card. Os valores reais vêm de `GET /plans` (`priceInCents`, `trialDays`, `limits`); a tabela de recursos é conteúdo do front.

**Discrepância a resolver** (P5 em 04): o protótipo vende "50% OFF no primeiro mês"; a API e a decisão D11 do Paulo dizem "14 dias grátis com cartão salvo, nada cobrado no checkout" (`trialDays`). Os dois não podem conviver no mesmo texto.

## Tela 2 · Confirmação e ativação — nossa

Protótipo: `pages/02-fluxo-aquisicao/2-confirmacao.html`. Card centralizado (max ~32rem), fundo `muted`, barra de progresso no topo do card, selo Brindefly + Veforma, título, subtítulo, lista de etapas e um rodapé.

**Estados do protótipo:**

| Momento | Título | Subtítulo | Rodapé |
|---------|--------|-----------|--------|
| Em andamento | "Preparando a Veforma na sua loja" | "Não feche esta página. Isso leva só alguns instantes." | — |
| Concluído | "Tudo pronto! A Veforma já está ativa" | "O 3D já pode ser usado nas páginas dos produtos." | botão "Acessar painel Veforma →" + "Enviamos todas informações para o seu e-mail." |

**Etapas do protótipo** (cada uma: pendente → ativa com spinner → concluída com check; a barra avança 1/7 por etapa):

1. Pagamento confirmado (já nasce concluída: "o Stripe só redireciona para cá depois do pagamento aprovado")
2. Conectando à sua loja Brindefly
3. Adicionando o 3D às páginas de produto
4. Sincronizando produtos e variações
5. Ativando a realidade aumentada
6. Finalizando a configuração

No protótipo a animação é um timer (1,3 s por etapa). O comentário do próprio Bruno diz: "na versão real, acompanham o status do provisionamento via webhook".

**Mapeamento proposto etapa ↔ status da API** (os textos são nossos, decisão D8):

| Etapa | Concluída quando |
|-------|------------------|
| 1 Cartão confirmado / assinatura ativada (não "pagamento confirmado", D11) | `CHECKOUT_COMPLETED` |
| 2 Conectando à sua loja Brindefly | `STORE_CONNECTED` |
| 3 Adicionando o 3D às páginas de produto | cosmética; concluir junto com a 2 ou a 4 |
| 4 Sincronizando produtos e variações | `PRODUCTS_SYNCED` |
| 5 Ativando a realidade aumentada | cosmética; concluir junto com a 4 |
| 6 Finalizando a configuração | `COMPLETED` (resposta do `complete`) e redirect |

**O que muda em relação ao protótipo (decisão de 15/10):** não existe o botão "Acessar painel Veforma". Ao concluir, a tela chama `complete` e mostra o estado "Tudo pronto" com o botão "Ir para o painel da Brindefly" e uma contagem de 10 s (com "Esperar" para pausar); ao zerar ou ao clicar, navega para o `callbackUrl` na mesma aba e o brindeiro termina na página do app Veforma dentro do painel Brindefly. O rodapé "Enviamos todas informações para o seu e-mail" depende de a Veforma mandar esse e-mail (P8).

**Estados que o protótipo não tem e a API exige:**

- **Falha** (`FAILED` + `failureReason`): mensagem e botão "Tentar de novo" (`retry`).
- **Reabertura**: brindeiro fechou o navegador e abriu o link de novo. A página precisa lidar com qualquer status na chegada, sem repetir checkout.
- **Erro de rede / token inválido** (404): mensagem orientando a voltar ao painel Brindefly e conectar de novo.
- **Concluído antes de redirecionar**: se o `complete` já foi chamado (status `COMPLETED`) e o redirect não aconteceu (aba fechada no meio), não dá para chamar `complete` de novo sem saber se a API reemite o código (P4).

## Telas de contexto (não são nossas)

- **01 · Detalhe do app (painel Brindefly).** "Veforma 3D · Visualização 3D e realidade aumentada integrada às páginas de produto da sua loja." Passos: 1 clique em Conectar · 2 na página da Veforma escolha seu plano e conclua a assinatura · 3 a loja será vinculada e você terá acesso para gerenciar os produtos em 3D. Botão **Conectar** leva à nossa landing. Depois de conectado, o botão vira "Acessar painel Veforma" (V11).
- **03 · Página de produto da loja.** Botão "Ver em 3D" abre modal com iframe do viewer.
- **05 · Painel Veforma.** Login, visão geral, modelos 3D, configurar impressão, links e QR codes, lista de desejos, assinatura, conta. É para onde o botão do protótipo apontava (`05-fluxo-painel/2-visao-geral.html`).
