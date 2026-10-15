import { z } from '@/lib/zod'

// Variáveis NEXT_PUBLIC_* precisam ser lidas estaticamente (process.env.NOME)
// para o Next inliná-las no bundle do cliente.
const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
})
