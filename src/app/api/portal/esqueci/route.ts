import { findStore } from '@/lib/api'
import { portalCall, sameOrigin } from '@/lib/portal'

/**
 * "Esqueci a senha": pede o link ao ERP, que o manda pelo WhatsApp cadastrado do cliente. A resposta é sempre a mesma,
 * exista o login ou não (ninguém descobre quem é cliente); o link nunca passa por aqui.
 */
export async function POST(req: Request) {
  if (!(await sameOrigin(req))) return Response.json({ error: 'Pedido não autorizado.' }, { status: 403 })
  const store = await findStore()
  if (!store || !store.portal_enabled) return Response.json({ error: 'O portal não está disponível nesta loja.' }, { status: 404 })
  const body = await req.json().catch(() => null)
  const r = await portalCall(`/${encodeURIComponent(store.slug)}/forgot`, {
    method: 'POST',
    body: { login: typeof body?.login === 'string' ? body.login.slice(0, 120) : '' },
  })
  // Só o limite de tentativas e a falha do ERP aparecem; fora isso a resposta é neutra.
  if (r.status === 429 || r.status === 502) return Response.json({ error: r.error }, { status: r.status })
  return Response.json({ ok: true })
}
