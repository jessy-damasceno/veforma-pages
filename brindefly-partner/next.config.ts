import type { NextConfig } from 'next'

// Desenvolvimento local: a client-api de hml só libera CORS para o host de hml.
// Com VEFORMA_CLIENT_API_PROXY_TARGET no .env, /veforma-api/* é repassado pelo
// servidor do Next e o navegador fala same-origin. Em produção fica vazio.
const proxyTarget = process.env.VEFORMA_CLIENT_API_PROXY_TARGET

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
  async rewrites() {
    if (!proxyTarget) return []

    return [
      { source: '/veforma-api/:path*', destination: `${proxyTarget}/:path*` },
    ]
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
