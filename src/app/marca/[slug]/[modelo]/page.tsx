import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getFacets, getStore, listProducts } from '@/lib/api'
import { marcaPath, slugify } from '@/lib/slug'
import { cidadeDe, cortar, siteOrigin } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import { Breadcrumb, Pager } from '@/components/listing'
import { ProductCardView } from '@/components/product-card'

type Props = { params: Promise<{ slug: string; modelo: string }>; searchParams: Promise<{ page?: string }> }

async function achar(slug: string, modeloSlug: string) {
  const store = await getStore()
  const facets = await getFacets(store.slug)
  const marca = facets.montadoras.find((m) => slugify(m.name) === slug) ?? null
  const modelo = marca ? facets.models.find((m) => m.montadora.toLowerCase() === marca.name.toLowerCase() && slugify(m.name) === modeloSlug) ?? null : null
  return { store, facets, marca, modelo }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, modelo: ms } = await params
  const { page } = await searchParams
  const { store, marca, modelo } = await achar(slug, ms)
  if (!marca || !modelo) return { title: 'Modelo não encontrado', robots: { index: false } }
  const n = Math.max(1, Number.parseInt(page ?? '1', 10) || 1)
  const carro = `${marca.name} ${modelo.name}`
  return {
    title: cortar(`Peças usadas ${carro}${store.city ? ` em ${store.city}` : ''}${n > 1 ? ` - página ${n}` : ''}`, 62),
    description: cortar(`${modelo.total} ${modelo.total === 1 ? 'peça' : 'peças'} usadas para ${carro} na ${store.name}${store.city ? `, ${cidadeDe(store)}` : ''}. Veja as fotos e chame no WhatsApp.`, 158),
    alternates: { canonical: n > 1 ? `${marcaPath(marca.name, modelo.name)}?page=${n}` : marcaPath(marca.name, modelo.name) },
  }
}

export default async function MarcaModelo({ params, searchParams }: Props) {
  const { slug, modelo: ms } = await params
  const sp = await searchParams
  const { store, marca, modelo } = await achar(slug, ms)
  if (!marca || !modelo) notFound()
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)
  const result = await listProducts(store.slug, { montadora: marca.name, model: modelo.name, page, limit: 24 })
  const pages = Math.max(1, Math.ceil(result.total / result.limit))
  const origem = await siteOrigin()
  const carro = `${marca.name} ${modelo.name}`
  const trilha = [{ label: 'Início', href: '/' }, { label: 'Peças', href: '/produtos' }, { label: marca.name, href: marcaPath(marca.name) }, { label: modelo.name }]

  return (
    <main className="wrap sec">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trilha.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.label, ...(t.href ? { item: `${origem}${t.href}` } : {}) })),
      }} />
      <Breadcrumb items={trilha} />
      <h1 className="h2">Peças usadas {carro}{store.city ? ` em ${store.city}` : ''} <span className="muted small">({result.total})</span></h1>
      <p className="muted">Peças para {carro} na {store.name}. <Link className="foot-link" href={marcaPath(marca.name)}>Ver tudo de {marca.name}</Link></p>
      {result.products.length === 0
        ? <p className="muted">Nenhuma peça no momento.</p>
        : <div className="grid">{result.products.map((p) => <ProductCardView key={p.id} product={p} whatsapp={store.whatsapp} storeName={store.name} />)}</div>}
      <Pager page={page} pages={pages} hrefFor={(n) => (n > 1 ? `${marcaPath(marca.name, modelo.name)}?page=${n}` : marcaPath(marca.name, modelo.name))} />
    </main>
  )
}
