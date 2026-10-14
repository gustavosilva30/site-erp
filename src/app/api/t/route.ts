import { findStore } from '@/lib/api'
import { sameOrigin } from '@/lib/portal'

/**
 * Recebe as estatísticas de visita do navegador e repassa ao ERP. Fica aqui (e não direto no ERP) para o endereço do ERP não
 * ir para o navegador e para o aparelho ser identificado pelo servidor da loja. A loja vem do domínio visitado; nada do corpo
 * escolhe a empresa. O ERP revalida e limpa tudo de novo, então aqui só se escolhe o que repassar.
 */
const ERP = (process.env.ERP_API_URL ?? 'http://localhost:3001').replace(/\/$/, '')
const MAX_BYTES = 12_000
const ROBO = /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse|headless|monitor|uptime|curl|wget|python|axios|node-fetch|go-http|java\//i

const aparelho = (ua: string): 'mobile' | 'tablet' | 'desktop' => {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'tablet'
  if (/mobi|iphone|ipod|android/i.test(ua)) return 'mobile'
  return 'desktop'
}

const vazio = () => new Response(null, { status: 204 })

export async function POST(req: Request) {
  if (!(await sameOrigin(req))) return new Response(null, { status: 403 })
  const ua = req.headers.get('user-agent') ?? ''
  if (!ua || ROBO.test(ua)) return vazio()

  const texto = await req.text().catch(() => '')
  if (texto.length === 0 || texto.length > MAX_BYTES) return new Response(null, { status: texto.length > MAX_BYTES ? 413 : 204 })
  let corpo: Record<string, unknown> | null = null
  try { corpo = JSON.parse(texto) } catch { return vazio() }
  if (!corpo || typeof corpo !== 'object' || !Array.isArray(corpo.events)) return vazio()

  try {
    const loja = await findStore()
    if (!loja) return vazio()
    await fetch(`${ERP}/api/public/store/${encodeURIComponent(loja.slug)}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'erp-oficina' },
      body: JSON.stringify({
        visitor_id: corpo.visitor_id,
        session_id: corpo.session_id,
        source: corpo.source,
        campaign: corpo.campaign,
        device: aparelho(ua),
        events: (corpo.events as unknown[]).slice(0, 10),
      }),
      cache: 'no-store',
    })
  } catch { /* o ERP fora do ar não pode quebrar a loja */ }
  return vazio()
}
