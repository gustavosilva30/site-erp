import Link from 'next/link'
import { getStore } from '@/lib/api'
import { portalGet, requireMe, type PortalProduct } from '@/lib/portal-data'
import { PortalProductCard } from '@/components/portal-product-card'
import { PortalSucataCta } from '@/components/portal-sucata-cta'

type Raw = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/**
 * Catálogo do cliente: só o que tem estoque agora, com o preço dele (desconto já aplicado). A busca entende abreviações
 * ("parachoque dianteiro" acha "parachoque diant") e siglas ("porta de" acha "porta diant esq"); não há lista de categorias:
 * o cliente não conhece o cadastro, então ele busca pelo nome da peça.
 */
export default async function ContaProdutos({ searchParams }: { searchParams: Promise<Raw> }) {
  const raw = await searchParams
  const q = (one(raw.q) ?? '').slice(0, 80)
  const page = Math.max(1, Number.parseInt(one(raw.page) ?? '1', 10) || 1)
  const { token, me } = await requireMe()
  const store = await getStore()

  const qs = new URLSearchParams()
  if (q) qs.set('q', q)
  qs.set('page', String(page)); qs.set('limit', '24')
  const lista = await portalGet<{ products: PortalProduct[]; total: number; page: number; limit: number }>(token, `/products?${qs}`)
  const products = lista?.products ?? []
  const total = lista?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / (lista?.limit ?? 24)))
  const href = (p: number) => {
    const s = new URLSearchParams()
    if (q) s.set('q', q)
    if (p > 1) s.set('page', String(p))
    const t = s.toString()
    return t ? `/conta/produtos?${t}` : '/conta/produtos'
  }

  return (
    <main className="wrap sec">
      <div className="psec-head">
        <h1 className="h2" style={{ margin: 0 }}>Produtos disponíveis</h1>
        <span className="muted small">{total} {total === 1 ? 'peça' : 'peças'}</span>
      </div>

      <form action="/conta/produtos" className="psearch" role="search">
        <input name="q" defaultValue={q} placeholder="Buscar peça, código ou carro (ex.: porta diant esq palio)" aria-label="Buscar peça" maxLength={80} />
        <button className="btn" type="submit">Buscar</button>
      </form>

      {q && (
        <p className="pfound">
          {total} resultado(s) para <strong>&quot;{q}&quot;</strong> · <Link href="/conta/produtos">limpar busca</Link>
        </p>
      )}

      {store.has_sucatas && !q && <PortalSucataCta compacto />}

      {products.length === 0 && (
        <div className="pempty">
          <p><strong>Nenhum produto encontrado.</strong></p>
          <p className="muted small">Tente menos palavras, ou outro jeito de escrever (ex.: &quot;parachoque diant&quot;). Não achou a peça? Fale com a loja.</p>
        </div>
      )}

      <div className="pgrid">
        {products.map((p) => <PortalProductCard key={p.id} p={p} descontoPercent={me.discount_percent} loja={store} />)}
      </div>

      {pages > 1 && (
        <nav className="pager" aria-label="Páginas">
          {page > 1 && <Link href={href(page - 1)} className="btn ghost sm">← Anterior</Link>}
          <span className="muted small">Página {page} de {pages}</span>
          {page < pages && <Link href={href(page + 1)} className="btn ghost sm">Próxima →</Link>}
        </nav>
      )}
    </main>
  )
}
