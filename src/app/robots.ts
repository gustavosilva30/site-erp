import type { MetadataRoute } from 'next'
import { siteOrigin } from '@/lib/seo'

/** Libera tudo que é vitrine e aponta o mapa do site do próprio domínio; carrinho e buscas soltas não precisam ser indexados. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const origem = await siteOrigin()
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/carrinho', '/_next/'] }],
    sitemap: `${origem}/sitemap.xml`,
    host: origem,
  }
}
