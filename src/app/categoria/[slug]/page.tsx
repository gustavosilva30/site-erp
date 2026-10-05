import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getStore, listCategories, listProducts } from '@/lib/api'
import { capitalize } from '@/lib/format'
import { categoriaPath, slugify } from '@/lib/slug'
import { cidadeDe, cortar, siteOrigin } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import { Breadcrumb, Pager } from '@/components/listing'
import { ProductCardView } from '@/components/product-card'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }

const nomeDaCategoria = async (storeSlug: string, slug: string) => (await listCategories(storeSlug)).find((c) => slugify(c.name) === slug) ?? null

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const { page } = await searchParams
  const store = await getStore()
  const cat = await nomeDaCategoria(store.slug, slug)
  if (!cat) return { title: 'Categoria não encontrada', robots: { index: false } }
  const nome = capitalize(cat.name)
  const onde = store.city ? ` em ${store.city}` : ''
  const n = Math.max(1, Number.parseInt(page ?? '1', 10) || 1)
  return {
    title: cortar(`${nome}: peças usadas${onde}${n > 1 ? ` - página ${n}` : ''}`, 62),
    description: cortar(`${cat.total} ${cat.total === 1 ? 'peça' : 'peças'} de ${nome.toLowerCase()} com foto na ${store.name}${store.city ? `, ${cidadeDe(store)}` : ''}. Chame no WhatsApp e confirme a disponibilidade.`, 158),
    alternates: { canonical: n > 1 ? `${categoriaPath(cat.name)}?page=${n}` : categoriaPath(cat.name) },
  }
}

export default async function Categoria({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const store = await getStore()
  const cat = await nomeDaCategoria(store.slug, slug)
  if (!cat) notFound()
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)
  const result = await listProducts(store.slug, { category: cat.name, page, limit: 24 })
  const pages = Math.max(1, Math.ceil(result.total / result.limit))
  const origem = await siteOrigin()
  const nome = capitalize(cat.name)
  const trilha = [{ label: 'Início', href: '/' }, { label: 'Peças', href: '/produtos' }, { label: nome }]

  return (
    <main className="wrap sec">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trilha.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.label, ...(t.href ? { item: `${origem}${t.href}` } : {}) })),
      }} />
      <Breadcrumb items={trilha} />
      <h1 className="h2">{nome}: peças usadas{store.city ? ` em ${store.city}` : ''} <span className="muted small">({result.total})</span></h1>
      <p className="muted">Veja as peças de {nome.toLowerCase()} disponíveis na {store.name}. Todas com foto; é só chamar no WhatsApp para confirmar a disponibilidade.</p>
      {result.products.length === 0
        ? <p className="muted">Nenhuma peça desta categoria no momento.</p>
        : <div className="grid">{result.products.map((p) => <ProductCardView key={p.id} product={p} whatsapp={store.whatsapp} storeName={store.name} />)}</div>}
      <Pager page={page} pages={pages} hrefFor={(n) => (n > 1 ? `${categoriaPath(cat.name)}?page=${n}` : categoriaPath(cat.name))} />
    </main>
  )
}
