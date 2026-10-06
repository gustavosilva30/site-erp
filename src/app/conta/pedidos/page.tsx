import Link from 'next/link'
import { STAGE_LABEL, portalGet, requireMe, type PortalOrder, type PortalStage } from '@/lib/portal-data'
import { money } from '@/lib/format'

type Raw = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

const GRUPOS: { key: string; label: string; stages: PortalStage[] }[] = [
  { key: 'andamento', label: 'Em andamento', stages: ['aguardando_aprovacao', 'aprovado', 'pago'] },
  { key: 'concluidos', label: 'Concluídos', stages: ['retirado'] },
  { key: 'encerrados', label: 'Cancelados e recusados', stages: ['cancelado', 'recusado', 'expirado'] },
]

export default async function ContaPedidos({ searchParams }: { searchParams: Promise<Raw> }) {
  const raw = await searchParams
  const { token } = await requireMe()
  const r = await portalGet<{ orders: PortalOrder[] }>(token, '/orders')
  const todos = r?.orders ?? []
  const filtro = GRUPOS.find((g) => g.key === one(raw.filtro))
  const orders = filtro ? todos.filter((o) => filtro.stages.includes(o.stage)) : todos
  const contagem = (g: (typeof GRUPOS)[number]) => todos.filter((o) => g.stages.includes(o.stage)).length
  return (
    <main className="wrap sec">
      <h1 className="h2">Meus pedidos</h1>
      <div className="filters">
        <Link href="/conta/pedidos" className={`chip${!filtro ? ' on' : ''}`}>Todos ({todos.length})</Link>
        {GRUPOS.map((g) => (
          <Link key={g.key} href={`/conta/pedidos?filtro=${g.key}`} className={`chip${filtro?.key === g.key ? ' on' : ''}`}>{g.label} ({contagem(g)})</Link>
        ))}
      </div>
      {orders.length === 0 && (
        <>
          <p className="muted">{todos.length === 0 ? 'Você ainda não fez nenhum pedido.' : 'Nenhum pedido neste grupo.'}</p>
          {todos.length === 0 && <Link href="/conta/produtos" className="btn">Ver produtos</Link>}
        </>
      )}
      {orders.map((o) => (
        <Link key={o.id} href={`/conta/pedidos/${encodeURIComponent(o.id)}`} className="prow">
          <span><strong>{o.number}</strong> <span className="muted small">{new Date(o.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span></span>
          <span className={`pill ${o.stage}`}>{STAGE_LABEL[o.stage].text}</span>
          <span className="price">{money(o.total)}</span>
        </Link>
      ))}
    </main>
  )
}
