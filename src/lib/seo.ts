import { headers } from 'next/headers'
import type { ProductCard, ProductDetail, Store } from '@/lib/api'
import { money, semPreco, years } from '@/lib/format'

/** Endereço público do site que está sendo visitado (domínio da empresa), para links canônicos, sitemap e dados estruturados. */
export async function siteOrigin(): Promise<string> {
  const h = await headers()
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost').split(',')[0].trim().toLowerCase()
  const local = host.startsWith('localhost') || host.startsWith('127.0.0.1')
  const proto = local ? 'http' : (h.get('x-forwarded-proto') ?? 'https').split(',')[0].trim()
  return `${proto}://${host.replace(/^www\./, '')}`
}

/** Corta no limite sem partir palavra. */
export const cortar = (texto: string, max: number): string => {
  const t = texto.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const c = t.slice(0, max - 1)
  return `${c.slice(0, Math.max(c.lastIndexOf(' '), max - 20))}…`
}

export const cidadeDe = (store: Store): string => [store.city, store.state].filter(Boolean).join(' - ')

/** Título da aba/busca: "Lanterna traseira Mobi usada em Dourados - MS" (a loja entra pelo template do layout). */
export function tituloPeca(p: ProductCard, store: Store): string {
  const cond = p.condition === 'usado' ? ' usada' : p.condition === 'novo' ? ' nova' : ''
  const onde = store.city ? ` em ${store.city}` : ''
  return cortar(`${p.title}${cond}${onde}`, 62)
}

/** Descrição para o resultado de busca e o compartilhamento (até ~155 letras). */
export function descricaoPeca(p: ProductDetail, store: Store): string {
  const carro = [p.montadora, p.model, years(p)].filter(Boolean).join(' ')
  const preco = semPreco(p.price) ? 'Consulte o preço pelo WhatsApp.' : `Por ${money(p.price)}.`
  const garantia = p.warranty_days ? ` Garantia de ${p.warranty_days} dias.` : ''
  const onde = store.city ? ` ${store.name}, ${cidadeDe(store)}.` : ` ${store.name}.`
  return cortar(`${p.title}${carro ? ` para ${carro}` : ''}. ${preco}${garantia}${onde}`, 158)
}

/** JSON-LD seguro para ir dentro de <script>: o "<" é escapado para o texto nunca fechar a tag. */
export const jsonLd = (dados: unknown): string => JSON.stringify(dados).replace(/</g, '\\u003c')

/** Telefone em formato internacional (+55...) a partir do WhatsApp da loja (só dígitos). */
export const telefoneIntl = (whatsapp: string | null): string | undefined => {
  const d = (whatsapp ?? '').replace(/\D/g, '')
  return d.length >= 12 ? `+${d}` : undefined
}
