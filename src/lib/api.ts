import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

/**
 * Acesso ao catalogo publico do ERP. Roda SO no servidor da loja: o endereco do ERP nao vai para o navegador.
 * A loja e descoberta pelo dominio visitado (dominio proprio da empresa) e, em desenvolvimento, pelo apelido padrao.
 */
const ERP = (process.env.ERP_API_URL ?? 'http://localhost:3001').replace(/\/$/, '')

export interface Banner {
  id: string
  image_url: string
  alt: string
  link_url: string | null
}

export interface StoreTrust {
  shipping_text: string | null
  installments_max: number | null
  installments_no_interest: boolean
  pix_discount_percent: number | null
  default_warranty_days: number | null
  credential_text: string | null
  show_original_badge: boolean
  tax_id: string | null
}

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
  /** Endereço mostrado no rodapé (o digitado na loja ou o do cadastro da empresa) e a consulta do mapa. */
  full_address: string
  map_query: string
  /** Quais textos legais a empresa preencheu (a chave é a da URL). */
  policies?: Record<string, boolean>
  banners?: Banner[]
  city: string | null
  state: string | null
  /** Código do Google Search Console e link das avaliações (opcionais, definidos pela empresa). */
  google_verification: string | null
  google_reviews_url: string | null
  /** A empresa colocou alguma sucata no site. */
  has_sucatas: boolean
  /** A empresa ligou o portal do cliente (login e pedidos). */
  portal_enabled: boolean
  show_departments?: boolean
  show_car_finder?: boolean
  /** Informações de confiança e condições comerciais configuradas pela empresa. */
  trust?: StoreTrust
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
  warranty_days?: number | null
}

export interface ProductDetail extends ProductCard {
  description: string | null
  part_number: string | null
  engine: string | null
  warranty_days: number | null
  photos: string[]
  in_stock: boolean
  updated_at: string | null
  related: ProductCard[]
  compatibility: { brand: string | null; model: string; year_start: number | null; year_end: number | null; engine: string | null }[]
  /** Sucata de origem da peça, quando a empresa a colocou no site. */
  sucata: { id: string; title: string } | null
}

export interface SucataCard {
  id: string
  title: string
  brand: string | null
  model: string | null
  year: string
  color: string | null
  fuel: string | null
  engine: string | null
  photo: string | null
  parts_count: number
  updated_at: string | null
}

export interface SucataDetail extends SucataCard {
  photos: string[]
  parts: ProductCard[]
}

export interface Facets {
  montadoras: { name: string; total: number }[]
  models: { montadora: string; name: string; total: number }[]
}

export interface SitemapData {
  products: { id: string; title: string; updated_at: string | null }[]
  sucatas: { id: string; title: string; updated_at: string | null }[]
}

async function get<T>(path: string, revalidate = 60): Promise<T | null> {
  const res = await fetch(`${ERP}/api/public/store/${path}`, { next: { revalidate } })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`O ERP respondeu ${res.status}`)
  return (await res.json()) as T
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])

/** Loja do dominio visitado, ou null se nao houver loja ativa para ele. */
export async function findStore(): Promise<Store | null> {
  const h = await headers()
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? '').split(':')[0].toLowerCase()
  const padrao = process.env.DEFAULT_STORE_SLUG
  return LOCAL_HOSTS.has(host) && padrao
    ? get<Store>(encodeURIComponent(padrao))
    : get<Store>(`by-domain/${encodeURIComponent(host)}`)
}

/** Loja do dominio visitado; sem loja, a pagina de "nao encontrada". */
export async function getStore(): Promise<Store> {
  const loja = await findStore()
  if (!loja) notFound()
  return loja
}

export async function listProducts(slug: string, params: { q?: string; category?: string; categories?: string[]; condition?: string; price_min?: number; price_max?: number; montadora?: string; model?: string; year?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams()
  if (params.q) qs.set('q', params.q)
  if (params.category) qs.set('category', params.category)
  if (params.categories?.length) {
    for (const c of params.categories) qs.append('categories', c)
  }
  if (params.condition) qs.set('condition', params.condition)
  if (params.price_min !== undefined) qs.set('price_min', String(params.price_min))
  if (params.price_max !== undefined) qs.set('price_max', String(params.price_max))
  if (params.montadora) qs.set('montadora', params.montadora)
  if (params.model) qs.set('model', params.model)
  if (params.year) qs.set('year', params.year)
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

export async function getFacets(slug: string): Promise<Facets> {
  return (await get<Facets>(`${encodeURIComponent(slug)}/facets`, 120)) ?? { montadoras: [], models: [] }
}

export async function listSucatas(slug: string, page = 1, limit = 24) {
  const r = await get<{ sucatas: SucataCard[]; total: number; page: number; limit: number }>(`${encodeURIComponent(slug)}/sucatas?page=${page}&limit=${limit}`, 60)
  return r ?? { sucatas: [], total: 0, page: 1, limit }
}

export async function getSucata(slug: string, id: string) {
  return get<SucataDetail>(`${encodeURIComponent(slug)}/sucatas/${encodeURIComponent(id)}`, 60)
}

export async function getSitemapData(slug: string): Promise<SitemapData> {
  return (await get<SitemapData>(`${encodeURIComponent(slug)}/sitemap`, 300)) ?? { products: [], sucatas: [] }
}

export async function getPolicy(slug: string, key: string) {
  return get<{ key: string; title: string; text: string }>(`${encodeURIComponent(slug)}/policies/${encodeURIComponent(key)}`, 60)
}
