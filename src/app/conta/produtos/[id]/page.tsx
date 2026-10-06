import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStore } from '@/lib/api'
import { capitalize, mensagemConsultaPortal, money, whatsappLink, years } from '@/lib/format'
import { portalGet, requireMe, type PortalProductDetail } from '@/lib/portal-data'
import { PortalAdd } from '@/components/portal-add'
import { PortalGallery } from '@/components/portal-gallery'

export const metadata: Metadata = { title: 'Produto', robots: { index: false, follow: false } }

/** Informações completas do produto para o cliente logado, com a foto grande e o botão de pedir (ou de falar com a loja). */
export default async function ContaProduto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { token, me } = await requireMe()
  const p = await portalGet<PortalProductDetail>(token, `/products/${encodeURIComponent(id.slice(0, 255))}`)
  if (!p) notFound()
  const store = await getStore()
  // Servidor antigo pode nao mandar estes campos: a pagina nunca quebra por isso.
  const fotos = Array.isArray(p.photos) ? p.photos : []
  const compat = Array.isArray(p.compatibility) ? p.compatibility : []
  const consulta = p.consult ? whatsappLink(store.whatsapp, mensagemConsultaPortal(store.name, p)) : null
  const ano = years(p)
  const linhas: [string, string][] = ([
    ['Código', p.sku ?? ''],
    ['Número da peça', p.part_number ?? ''],
    ['Condição', p.condition ? capitalize(p.condition) : ''],
    ['Categoria', p.category ? capitalize(p.category) : ''],
    ['Montadora', p.montadora ?? ''],
    ['Modelo', p.model ?? ''],
    ['Ano', ano],
    ['Marca da peça', p.brand ?? ''],
    ['Motor', p.engine ?? ''],
    ['Garantia', p.warranty_days ? `${p.warranty_days} dias` : ''],
    ['Disponível', `${p.available} unidade(s)`],
  ] as [string, string][]).filter(([, v]) => v)

  return (
    <main className="wrap sec">
      <p className="muted small"><Link href="/conta/produtos">← Voltar aos produtos</Link></p>
      <div className="detail">
        <PortalGallery photos={fotos} alt={p.title} />
        <div>
          <h1>{p.title}</h1>
          <div className="pbuy">
          {p.consult ? (
            <>
              <span className="price">Consulte a loja</span>
              <p className="muted small">Esta peça está sem preço cadastrado. Fale com a loja para saber o valor.</p>
              {consulta
                ? <a className="btn wa" href={consulta} target="_blank" rel="noopener noreferrer">Falar com a loja</a>
                : <p className="muted small">Fale com a loja para saber o valor.</p>}
            </>
          ) : (
            <>
              <span className="price">
                {me.discount_percent > 0 && p.price_with_discount < p.price && <span className="muted small" style={{ textDecoration: 'line-through', marginRight: 8, fontSize: 16 }}>{money(p.price)}</span>}
                {money(p.price_with_discount)}
              </span>
              {me.discount_percent > 0 && p.price_with_discount < p.price && <p className="muted small">Seu desconto de {me.discount_percent}% já está aplicado.</p>}
              <PortalAdd product={p} />
            </>
          )}
          </div>

          <table className="specs" style={{ marginTop: 18 }}>
            <tbody>
              {linhas.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}
            </tbody>
          </table>

          {p.description && <p style={{ whiteSpace: 'pre-line', marginTop: 16 }}>{p.description}</p>}

          {compat.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <strong>Serve nestes veículos</strong>
              <ul className="compatlist">
                {compat.map((c, k) => (
                  <li key={k}>{[c.brand, c.model].filter(Boolean).join(' ')}{years({ year_start: c.year_start, year_end: c.year_end }) ? ` ${years({ year_start: c.year_start, year_end: c.year_end })}` : ''}{c.engine ? ` · motor ${c.engine}` : ''}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
