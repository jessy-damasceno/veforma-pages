# Documentação · brindefly-partner

Contexto completo para trabalhar neste projeto sem depender de outra sessão ou de quem levantou o fluxo. Leia na ordem.

| # | Arquivo | O que responde |
|---|---------|----------------|
| 1 | [01-contexto-e-fluxo.md](01-contexto-e-fluxo.md) | O que é a Veforma, quem são as partes, o fluxo ponta a ponta e qual pedaço é nosso |
| 2 | [02-apis-veforma.md](02-apis-veforma.md) | Os endpoints que este projeto consome (client-api) e os que a Brindefly consome (public-api), com request/response |
| 3 | [03-telas.md](03-telas.md) | As telas do protótipo do Bruno que viram páginas aqui: conteúdo, estados e comportamento |
| 4 | [04-decisoes-e-pendencias.md](04-decisoes-e-pendencias.md) | Decisões travadas que nos afetam e as perguntas em aberto antes de desenhar a arquitetura |
| 5 | [05-referencias.md](05-referencias.md) | Links das fontes (artefatos, docs das APIs, protótipo, código da Brindefly usado como molde) |

`openapi/` guarda uma cópia dos specs de homologação baixados em **2026-10-15** (`client-api.hml.json`, `public-api.hml.json`). Servem para leitura offline e para gerar o client HTTP. **A URL viva vence** quando divergir: `https://api-client-hml.veforma.com.br/docs/openapi.json` e `https://api-hml.veforma.com.br/docs/openapi.json`.

Specs aprovados por tarefa ficam em [`superpowers/specs/`](superpowers/specs/).
