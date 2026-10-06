import Link from 'next/link'
import { STAGE_LABEL, portalGet, requireMe, type PortalOrder } from '@/lib/portal-data'
import { money } from '@/lib/format'

export default async function Conta() {
  const { token, me } = await requireMe()
  const r = await portalGet<{ orders: PortalOrder[] }>(token, '/orders')
  const recentes = (r?.orders ?? []).slice(0, 5)
  return (
    <main className="wrap sec">
      <h1 className="h2">Olá, {me.name.split(' ')[0]}!</h1>
      <p className="muted">Veja os produtos disponíveis e faça o seu pedido. A loja analisa e combina o pagamento e a entrega com você.</p>
      <div className="row" style={{ margin: '14px 0 22px' }}>
        <Link href="/conta/produtos" className="btn">Ver produtos</Link>
        <Link href="/conta/pedidos" className="btn ghost">Meus pedidos</Link>
      </div>
      <h2 className="h2" style={{ fontSize: 18 }}>Últimos pedidos</h2>
      {recentes.length === 0 && <p className="muted">Você ainda não fez nenhum pedido.</p>}
      {recentes.map((o) => (
        <Link key={o.id} href={`/conta/pedidos/${encodeURIComponent(o.id)}`} className="prow">
          <span><strong>{o.number}</strong> <span className="muted small">{new Date(o.created_at).toLocaleDateString('pt-BR')}</span></span>
          <span className={`pill ${o.stage}`}>{STAGE_LABEL[o.stage].text}</span>
          <span className="price">{money(o.total)}</span>
        </Link>
      ))}
    </main>
  )
}
