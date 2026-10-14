/**
 * Estatísticas de visita da loja (roda só no navegador). Cada ação do visitante vira um evento que vai, em lotes, para /api/t
 * (rota deste mesmo site), e dali para o ERP, onde o dono da loja vê o painel.
 *
 * Privacidade (LGPD):
 *  - Nada que identifique a pessoa: sem nome, telefone, e-mail ou IP. O que a pessoa digitou na busca vai só como texto da busca.
 *  - O "visitante" é um código aleatório gravado neste navegador, e SÓ se a pessoa aceitou os cookies opcionais. Sem o aceite (ou com
 *    "não rastrear" ligado no navegador) os eventos seguem sem código: contam nos totais, mas não ligam uma visita à outra.
 *  - A área do cliente (/conta, /entrar) nunca é registrada.
 *  - `?notrack=1` no endereço desliga o registro neste navegador (para o time da loja não contar nas próprias estatísticas).
 */
export type TrackType =
  | 'page_view' | 'product_view' | 'sucata_view' | 'category_view' | 'search' | 'product_click' | 'add_to_cart' | 'cart_view'
  | 'whatsapp_click' | 'phone_click' | 'map_click' | 'social_click' | 'banner_click' | 'ui_click'

export interface TrackEvent {
  type: TrackType
  path?: string
  product_id?: string
  sucata_id?: string
  label?: string
  value?: number
}

const ENDPOINT = '/api/t'
const KEY_VISITOR = 'loja-vid'
const KEY_SESSION = 'loja-sess'
const KEY_OPTOUT = 'loja-notrack'
const IDLE_MS = 30 * 60_000
const MAX_BATCH = 10
const FLUSH_MS = 1500

let optional = false
let queue: TrackEvent[] = []
let timer: ReturnType<typeof setTimeout> | null = null

const read = (k: string): string | null => { try { return localStorage.getItem(k) } catch { return null } }
const write = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* sem armazenamento: segue sem identificar */ } }
const drop = (k: string) => { try { localStorage.removeItem(k) } catch { /* ignora */ } }

const novoId = (): string => {
  const b = new Uint8Array(12)
  crypto.getRandomValues(b)
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
}

/** O navegador pediu para não ser rastreado? */
const naoRastrear = () => typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true)

/** Liga/desliga a identificação (cookies opcionais aceitos). Ao desligar, apaga os códigos já gravados. */
export function setAnalyticsConsent(aceitou: boolean) {
  optional = aceitou && !naoRastrear()
  if (!optional) { drop(KEY_VISITOR); drop(KEY_SESSION) }
}

/** `?notrack=1` desliga o registro neste navegador; `?notrack=0` liga de novo. */
export function aplicarNoTrack() {
  const v = new URLSearchParams(location.search).get('notrack')
  if (v === '1') { write(KEY_OPTOUT, '1'); drop(KEY_VISITOR); drop(KEY_SESSION) }
  else if (v === '0') drop(KEY_OPTOUT)
}

const desligado = () => read(KEY_OPTOUT) === '1'

interface Sessao { id: string; last: number; source: string | null; campaign: string | null }

/** De onde a visita veio: utm_source, ou o site de onde clicou (se não for este mesmo site). */
function origemDaVisita(): { source: string | null; campaign: string | null } {
  const q = new URLSearchParams(location.search)
  const utm = q.get('utm_source')
  let ref: string | null = null
  try { const h = document.referrer ? new URL(document.referrer).host : ''; if (h && h !== location.host) ref = h } catch { /* referrer inválido */ }
  return { source: (utm || ref || '').slice(0, 120) || null, campaign: (q.get('utm_campaign') || '').slice(0, 80) || null }
}

/** Visita atual (vence após 30 min parado). Só existe para quem aceitou os cookies opcionais. */
function identificar(): { visitor_id: string; session_id: string; source: string | null; campaign: string | null } | null {
  if (!optional) return null
  let visitor = read(KEY_VISITOR)
  if (!visitor || !/^[a-f0-9]{24}$/.test(visitor)) { visitor = novoId(); write(KEY_VISITOR, visitor) }
  const agora = Date.now()
  let s: Sessao | null = null
  try { s = JSON.parse(read(KEY_SESSION) ?? 'null') } catch { s = null }
  if (!s || typeof s.id !== 'string' || agora - Number(s.last) > IDLE_MS) s = { id: novoId(), last: agora, ...origemDaVisita() }
  s.last = agora
  write(KEY_SESSION, JSON.stringify(s))
  return { visitor_id: visitor, session_id: s.id, source: s.source, campaign: s.campaign }
}

export function flush() {
  if (timer) { clearTimeout(timer); timer = null }
  if (queue.length === 0) return
  const events = queue.splice(0, MAX_BATCH)
  if (queue.length > 0) timer = setTimeout(flush, FLUSH_MS)
  const body = JSON.stringify({ ...(identificar() ?? {}), events })
  try {
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'application/json' }))) return
  } catch { /* cai no fetch */ }
  fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => { /* estatística nunca atrapalha a loja */ })
}

/** Registra um evento. Vai junto com os próximos, em até 1,5 s. */
export function track(ev: TrackEvent) {
  if (typeof window === 'undefined' || desligado()) return
  queue.push({ ...ev, path: ev.path ?? location.pathname })
  if (queue.length >= MAX_BATCH) flush()
  else if (!timer) timer = setTimeout(flush, FLUSH_MS)
}

// ---- Leitura do endereço ----

/** Páginas que nunca são registradas (área do cliente). */
export const ignorada = (path: string) => path.startsWith('/conta') || path.startsWith('/entrar')

const ID = '([A-Za-z0-9_%-]{1,100})'
const dec = (v: string) => { try { return decodeURIComponent(v) } catch { return v } }

/** O produto da página (/peca/<apelido>/<id> ou /produto/<id>), se for uma. */
export function produtoDoCaminho(path: string): string | undefined {
  const m = path.match(new RegExp(`^/peca/[^/]+/${ID}/?$`)) ?? path.match(new RegExp(`^/produto/${ID}/?$`))
  return m ? dec(m[1]) : undefined
}

/** Eventos que a própria página já diz que aconteceram (além da visualização da página). */
export function eventosDaPagina(path: string, search: string): TrackEvent[] {
  const out: TrackEvent[] = []
  const produto = produtoDoCaminho(path)
  if (produto) out.push({ type: 'product_view', path, product_id: produto })
  const sucata = path.match(new RegExp(`^/sucata/[^/]+/${ID}/?$`))
  if (sucata) out.push({ type: 'sucata_view', path, sucata_id: dec(sucata[1]) })
  const categoria = path.match(/^\/categoria\/([^/]+)\/?$/)
  if (categoria) out.push({ type: 'category_view', path, label: dec(categoria[1]).replace(/-/g, ' ') })
  const marca = path.match(/^\/marca\/([^/]+)(?:\/([^/]+))?\/?$/)
  if (marca) out.push({ type: 'category_view', path, label: [marca[1], marca[2]].filter(Boolean).map((x) => dec(x!).replace(/-/g, ' ')).join(' ') })
  if (path === '/carrinho') out.push({ type: 'cart_view', path })
  if (path === '/produtos') {
    const cat = new URLSearchParams(search).get('category')
    if (cat) out.push({ type: 'category_view', path, label: cat.slice(0, 80) })
  }
  return out
}
