# 05 · Referências

## Documentos do Paulo (artefatos do Claude, acesso público)

| Documento | Link | Conteúdo |
|-----------|------|----------|
| Integração Veforma · Levantamento técnico v10 (13/10/2026, atualizado 14/10) | https://claude.ai/artifact/LkoACmoQokKKzPUdmY18zR | Tarefas V01–V11 (DEV-3786 a DEV-3798, épicos DEV-3782/3783/3785), fluxo com os repositórios da Brindefly, respostas da Veforma Q1–Q7, decisões D1–D6 do lado Brindefly |
| Fluxo de conexão Veforma v15 (08/10/2026) | https://claude.ai/artifact/S31Lyrd3YrjdyV93NbdZmP | Credenciais, sequência completa (public-api, client-api, Stripe), máquina de estados, 28 decisões, mudanças no ORM da Veforma, comparação com Melhor Envio |

## APIs da Veforma (homologação)

| API | Docs (Scalar) | OpenAPI |
|-----|---------------|---------|
| public-api | https://api-hml.veforma.com.br/docs/ | https://api-hml.veforma.com.br/docs/openapi.json |
| client-api | https://api-client-hml.veforma.com.br/docs/ | https://api-client-hml.veforma.com.br/docs/openapi.json |

Cópias de 2026-10-15 em [`openapi/`](openapi/).

## Protótipo de telas do Bruno

| Tela | URL |
|------|-----|
| Índice dos fluxos | https://vorisc.github.io/veforma-screens/ |
| 01 · Loja de aplicativos (painel Brindefly) | https://vorisc.github.io/veforma-screens/pages/01-fluxo-ativacao/1-loja-de-aplicativos.html |
| 01 · Detalhe do app | https://vorisc.github.io/veforma-screens/pages/01-fluxo-ativacao/2-detalhe-app.html |
| **02 · Página de vendas** | https://vorisc.github.io/veforma-screens/pages/02-fluxo-aquisicao/1-pagina-de-vendas.html |
| **02 · Confirmação e ativação** | https://vorisc.github.io/veforma-screens/pages/02-fluxo-aquisicao/2-confirmacao.html?plano=profissional |
| 03 · Página de produto | https://vorisc.github.io/veforma-screens/pages/03-fluxo-vitrine-3d/1-pagina-de-produto.html |
| 04 · Catálogo PDF · Viewer | `.../pages/04-fluxo-catalogo-pdf/1-catalogo-pdf.html` · `2-viewer.html` |
| 05 · Painel (8 telas) | `.../pages/05-fluxo-painel/1-login.html` … `8-conta.html` |

O índice carrega a lista por JavaScript; sem JS a página mostra "Nenhum fluxo encontrado".

## Código da Brindefly usado como molde (monorepo em `../../../`)

| O quê | Onde |
|-------|------|
| Callback OAuth do Melhor Envio (molde do callback da Veforma, V04) | `brindefly-api-rest/src/http/controllers/integrations/connect-melhor-envio-integration.controller.ts` e `src/use-cases/integrations/connect-melhor-envio-integration.ts` |
| Rotas de integração | `brindefly-api-rest/src/http/routes/integration.routes.ts` |
| Sessão do painel (cookie `brindeflyToken`, JWT 1 h) | `brindefly-api-rest/src/config/jwt.config.ts`, `src/config/cookie.config.ts`, `src/constants/auth.ts`, `src/http/middlewares/auth.ts` |
| Botão "Conectar" do Melhor Envio no painel (abre em nova aba) | `brindefly-panel-admin/src/pages/app/applications/$applicationId/melhor-envio/-components/general-config-card.tsx` |
| Páginas de aplicativos do painel | `brindefly-panel-admin/src/pages/app/applications/` |
| Convenções Next.js + Brindefly (projeto irmão) | `brindefly-architecture/CLAUDE.md` |

## Repositório

- GitHub `vorisc/veforma-pages`, branch padrão `master`; `brindefly-partner/` é este projeto.
- Tarefas no ClickUp com prefixo `DEV-`; commits `tipo(DEV-1234): mensagem`.
