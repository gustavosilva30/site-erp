import Link from 'next/link'
import { getFacets, getStore, listCategories, listProducts, listSucatas } from '@/lib/api'
import { storeContactLink } from '@/lib/format'
import { marcaPath } from '@/lib/slug'
import { cidadeDe } from '@/lib/seo'
import { ProductCardView } from '@/components/product-card'
import { SucataCardView } from '@/components/sucata-card'
import { CarFilter } from '@/components/car-filter'
import { Carousel } from '@/components/carousel'
import { TrustBanner } from '@/components/trust-banner'
import { DepartmentsGrid } from '@/components/departments'
import { ArrowRightIcon, WhatsAppIcon, ShieldCheckIcon, TruckIcon, PackageIcon } from '@/components/icons'
import { DetranBadgeIcon } from '@/components/detran-badge'

export default async function Home() {
  const store = await getStore()
  const [categories, destaques, facets, sucatas] = await Promise.all([
    listCategories(store.slug),
    listProducts(store.slug, { limit: 8 }),
    getFacets(store.slug),
    store.has_sucatas ? listSucatas(store.slug, 1, 3) : Promise.resolve(null),
  ])
  const wa = storeContactLink(store, store.whatsapp_message)

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-text">
            {store.tagline && (
              <div className="hero-tagline-badge">
                <span className="hero-badge-dot" />
                <span>{store.tagline}</span>
              </div>
            )}
            <h1>{store.hero_title}</h1>
            {store.hero_subtitle && (
              <p className="hero-subtitle">{store.hero_subtitle}</p>
            )}
            {store.show_car_finder !== false && <CarFilter facets={facets} />}
          </div>

          <div className={`hero-art${store.banners?.length ? ' has-carousel' : ''}`}>
            {store.banners?.length ? (
              <Carousel banners={store.banners} />
            ) : (
              <div className="hero-fallback-card">
                <div className="fallback-badge">
                  <DetranBadgeIcon className="h-6 w-6" />
                  <span>Desmanche Credenciado</span>
                </div>
                <h3>{store.name}</h3>
                <p className="fallback-desc">
                  Peças automotivas originais, testadas e com procedência comprovada por nota fiscal e baixa no Detran.
                </p>
                <div className="fallback-stats">
                  <div className="stat-item">
                    <ShieldCheckIcon className="stat-icon text-emerald-400" />
                    <span>90 Dias de Garantia</span>
                  </div>
                  <div className="stat-item">
                    <TruckIcon className="stat-icon text-blue-400" />
                    <span>Envio Brasil</span>
                  </div>
                  <div className="stat-item">
                    <PackageIcon className="stat-icon text-amber-400" />
                    <span>Estoque Rastreável</span>
                  </div>
                </div>
              </div>
            )}
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
          <div className="section-header-row">
            <div>
              <h2 className="h2" style={{ margin: 0 }}>Peças em Destaque</h2>
              <p className="muted small" style={{ margin: '4px 0 0' }}>Peças selecionadas com garantia de funcionamento</p>
            </div>
            <Link href="/produtos" className="btn ghost sm view-all-btn">
              <span>Ver todas</span>
              <ArrowRightIcon className="inline-icon" />
            </Link>
          </div>
          {destaques.products.length === 0 ? (
            <div className="empty-notice-card">
              <PackageIcon className="empty-icon" />
              <p className="muted">Nenhuma peça em destaque no momento.</p>
            </div>
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
            <div className="section-header-row">
              <div>
                <h2 className="h2" style={{ margin: 0 }}>Carros em Desmontagem / Sucatas</h2>
                <p className="muted small" style={{ margin: '4px 0 0' }}>
                  Veículos no pátio aguardando desmontagem. Solicite a peça diretamente da sucata doadora.
                </p>
              </div>
              <Link href="/sucatas" className="btn ghost sm view-all-btn">
                <span>Ver todas as sucatas</span>
                <ArrowRightIcon className="inline-icon" />
              </Link>
            </div>
            <div className="grid">{sucatas.sucatas.map((s) => <SucataCardView key={s.id} sucata={s} />)}</div>
          </div>
        </section>
      )}

      {/* Marcas Atendidas */}
      {facets.montadoras.length > 0 && (
        <section className="sec soft">
          <div className="wrap">
            <h2 className="h2">Peças por Marca{store.city ? ` em ${cidadeDe(store)}` : ''}</h2>
            <div className="filters brand-chips-grid">
              {facets.montadoras.slice(0, 16).map((m) => (
                <Link key={m.name} href={marcaPath(m.name)} className="chip brand-chip">
                  <span>{m.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action WhatsApp */}
      {wa && (
        <section className="cta">
          <div className="wrap cta-wrap">
            <div className="cta-content">
              <b>Não encontrou a peça exata que você precisa?</b>
              <span className="cta-sub">
                Nossa equipe de vendas consulta o estoque físico no pátio em tempo real para você!
              </span>
            </div>
            <a className="btn wa cta-btn" href={wa} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="wa-svg-icon" />
              <span>Chamar Vendedor no WhatsApp</span>
            </a>
          </div>
        </section>
      )}
    </main>
  )
}
