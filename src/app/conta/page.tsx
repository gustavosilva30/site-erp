import Link from 'next/link'
import { STAGE_LABEL, portalGet, requireMe, type PortalOrder } from '@/lib/portal-data'
import { money } from '@/lib/format'
import { findStore } from '@/lib/api'
import { PortalSucataCta } from '@/components/portal-sucata-cta'

export default async function Conta() {
  const { token, me } = await requireMe()
  const store = await findStore()
  const r = await portalGet<{ orders: PortalOrder[] }>(token, '/orders')
  const todos = r?.orders ?? []
  const recentes = todos.slice(0, 5)
  const emAndamento = todos.filter((o) => ['aguardando_aprovacao', 'aprovado', 'pago'].includes(o.stage)).length
  const primeiro = me.name.trim().split(/\s+/)[0] || me.name
  return (
    <main className="wrap sec">
      <section className="phero">
        <h1>Bem-vindo, {primeiro}!</h1>
        <p>Veja o que temos em estoque, monte o seu pedido e acompanhe tudo por aqui. A loja analisa o pedido e combina pagamento e entrega com você.</p>
        <div className="row" style={{ marginTop: 16 }}>
          <Link href="/conta/produtos" className="btn light">Ver produtos</Link>
          {emAndamento > 0 && <Link href="/conta/pedidos?filtro=andamento" className="btn ghostlight">{emAndamento} pedido(s) em andamento</Link>}
        </div>
      </section>

      {store?.has_sucatas && <PortalSucataCta />}

      <div className="ptiles">
        <Link href="/conta/produtos" className="ptile"><span className="ico" aria-hidden>🔎</span><strong>Produtos</strong><span>Busque por peça, código ou carro.</span></Link>
        <Link href="/conta/carrinho" className="ptile"><span className="ico" aria-hidden>🛒</span><strong>Meu pedido</strong><span>Revise e envie o que você escolheu.</span></Link>
        <Link href="/conta/pedidos" className="ptile"><span className="ico" aria-hidden>📋</span><strong>Meus pedidos</strong><span>Acompanhe o andamento e repita pedidos.</span></Link>
      </div>

      <div className="psec-head"><h2>Últimos pedidos</h2>{todos.length > 5 && <Link href="/conta/pedidos" className="small">Ver todos</Link>}</div>
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
