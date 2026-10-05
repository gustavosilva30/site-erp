import Link from 'next/link'
import type { Metadata } from 'next'
import { getFacets, getStore, listCategories, listProducts } from '@/lib/api'
import { capitalize } from '@/lib/format'
import { categoriaPath } from '@/lib/slug'
import { CarFilter } from '@/components/car-filter'
import { Pager } from '@/components/listing'
import { ProductCardView } from '@/components/product-card'

type Raw = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** Lista geral indexável; qualquer busca ou filtro vira página sem indexação (as páginas de categoria e de carro é que ranqueiam). */
export async function generateMetadata({ searchParams }: { searchParams: Promise<Raw> }): Promise<Metadata> {
  const raw = await searchParams
  const filtrada = ['q', 'marca', 'modelo', 'category', 'montadora', 'model', 'year', 'page'].some((k) => one(raw[k]))
  return { title: 'Peças', alternates: { canonical: '/produtos' }, ...(filtrada ? { robots: { index: false, follow: true } } : {}) }
}

export default async function Produtos({ searchParams }: { searchParams: Promise<Raw> }) {
  const raw = await searchParams
  const sp = {
    q: one(raw.q), marca: one(raw.marca), modelo: one(raw.modelo), category: one(raw.category),
    montadora: one(raw.montadora), model: one(raw.model), year: one(raw.year), page: one(raw.page),
  }
  const store = await getStore()
  // Links antigos ("marca"/"modelo" em texto livre) continuam funcionando como busca.
  const q = [sp.q, sp.marca, sp.modelo].filter(Boolean).join(' ').trim().slice(0, 80)
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)
  const [categories, facets, result] = await Promise.all([
    listCategories(store.slug),
    getFacets(store.slug),
    listProducts(store.slug, { q, category: sp.category, montadora: sp.montadora, model: sp.model, year: sp.year, page, limit: 24 }),
  ])
  const pages = Math.max(1, Math.ceil(result.total / result.limit))
  const carro = [sp.montadora, sp.model, sp.year].filter(Boolean).join(' ')
  const href = (p: number) => {
    const qs = new URLSearchParams()
    if (q) qs.set('q', q)
    if (sp.category) qs.set('category', sp.category)
    if (sp.montadora) qs.set('montadora', sp.montadora)
    if (sp.model) qs.set('model', sp.model)
    if (sp.year) qs.set('year', sp.year)
    if (p > 1) qs.set('page', String(p))
    const s = qs.toString()
    return s ? `/produtos?${s}` : '/produtos'
  }

  return (
    <main className="wrap sec">
      <h1 className="h2">
        {q ? `Resultados para "${q}"` : carro ? `Peças para ${carro}` : capitalize(sp.category) || 'Todas as peças'} <span className="muted small">({result.total})</span>
      </h1>
      <CarFilter facets={facets} atual={{ montadora: sp.montadora, model: sp.model, year: sp.year }} compacto />
      <div className="filters">
        <Link href="/produtos" className={`chip${!sp.category ? ' on' : ''}`}>Todas</Link>
        {categories.slice(0, 20).map((c) => (
          <Link key={c.name} href={categoriaPath(c.name)} className="chip">{capitalize(c.name)}</Link>
        ))}
      </div>
      {result.products.length === 0
        ? <p className="muted">Nenhuma peça encontrada. Fale com a gente pelo WhatsApp que procuramos para você.</p>
        : <div className="grid">{result.products.map((p) => <ProductCardView key={p.id} product={p} whatsapp={store.whatsapp} storeName={store.name} />)}</div>}
      <Pager page={page} pages={pages} hrefFor={href} />
    </main>
  )
}
