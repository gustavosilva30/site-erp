import type { NextConfig } from 'next'

const config: NextConfig = {
  poweredByHeader: false,
  output: 'standalone',
  async redirects() {
    // www.dominio -> dominio: um só endereço por loja (o Google trata www e sem www como sites diferentes).
    return [
      { source: '/:path*', has: [{ type: 'host', value: 'www.(?<dominio>.+)' }], destination: 'https://:dominio/:path*', permanent: true },
      // Quem digita "veiculos" quer a lista de sucatas; temporário (não é o endereço oficial da página).
      { source: '/veiculos', destination: '/sucatas', permanent: false },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default config
