import { portalCall, sameOrigin, setPortalCookie } from '@/lib/portal'

/** Definir a senha pelo link do convite (uso único). Já abre a sessão. */
export async function POST(req: Request) {
  if (!(await sameOrigin(req))) return Response.json({ error: 'Pedido não autorizado.' }, { status: 403 })
  const body = await req.json().catch(() => null)
  const r = await portalCall<{ token: string; customer: { name: string } }>('/set-password', {
    method: 'POST',
    body: { token: typeof body?.token === 'string' ? body.token.slice(0, 80) : '', password: typeof body?.password === 'string' ? body.password.slice(0, 200) : '' },
  })
  if (!r.data) return Response.json({ error: r.error }, { status: r.status })
  await setPortalCookie(r.data.token)
  return Response.json({ ok: true, name: r.data.customer.name })
}
