import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'

import { reactQueryPlugin } from './src/lib/kubb'

process.loadEnvFile()

// Com o proxy de dev ligado, o spec vem do alvo real, não de /veforma-api.
const apiBaseUrl =
  process.env.VEFORMA_CLIENT_API_PROXY_TARGET ??
  process.env.NEXT_PUBLIC_VEFORMA_CLIENT_API_URL

export default defineConfig([
  {
    root: '.',
    input: {
      path: `${apiBaseUrl}/docs/openapi.json`,
    },
    output: {
      path: './src/http/veforma-client-api',
      clean: true,
      barrelType: 'named',
      format: false,
      lint: false,
      // sem ".ts" nos imports: o tsconfig do Next não tem allowImportingTsExtensions
      extension: {
        '.ts': '',
      },
    },
    hooks: {
      done: ['pnpm exec biome check --write ./src/http/veforma-client-api'],
    },
    plugins: [
      pluginOas(),
      pluginTs({ output: { path: 'types' } }),
      reactQueryPlugin('@/http/api-client'),
    ],
  },
])
