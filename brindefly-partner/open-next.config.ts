import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// Sem incremental cache por enquanto: a landing é estática.
// Ao adicionar ISR/`use cache`, configurar R2 aqui e em wrangler.jsonc.
export default defineCloudflareConfig({})
