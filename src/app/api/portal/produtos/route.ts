import { clearPortalCookie, portalCall, portalToken, sameOrigin } from '@/lib/portal'
import type { PortalProduct } from '@/lib/portal-data'

/** Produtos pelo id, para "repetir pedido": devolve só os que ainda estão disponíveis para o cliente, com o preço dele. */
export async function POST(req: Request) {
  if (!(await sameOrigin(req))) return Response.json({ error: 'Pedido não autorizado.' }, { status: 403 })
  const token = await portalToken()
  if (!token) return Response.json({ error: 'Entre novamente.', code: 'PORTAL_AUTH' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const ids = Array.isArray(body?.ids) ? body.ids.slice(0, 60).map((x: unknown) => String(x ?? '').slice(0, 255)) : []
  const r = await portalCall<{ products: PortalProduct[] }>('/products/by-ids', { method: 'POST', token, body: { ids } })
  if (r.status === 401) await clearPortalCookie()
  if (!r.data) return Response.json({ error: r.error }, { status: r.status })
  return Response.json({ products: r.data.products })
}
