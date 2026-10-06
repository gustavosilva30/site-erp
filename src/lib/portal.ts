import { cookies, headers } from 'next/headers'

/**
 * Portal do cliente: a sessão do cliente é um token do ERP guardado em cookie httpOnly NESTE site (o navegador nunca vê o
 * token nem fala com o ERP). Tudo roda no servidor da loja. A empresa vem do token (conta do cliente), nunca de um campo.
 */
const ERP = (process.env.ERP_API_URL ?? 'http://localhost:3001').replace(/\/$/, '')

export const PORTAL_COOKIE = 'portal_session'
const MAX_AGE = 14 * 24 * 60 * 60

export interface PortalResult<T> { status: number; data: T | null; error: string | null; code: string | null }

export async function portalToken(): Promise<string | null> {
  const v = (await cookies()).get(PORTAL_COOKIE)?.value
  return v && /^[a-f0-9]{64}$/.test(v) ? v : null
}

/** Chama a API do portal no ERP. `token` entra como Bearer; o cabeçalho X-Requested-With é exigido pelo ERP em POST. */
export async function portalCall<T>(path: string, opts: { method?: 'GET' | 'POST'; body?: unknown; token?: string | null } = {}): Promise<PortalResult<T>> {
  try {
    const res = await fetch(`${ERP}/api/public/portal${path}`, {
      method: opts.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'erp-oficina',
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      cache: 'no-store',
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) return { status: res.status, data: null, error: json?.error ?? 'Não foi possível concluir. Tente novamente.', code: json?.code ?? null }
    return { status: res.status, data: json as T, error: null, code: null }
  } catch {
    return { status: 502, data: null, error: 'A loja não respondeu agora. Tente novamente em instantes.', code: null }
  }
}

/** Grava o cookie de sessão (só em route handlers). */
export async function setPortalCookie(token: string) {
  ;(await cookies()).set(PORTAL_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function clearPortalCookie() {
  ;(await cookies()).delete(PORTAL_COOKIE)
}

/**
 * Proteção contra CSRF nas ações do portal: o pedido tem que vir da própria loja (cabeçalho Origin igual ao host).
 * Cookie SameSite=Lax já barra a maioria; esta checagem fecha o resto.
 */
export async function sameOrigin(req: Request): Promise<boolean> {
  const origin = req.headers.get('origin')
  if (!origin) return false
  const h = await headers()
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? '').toLowerCase()
  try { return new URL(origin).host.toLowerCase() === host } catch { return false }
}
