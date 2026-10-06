import { portalCall, portalToken, sameOrigin } from '@/lib/portal'

/** Cancelar o próprio pedido enquanto a loja ainda não aprovou. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await sameOrigin(req))) return Response.json({ error: 'Pedido não autorizado.' }, { status: 403 })
  const token = await portalToken()
  if (!token) return Response.json({ error: 'Entre novamente.', code: 'PORTAL_AUTH' }, { status: 401 })
  const { id } = await ctx.params
  const r = await portalCall(`/orders/${encodeURIComponent(id.slice(0, 255))}/cancel`, { method: 'POST', token })
  if (!r.data) return Response.json({ error: r.error, code: r.code }, { status: r.status })
  return Response.json({ ok: true })
}
