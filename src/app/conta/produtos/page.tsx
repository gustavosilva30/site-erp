import Link from 'next/link'
import { getStore } from '@/lib/api'
import { capitalize, mensagemConsultaPortal, money, whatsappLink, years } from '@/lib/format'
import { portalGet, requireMe, type PortalProduct } from '@/lib/portal-data'
import { PortalAdd } from '@/components/portal-add'

type Raw = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** Quantas categorias aparecem como botão; as outras ficam em "Mais categorias" (nunca um muro de botões). */
const CATEGORIAS_VISIVEIS = 8

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
    // Sugestões de categoria: com busca, as que têm peça no resultado (as que combinam com o nome primeiro).
    portalGet<{ categories: { name: string; n: number }[] }>(token, `/categories${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  ])
  const products = lista?.products ?? []
  const total = lista?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / (lista?.limit ?? 24)))
  // Mesmo com um servidor antigo que devolvesse a lista inteira, a tela nunca mostra mais que isso.
  const categorias = (cats?.categories ?? []).slice(0, 30)
  const visiveis = categorias.slice(0, CATEGORIAS_VISIVEIS)
  const restantes = categorias.slice(CATEGORIAS_VISIVEIS)
  const href = (p: number, c = category) => {
    const s = new URLSearchParams()
    if (q) s.set('q', q)
    if (c) s.set('category', c)
    if (p > 1) s.set('page', String(p))
    const t = s.toString()
    return t ? `/conta/produtos?${t}` : '/conta/produtos'
  }
  const chip = (c: { name: string; n: number }) => (
    <Link key={c.name} href={href(1, c.name)} className={`chip${category === c.name ? ' on' : ''}`}>{capitalize(c.name)} <span className="cnt">{c.n}</span></Link>
  )

  return (
    <main className="wrap sec">
      <div className="psec-head">
        <h1 className="h2" style={{ margin: 0 }}>Produtos disponíveis</h1>
        <span className="muted small">{total} {total === 1 ? 'peça' : 'peças'}</span>
      </div>

      <form action="/conta/produtos" className="psearch" role="search">
        <input name="q" defaultValue={q} placeholder="Buscar peça, código ou carro (ex.: porta diant esq palio)" aria-label="Buscar peça" maxLength={80} />
        {category && <input type="hidden" name="category" value={category} />}
        <button className="btn" type="submit">Buscar</button>
      </form>

      {(q || category) && (
        <p className="pfound">
          {total} resultado(s){q ? <> para <strong>&quot;{q}&quot;</strong></> : null}{category ? <> em <strong>{capitalize(category)}</strong></> : null}
          {' · '}<Link href="/conta/produtos">limpar filtros</Link>
        </p>
      )}

      {(categorias.length > 0 || category) && (
        <>
          {q && categorias.length > 0 && <p className="suggest">Categorias com resultado:</p>}
          <div className="pchips">
            <Link href={href(1, '')} className={`chip${!category ? ' on' : ''}`}>Todas</Link>
            {/* A categoria escolhida fica visível mesmo que não esteja entre as sugeridas. */}
            {category && !categorias.some((c) => c.name === category) && <Link href={href(1, category)} className="chip on">{capitalize(category)}</Link>}
            {visiveis.map(chip)}
            {restantes.length > 0 && (
              <details className="pmore">
                <summary className="chip">Mais categorias ({restantes.length})</summary>
                <div className="pmore-list">{restantes.map(chip)}</div>
              </details>
            )}
          </div>
        </>
      )}

      {products.length === 0 && (
        <div className="pempty">
          <p><strong>Nenhum produto encontrado.</strong></p>
          <p className="muted small">Tente menos palavras, ou outro jeito de escrever (ex.: &quot;parachoque diant&quot;). Não achou a peça? Fale com a loja.</p>
        </div>
      )}

      <div className="pgrid">
        {products.map((p) => {
          const detalhe = `/conta/produtos/${encodeURIComponent(p.id)}`
          const zap = p.consult ? whatsappLink(store.whatsapp, mensagemConsultaPortal(store.name, p)) : null
          return (
            <article className="pcard" key={p.id}>
              <Link className="pimg" href={detalhe} aria-label={`Ver detalhes de ${p.title}`}>
                {p.photo ? <img src={p.photo} alt={p.title} loading="lazy" /> : <span className="nophoto">Sem foto</span>}
                {p.consult ? <span className="tag consult">Sob consulta</span> : me.discount_percent > 0 && p.price_with_discount < p.price ? <span className="tag">-{me.discount_percent}%</span> : null}
              </Link>
              <div className="pbody">
                <Link className="ptitle" href={detalhe}>{p.title}</Link>
                <div className="pmeta">{[p.montadora, p.model, years(p)].filter(Boolean).join(' · ')}</div>
                {p.sku && <div className="pmeta">cód. {p.sku}</div>}
                <div className="pprice">
                  {p.consult ? <span className="now consult">Consulte a loja</span> : (
                    <>
                      {me.discount_percent > 0 && p.price_with_discount < p.price && <span className="old">{money(p.price)}</span>}
                      <span className="now">{money(p.price_with_discount)}</span>
                    </>
                  )}
                </div>
                <div className="pstock">{p.available} {p.available === 1 ? 'disponível' : 'disponíveis'}</div>
              </div>
              <div className="pact">
                {p.consult
                  ? (zap
                      ? <a className="btn wa sm" href={zap} target="_blank" rel="noopener noreferrer">Falar com a loja</a>
                      : <span className="muted small">Fale com a loja para saber o valor.</span>)
                  : <PortalAdd product={p} />}
              </div>
            </article>
          )
        })}
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
