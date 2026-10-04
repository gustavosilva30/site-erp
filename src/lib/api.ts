import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

/**
 * Acesso ao catalogo publico do ERP. Roda SO no servidor da loja: o endereco do ERP nao vai para o navegador.
 * A loja e descoberta pelo dominio visitado (dominio proprio da empresa) e, em desenvolvimento, pelo apelido padrao.
 */
const ERP = (process.env.ERP_API_URL ?? 'http://localhost:3001').replace(/\/$/, '')

export interface Store {
  slug: string
  name: string
  logo_url: string | null
  tagline: string
  hero_title: string
  hero_subtitle: string
  whatsapp: string | null
  whatsapp_message: string
  address: string
  hours: string
  instagram: string
  primary_color: string
}

export interface ProductCard {
  id: string
  sku: string | null
  title: string
  price: number
  condition: string | null
  category: string | null
  brand: string | null
  model: string | null
  montadora: string | null
  year_start: number | null
  year_end: number | null
  photo: string | null
}

export interface ProductDetail extends ProductCard {
  description: string | null
  part_number: string | null
  engine: string | null
  warranty_days: number | null
  photos: string[]
  in_stock: boolean
}

async function get<T>(path: string, revalidate = 60): Promise<T | null> {
  const res = await fetch(`${ERP}/api/public/store/${path}`, { next: { revalidate } })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`O ERP respondeu ${res.status}`)
  return (await res.json()) as T
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])

/** Loja do dominio visitado; sem loja, a pagina de "nao encontrada". */
export async function getStore(): Promise<Store> {
  const h = await headers()
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? '').split(':')[0].toLowerCase()
  const padrao = process.env.DEFAULT_STORE_SLUG
  const loja = LOCAL_HOSTS.has(host) && padrao
    ? await get<Store>(encodeURIComponent(padrao))
    : await get<Store>(`by-domain/${encodeURIComponent(host)}`)
  if (!loja) notFound()
  return loja
}

export async function listProducts(slug: string, params: { q?: string; category?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams()
  if (params.q) qs.set('q', params.q)
  if (params.category) qs.set('category', params.category)
  qs.set('page', String(params.page ?? 1))
  qs.set('limit', String(params.limit ?? 24))
  const r = await get<{ products: ProductCard[]; total: number; page: number; limit: number }>(`${encodeURIComponent(slug)}/products?${qs}`, 30)
  return r ?? { products: [], total: 0, page: 1, limit: params.limit ?? 24 }
}

export async function listCategories(slug: string) {
  const r = await get<{ categories: { name: string; total: number }[] }>(`${encodeURIComponent(slug)}/categories`, 120)
  return r?.categories ?? []
}

export async function getProduct(slug: string, id: string) {
  return get<ProductDetail>(`${encodeURIComponent(slug)}/products/${encodeURIComponent(id)}`, 30)
}
