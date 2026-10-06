import { clearPortalCookie, portalCall, portalToken, sameOrigin } from '@/lib/portal'

/** Sair: encerra a sessão no ERP e apaga o cookie. */
export async function POST(req: Request) {
  if (!(await sameOrigin(req))) return Response.json({ error: 'Pedido não autorizado.' }, { status: 403 })
  const token = await portalToken()
  if (token) await portalCall('/logout', { method: 'POST', token })
  await clearPortalCookie()
  return Response.json({ ok: true })
}
