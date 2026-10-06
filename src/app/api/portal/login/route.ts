import { findStore } from '@/lib/api'
import { portalCall, sameOrigin, setPortalCookie } from '@/lib/portal'

/** Entrar: o site descobre a loja pelo domínio visitado e pede o login ao ERP; o token fica só no cookie httpOnly. */
export async function POST(req: Request) {
  if (!(await sameOrigin(req))) return Response.json({ error: 'Pedido não autorizado.' }, { status: 403 })
  const store = await findStore()
  if (!store || !store.portal_enabled) return Response.json({ error: 'O portal não está disponível nesta loja.' }, { status: 404 })
  const body = await req.json().catch(() => null)
  const r = await portalCall<{ token: string; customer: { name: string } }>(`/${encodeURIComponent(store.slug)}/login`, {
    method: 'POST',
    body: { login: typeof body?.login === 'string' ? body.login.slice(0, 120) : '', password: typeof body?.password === 'string' ? body.password.slice(0, 200) : '' },
  })
  if (!r.data) return Response.json({ error: r.error }, { status: r.status === 502 ? 502 : r.status })
  await setPortalCookie(r.data.token)
  return Response.json({ ok: true, name: r.data.customer.name })
}
