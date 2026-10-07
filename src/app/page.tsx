import Link from 'next/link'
import { getFacets, getStore, listCategories, listProducts, listSucatas } from '@/lib/api'
import { whatsappLink } from '@/lib/format'
import { marcaPath } from '@/lib/slug'
import { cidadeDe } from '@/lib/seo'
import { ProductCardView } from '@/components/product-card'
import { SucataCardView } from '@/components/sucata-card'
import { CarFilter } from '@/components/car-filter'
import { Carousel } from '@/components/carousel'
import { TrustBanner } from '@/components/trust-banner'
import { DepartmentsGrid } from '@/components/departments'

export default async function Home() {
  const store = await getStore()
  const [categories, destaques, facets, sucatas] = await Promise.all([
    listCategories(store.slug),
    listProducts(store.slug, { limit: 8 }),
    getFacets(store.slug),
    store.has_sucatas ? listSucatas(store.slug, 1, 3) : Promise.resolve(null),
  ])
  const wa = whatsappLink(store.whatsapp, store.whatsapp_message)

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-text">
            {store.tagline && <div className="small" style={{ opacity: .8, letterSpacing: 1, textTransform: 'uppercase' }}>{store.tagline}</div>}
            <h1>{store.hero_title}</h1>
            {store.hero_subtitle && <p style={{ opacity: .85, marginTop: -6, fontSize: 16 }}>{store.hero_subtitle}</p>}
            {store.show_car_finder !== false && <CarFilter facets={facets} />}
          </div>
          <div className={`hero-art${store.banners?.length ? ' has-carousel' : ''}`}>
            {store.banners?.length ? <Carousel banners={store.banners} /> : (store.address || store.name)}
          </div>
        </div>
      </section>

      {/* Banner de Garantia, Envio Rápido e Atendimento */}
      <TrustBanner store={store} />

      {/* Grade de Departamentos Principais */}
      {store.show_departments !== false && <DepartmentsGrid categories={categories} />}

      {/* Destaques do Catálogo */}
      <section className="sec soft">
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="h2" style={{ margin: 0 }}>Peças em Destaque</h2>
            <Link href="/produtos" className="btn ghost sm">Ver todas →</Link>
          </div>
          {destaques.products.length === 0 ? (
            <p className="muted">Nenhuma peça disponível no momento.</p>
          ) : (
            <div className="grid">
              {destaques.products.map((p) => (
                <ProductCardView key={p.id} product={p} whatsapp={store.whatsapp} storeName={store.name} trust={store.trust} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sucatas / Carros em Desmanche */}
      {sucatas && sucatas.sucatas.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <h2 className="h2">Carros em Desmontagem / Sucatas</h2>
            <p className="muted" style={{ marginTop: -8, marginBottom: 16 }}>
              Veículos no pátio aguardando desmontagem. Consulte e solicite a peça que você precisa diretamente.
            </p>
            <div className="grid">{sucatas.sucatas.map((s) => <SucataCardView key={s.id} sucata={s} />)}</div>
            <p style={{ marginTop: 18 }}><Link href="/sucatas" className="btn ghost">Ver todas as sucatas →</Link></p>
          </div>
        </section>
      )}

      {/* Marcas Atendidas */}
      {facets.montadoras.length > 0 && (
        <section className="sec soft">
          <div className="wrap">
            <h2 className="h2">Peças por Marca{store.city ? ` em ${cidadeDe(store)}` : ''}</h2>
            <div className="filters">
              {facets.montadoras.slice(0, 16).map((m) => <Link key={m.name} href={marcaPath(m.name)} className="chip">{m.name}</Link>)}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action WhatsApp */}
      {wa && (
        <section className="cta">
          <div className="wrap">
            <div>
              <b>Não encontrou a peça que precisa?</b>
              <span style={{ opacity: .8, display: 'block', fontSize: 14 }}>Fale diretamente com nossa equipe de vendas no WhatsApp. Procuramos no estoque para você!</span>
            </div>
            <a className="btn wa" href={wa} target="_blank" rel="noopener noreferrer">💬 Chamar no WhatsApp</a>
          </div>
        </section>
      )}
    </main>
  )
}
