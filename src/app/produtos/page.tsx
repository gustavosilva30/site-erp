import Link from 'next/link'
import type { Metadata } from 'next'
import { getFacets, getStore, listCategories, listProducts } from '@/lib/api'
import { capitalize } from '@/lib/format'
import { CarFilter } from '@/components/car-filter'
import { Pager } from '@/components/listing'
import { ProductCardView } from '@/components/product-card'
import { ProductSidebar } from '@/components/product-sidebar'

type Raw = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export async function generateMetadata({ searchParams }: { searchParams: Promise<Raw> }): Promise<Metadata> {
  const raw = await searchParams
  const filtrada = ['q', 'marca', 'modelo', 'category', 'categories', 'condition', 'price_min', 'price_max', 'montadora', 'model', 'year', 'page'].some((k) => raw[k] !== undefined)
  return { title: 'Peças', alternates: { canonical: '/produtos' }, ...(filtrada ? { robots: { index: false, follow: true } } : {}) }
}

export default async function Produtos({ searchParams }: { searchParams: Promise<Raw> }) {
  const raw = await searchParams
  const rawCategories = raw.categories
  const categoriesList = Array.isArray(rawCategories)
    ? rawCategories.filter(Boolean)
    : typeof rawCategories === 'string' && rawCategories
    ? [rawCategories]
    : undefined

  const sp = {
    q: one(raw.q),
    marca: one(raw.marca),
    modelo: one(raw.modelo),
    category: one(raw.category),
    condition: one(raw.condition),
    price_min: one(raw.price_min),
    price_max: one(raw.price_max),
    montadora: one(raw.montadora),
    model: one(raw.model),
    year: one(raw.year),
    page: one(raw.page),
  }

  const store = await getStore()
  const q = [sp.q, sp.marca, sp.modelo].filter(Boolean).join(' ').trim().slice(0, 80)
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)

  const [categories, facets, result] = await Promise.all([
    listCategories(store.slug),
    getFacets(store.slug),
    listProducts(store.slug, {
      q,
      category: sp.category,
      categories: categoriesList,
      condition: sp.condition,
      price_min: sp.price_min ? Number(sp.price_min) : undefined,
      price_max: sp.price_max ? Number(sp.price_max) : undefined,
      montadora: sp.montadora,
      model: sp.model,
      year: sp.year,
      page,
      limit: 24,
    }),
  ])

  const pages = Math.max(1, Math.ceil(result.total / result.limit))
  const carro = [sp.montadora, sp.model, sp.year].filter(Boolean).join(' ')

  const href = (p: number) => {
    const qs = new URLSearchParams()
    if (q) qs.set('q', q)
    if (sp.category) qs.set('category', sp.category)
    if (categoriesList?.length) {
      for (const c of categoriesList) qs.append('categories', c)
    }
    if (sp.condition) qs.set('condition', sp.condition)
    if (sp.price_min) qs.set('price_min', sp.price_min)
    if (sp.price_max) qs.set('price_max', sp.price_max)
    if (sp.montadora) qs.set('montadora', sp.montadora)
    if (sp.model) qs.set('model', sp.model)
    if (sp.year) qs.set('year', sp.year)
    if (p > 1) qs.set('page', String(p))
    const s = qs.toString()
    return s ? `/produtos?${s}` : '/produtos'
  }

  const tituloPagina = q
    ? `Resultados para "${q}"`
    : carro
    ? `Peças para ${carro}`
    : categoriesList?.length
    ? `Departamento (${categoriesList.length} categorias)`
    : capitalize(sp.category) || 'Todas as peças'

  return (
    <main className="wrap sec">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <h1 className="h2" style={{ margin: 0 }}>
          {tituloPagina} <span className="muted small">({result.total} {result.total === 1 ? 'peça encontrada' : 'peças encontradas'})</span>
        </h1>
      </div>

      {/* Seletor rápido de compatibilidade por veiculo (estilo garagem) */}
      <CarFilter facets={facets} atual={{ montadora: sp.montadora, model: sp.model, year: sp.year }} compacto />

      {/* Layout Principal: Barra Lateral de Filtros + Grade de Produtos */}
      <div className="catalog-layout">
        <ProductSidebar
          categories={categories}
          facets={facets}
          current={{
            q,
            category: sp.category,
            categories: categoriesList,
            condition: sp.condition,
            price_min: sp.price_min,
            price_max: sp.price_max,
            montadora: sp.montadora,
            model: sp.model,
            year: sp.year,
          }}
        />

        <div className="catalog-main">
          {result.products.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--soft)', borderRadius: 16, border: '1px dashed var(--line)' }}>
              <p className="muted" style={{ fontSize: 16, margin: '0 0 12px' }}>
                Nenhuma peça encontrada com os filtros selecionados.
              </p>
              <Link href="/produtos" className="btn ghost sm">
                Limpar filtros e ver catálogo completo
              </Link>
            </div>
          ) : (
            <>
              <div className="grid">
                {result.products.map((p) => (
                  <ProductCardView key={p.id} product={p} whatsapp={store.whatsapp} storeName={store.name} trust={store.trust} />
                ))}
              </div>
              <Pager page={page} pages={pages} hrefFor={href} />
            </>
          )}
        </div>
      </div>
    </main>
  )
}
