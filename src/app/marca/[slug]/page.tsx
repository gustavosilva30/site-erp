import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getFacets, getStore, listProducts } from '@/lib/api'
import { marcaPath, slugify } from '@/lib/slug'
import { cidadeDe, cortar, siteOrigin } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import { Breadcrumb, Pager } from '@/components/listing'
import { ProductCardView } from '@/components/product-card'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }

async function achar(slug: string) {
  const store = await getStore()
  const facets = await getFacets(store.slug)
  const marca = facets.montadoras.find((m) => slugify(m.name) === slug) ?? null
  return { store, facets, marca }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const { page } = await searchParams
  const { store, marca } = await achar(slug)
  if (!marca) return { title: 'Marca não encontrada', robots: { index: false } }
  const n = Math.max(1, Number.parseInt(page ?? '1', 10) || 1)
  return {
    title: cortar(`Peças usadas ${marca.name}${store.city ? ` em ${store.city}` : ''}${n > 1 ? ` - página ${n}` : ''}`, 62),
    description: cortar(`${marca.total} ${marca.total === 1 ? 'peça' : 'peças'} usadas para ${marca.name} na ${store.name}${store.city ? `, ${cidadeDe(store)}` : ''}. Veja as fotos e chame no WhatsApp.`, 158),
    alternates: { canonical: n > 1 ? `${marcaPath(marca.name)}?page=${n}` : marcaPath(marca.name) },
  }
}

export default async function Marca({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const { store, facets, marca } = await achar(slug)
  if (!marca) notFound()
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)
  const result = await listProducts(store.slug, { montadora: marca.name, page, limit: 24 })
  const pages = Math.max(1, Math.ceil(result.total / result.limit))
  const modelos = facets.models.filter((m) => m.montadora.toLowerCase() === marca.name.toLowerCase())
  const origem = await siteOrigin()
  const trilha = [{ label: 'Início', href: '/' }, { label: 'Peças', href: '/produtos' }, { label: marca.name }]

  return (
    <main className="wrap sec">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trilha.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.label, ...(t.href ? { item: `${origem}${t.href}` } : {}) })),
      }} />
      <Breadcrumb items={trilha} />
      <h1 className="h2">Peças usadas {marca.name}{store.city ? ` em ${store.city}` : ''} <span className="muted small">({result.total})</span></h1>
      <p className="muted">Peças para {marca.name} na {store.name}. Escolha o modelo ou veja todas abaixo.</p>
      {modelos.length > 0 && (
        <div className="filters">
          {modelos.slice(0, 40).map((m) => <Link key={m.name} className="chip" href={marcaPath(marca.name, m.name)}>{m.name} <span className="muted small">({m.total})</span></Link>)}
        </div>
      )}
      {result.products.length === 0
        ? <p className="muted">Nenhuma peça no momento.</p>
        : <div className="grid">{result.products.map((p) => <ProductCardView key={p.id} product={p} whatsapp={store.whatsapp} storeName={store.name} />)}</div>}
      <Pager page={page} pages={pages} hrefFor={(n) => (n > 1 ? `${marcaPath(marca.name)}?page=${n}` : marcaPath(marca.name))} />
    </main>
  )
}
