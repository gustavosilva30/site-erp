import Link from 'next/link'
import { getStore } from '@/lib/api'
import { capitalize, mensagemConsultaPortal, money, whatsappLink, years } from '@/lib/format'
import { portalGet, requireMe, type PortalProduct } from '@/lib/portal-data'
import { PortalAdd } from '@/components/portal-add'

type Raw = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** Catálogo do cliente: só o que tem estoque agora, com o preço dele (desconto já aplicado). */
export default async function ContaProdutos({ searchParams }: { searchParams: Promise<Raw> }) {
  const raw = await searchParams
  const q = (one(raw.q) ?? '').slice(0, 80)
  const category = (one(raw.category) ?? '').slice(0, 80)
  const page = Math.max(1, Number.parseInt(one(raw.page) ?? '1', 10) || 1)
  const { token, me } = await requireMe()
  const store = await getStore()

  const qs = new URLSearchParams()
  if (q) qs.set('q', q)
  if (category) qs.set('category', category)
  qs.set('page', String(page)); qs.set('limit', '24')
  const [lista, cats] = await Promise.all([
    portalGet<{ products: PortalProduct[]; total: number; page: number; limit: number }>(token, `/products?${qs}`),
    portalGet<{ categories: { name: string; n: number }[] }>(token, '/categories'),
  ])
  const products = lista?.products ?? []
  const total = lista?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / (lista?.limit ?? 24)))
  const href = (p: number, c = category) => {
    const s = new URLSearchParams()
    if (q) s.set('q', q)
    if (c) s.set('category', c)
    if (p > 1) s.set('page', String(p))
    const t = s.toString()
    return t ? `/conta/produtos?${t}` : '/conta/produtos'
  }

  return (
    <main className="wrap sec">
      <h1 className="h2">Produtos disponíveis <span className="muted small">({total})</span></h1>
      <form action="/conta/produtos" className="search" role="search" style={{ marginBottom: 12 }}>
        <input name="q" defaultValue={q} placeholder="Buscar peça, código ou carro" aria-label="Buscar peça" maxLength={80} />
        {category && <input type="hidden" name="category" value={category} />}
        <button className="btn sm" type="submit">Buscar</button>
      </form>
      <div className="filters">
        <Link href={href(1, '')} className={`chip${!category ? ' on' : ''}`}>Todas</Link>
        {(cats?.categories ?? []).slice(0, 24).map((c) => (
          <Link key={c.name} href={href(1, c.name)} className={`chip${category === c.name ? ' on' : ''}`}>{capitalize(c.name)}</Link>
        ))}
      </div>

      {products.length === 0 && <p className="muted">Nenhum produto disponível com esse filtro.</p>}
      <div className="grid">
        {products.map((p) => (
          <div className="card" key={p.id}>
            <div className="ph">{p.photo ? <img src={p.photo} alt={p.title} loading="lazy" /> : 'Sem foto'}</div>
            <div className="t">{p.title}</div>
            <div className="m">{[p.montadora, p.model, years(p)].filter(Boolean).join(' · ')}{p.sku ? ` · cód. ${p.sku}` : ''}</div>
            <div className="m">{p.available} disponível(is)</div>
            {p.consult ? (
              // Sem preço: não vai para o pedido. O cliente chama a loja já com a peça na mensagem.
              <>
                <div className="p"><span className="price">Consulte a loja</span></div>
                {whatsappLink(store.whatsapp, mensagemConsultaPortal(store.name, p))
                  ? <a className="btn wa sm" style={{ marginTop: 8 }} href={whatsappLink(store.whatsapp, mensagemConsultaPortal(store.name, p))!} target="_blank" rel="noopener noreferrer">Falar com a loja</a>
                  : <span className="muted small" style={{ marginTop: 8 }}>Fale com a loja para saber o valor.</span>}
              </>
            ) : (
              <>
                <div className="p">
                  <span>
                    {me.discount_percent > 0 && p.price_with_discount < p.price && <span className="muted small" style={{ textDecoration: 'line-through', marginRight: 6 }}>{money(p.price)}</span>}
                    <span className="price">{money(p.price_with_discount)}</span>
                  </span>
                </div>
                <PortalAdd product={p} />
              </>
            )}
          </div>
        ))}
      </div>

      {pages > 1 && (
        <nav className="pager" aria-label="Páginas">
          {page > 1 && <Link href={href(page - 1)} className="btn ghost sm">Anterior</Link>}
          <span className="muted small">Página {page} de {pages}</span>
          {page < pages && <Link href={href(page + 1)} className="btn ghost sm">Próxima</Link>}
        </nav>
      )}
    </main>
  )
}
