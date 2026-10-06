import { clearPortalCookie, portalCall, portalToken, sameOrigin } from '@/lib/portal'

/**
 * Enviar o pedido. Do navegador só saem produto e quantidade (mais a preferência e uma observação): preço, desconto e total
 * são calculados no ERP. O pedido chega como "aguardando aprovação" e reserva o estoque.
 */
export async function POST(req: Request) {
  if (!(await sameOrigin(req))) return Response.json({ error: 'Pedido não autorizado.' }, { status: 403 })
  const token = await portalToken()
  if (!token) return Response.json({ error: 'Entre novamente para enviar o pedido.', code: 'PORTAL_AUTH' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const items = Array.isArray(body?.items)
    ? body.items.slice(0, 60).map((i: { product_id?: unknown; quantity?: unknown }) => ({ product_id: String(i?.product_id ?? '').slice(0, 255), quantity: Number(i?.quantity) }))
    : []
  const r = await portalCall<{ id: string; number: string }>('/orders', {
    method: 'POST', token,
    body: { items, fulfillment: body?.fulfillment === 'entrega' ? 'entrega' : 'retirada', notes: typeof body?.notes === 'string' ? body.notes.slice(0, 500) : '' },
  })
  if (r.status === 401) await clearPortalCookie()
  if (!r.data) return Response.json({ error: r.error, code: r.code }, { status: r.status })
  return Response.json({ ok: true, id: r.data.id, number: r.data.number }, { status: 201 })
}
