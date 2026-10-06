import Link from 'next/link'
import { notFound } from 'next/navigation'
import { STAGE_LABEL, portalGet, requireMe, type PortalOrder } from '@/lib/portal-data'
import { money } from '@/lib/format'
import { CancelOrderButton } from '@/components/portal-forms'
import { RepeatOrderButton } from '@/components/portal-repeat'

type Raw = Record<string, string | string[] | undefined>

export default async function ContaPedido({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Raw> }) {
  const { id } = await params
  const raw = await searchParams
  const { token } = await requireMe()
  const o = await portalGet<PortalOrder>(token, `/orders/${encodeURIComponent(id.slice(0, 255))}`)
  if (!o) notFound()
  const etapa = STAGE_LABEL[o.stage]
  return (
    <main className="wrap sec">
      {raw.novo && <p className="okbox" role="status">Pedido enviado! A loja vai analisar e falar com você para combinar o pagamento e a entrega.</p>}
      <p className="muted small"><Link href="/conta/pedidos">← Meus pedidos</Link></p>
      <h1 className="h2">Pedido {o.number} <span className={`pill ${o.stage}`}>{etapa.text}</span></h1>
      <p className="muted">{etapa.hint}</p>
      {o.approval_note && <p className="alert">Motivo informado pela loja: {o.approval_note}</p>}
      <ol className="timeline" aria-label="Andamento do pedido">
        {o.events.map((e) => (
          <li key={e.key} className={e.key}><strong>{e.label}</strong> <span className="muted small">{new Date(e.at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span></li>
        ))}
      </ol>
      {o.items.map((i, k) => (
        <div className="cartrow" key={`${i.product_id}-${k}`}>
          <div className="ph">{i.photo && <img src={i.photo} alt="" />}</div>
          <div>
            <div className="title">{i.description}</div>
            <div className="muted small">{i.quantity} × {money(i.unit_price)}{i.sku ? ` · cód. ${i.sku}` : ''}</div>
          </div>
          <div className="price">{money(i.quantity * i.unit_price)}</div>
        </div>
      ))}
      <div style={{ textAlign: 'right', marginTop: 14 }}>
        {o.discount_total > 0 && <p className="muted small">Desconto: {money(o.discount_total)}</p>}
        <p className="price">Total {money(o.total)}</p>
      </div>
      {o.notes && <p className="muted small">{o.notes}</p>}
      {o.items.some((i) => i.product_id) && <div style={{ marginTop: 16 }}><RepeatOrderButton items={o.items} /></div>}
      {o.stage === 'aguardando_aprovacao' && (
        <div style={{ marginTop: 16 }}>
          <p className="muted small">Reservado até {new Date(o.expires_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}.</p>
          <CancelOrderButton id={o.id} />
        </div>
      )}
    </main>
  )
}
