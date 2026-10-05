import type { MetadataRoute } from 'next'
import { findStore, getFacets, getSitemapData, listCategories } from '@/lib/api'
import { categoriaPath, marcaPath, pecaPath, sucataPath } from '@/lib/slug'
import { siteOrigin } from '@/lib/seo'
import { LEGAL_PAGES } from '@/components/footer'

/**
 * Mapa do site de CADA loja: o endereço é o do domínio visitado e a lista vem só do que a vitrine mostra (peças com foto e
 * estoque, sucatas escolhidas pela empresa). Sem loja ativa para o domínio, o mapa fica vazio.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const store = await findStore()
  if (!store) return []
  const origem = await siteOrigin()
  const [dados, categorias, facets] = await Promise.all([getSitemapData(store.slug), listCategories(store.slug), getFacets(store.slug)])
  const url = (caminho: string) => `${origem}${caminho}`
  const quando = (d: string | null) => (d ? new Date(d) : undefined)

  const lista: MetadataRoute.Sitemap = [
    { url: url('/'), changeFrequency: 'daily', priority: 1 },
    { url: url('/produtos'), changeFrequency: 'daily', priority: 0.9 },
  ]
  if (store.has_sucatas) lista.push({ url: url('/sucatas'), changeFrequency: 'daily', priority: 0.8 })
  for (const c of categorias) lista.push({ url: url(categoriaPath(c.name)), changeFrequency: 'daily', priority: 0.7 })
  for (const m of facets.montadoras) lista.push({ url: url(marcaPath(m.name)), changeFrequency: 'daily', priority: 0.7 })
  for (const m of facets.models.slice(0, 400)) lista.push({ url: url(marcaPath(m.montadora, m.name)), changeFrequency: 'daily', priority: 0.6 })
  for (const p of dados.products) lista.push({ url: url(pecaPath(p)), lastModified: quando(p.updated_at), changeFrequency: 'weekly', priority: 0.6 })
  for (const s of dados.sucatas) lista.push({ url: url(sucataPath(s)), lastModified: quando(s.updated_at), changeFrequency: 'weekly', priority: 0.6 })
  for (const l of LEGAL_PAGES) if (store.policies?.[l.slug]) lista.push({ url: url(`/politicas/${l.slug}`), changeFrequency: 'yearly', priority: 0.2 })
  return lista
}
