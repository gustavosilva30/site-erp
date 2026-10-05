import Link from 'next/link'
import type { Metadata } from 'next'
import { getStore, listCategories, listProducts } from '@/lib/api'
import { capitalize } from '@/lib/format'
import { ProductCardView } from '@/components/product-card'

export const metadata: Metadata = { title: 'Peças' }

type Search = { q?: string; marca?: string; modelo?: string; category?: string; page?: string }
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function Produtos({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams
  const sp: Search = { q: one(raw.q), marca: one(raw.marca), modelo: one(raw.modelo), category: one(raw.category), page: one(raw.page) }
  const store = await getStore()
  // "Qual é o seu carro?" vira busca por marca + modelo.
  const q = [sp.q, sp.marca, sp.modelo].filter(Boolean).join(' ').trim().slice(0, 80)
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)
  const [categories, result] = await Promise.all([
    listCategories(store.slug),
    listProducts(store.slug, { q, category: sp.category, page, limit: 24 }),
  ])
  const pages = Math.max(1, Math.ceil(result.total / result.limit))
  const href = (p: number, category = sp.category) => {
    const qs = new URLSearchParams()
    if (q) qs.set('q', q)
    if (category) qs.set('category', category)
    if (p > 1) qs.set('page', String(p))
    const s = qs.toString()
    return s ? `/produtos?${s}` : '/produtos'
  }

  return (
    <main className="wrap sec">
      <h1 className="h2">{q ? `Resultados para "${q}"` : capitalize(sp.category) || 'Todas as peças'} <span className="muted small">({result.total})</span></h1>
      <div className="filters">
        <Link href={href(1, '')} className={`chip${!sp.category ? ' on' : ''}`}>Todas</Link>
        {categories.slice(0, 20).map((c) => (
          <Link key={c.name} href={href(1, c.name)} className={`chip${sp.category === c.name ? ' on' : ''}`}>{capitalize(c.name)}</Link>
        ))}
      </div>
      {result.products.length === 0
        ? <p className="muted">Nenhuma peça encontrada. Fale com a gente pelo WhatsApp que procuramos para você.</p>
        : <div className="grid">{result.products.map((p) => <ProductCardView key={p.id} product={p} whatsapp={store.whatsapp} storeName={store.name} />)}</div>}
      {pages > 1 && (
        <div className="pager">
          {page > 1 && <Link className="btn ghost sm" href={href(page - 1)}>Anterior</Link>}
          <span className="muted small" style={{ alignSelf: 'center' }}>Página {page} de {pages}</span>
          {page < pages && <Link className="btn ghost sm" href={href(page + 1)}>Próxima</Link>}
        </div>
      )}
    </main>
  )
}
