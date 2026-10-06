import Link from 'next/link'
import { mensagemConsultaPortal, money, whatsappLink, years } from '@/lib/format'
import type { PortalProduct } from '@/lib/portal-data'
import { PortalAdd } from '@/components/portal-add'

/** Cartão de produto do portal (catálogo e peças de uma sucata): foto, título, preço do cliente, estoque e botão de pedir ou de falar com a loja. */
export function PortalProductCard({ p, descontoPercent, loja }: { p: PortalProduct; descontoPercent: number; loja: { name: string; whatsapp: string | null } }) {
  const detalhe = `/conta/produtos/${encodeURIComponent(p.id)}`
  const zap = p.consult ? whatsappLink(loja.whatsapp, mensagemConsultaPortal(loja.name, p)) : null
  const comDesconto = descontoPercent > 0 && p.price_with_discount < p.price
  return (
    <article className="pcard">
      <Link className="pimg" href={detalhe} aria-label={`Ver detalhes de ${p.title}`}>
        {p.photo ? <img src={p.photo} alt={p.title} loading="lazy" /> : <span className="nophoto">Sem foto</span>}
        {p.consult ? <span className="tag consult">Sob consulta</span> : comDesconto ? <span className="tag">-{descontoPercent}%</span> : null}
      </Link>
      <div className="pbody">
        <Link className="ptitle" href={detalhe}>{p.title}</Link>
        <div className="pmeta">{[p.montadora, p.model, years(p)].filter(Boolean).join(' · ')}</div>
        {p.sku && <div className="pmeta">cód. {p.sku}</div>}
        <div className="pprice">
          {p.consult ? <span className="now consult">Consulte a loja</span> : (
            <>
              {comDesconto && <span className="old">{money(p.price)}</span>}
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
}
