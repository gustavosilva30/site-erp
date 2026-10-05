import Link from 'next/link'
import { getFacets, getStore, listCategories, listProducts, listSucatas } from '@/lib/api'
import { capitalize, whatsappLink } from '@/lib/format'
import { categoriaPath, marcaPath } from '@/lib/slug'
import { cidadeDe } from '@/lib/seo'
import { ProductCardView } from '@/components/product-card'
import { SucataCardView } from '@/components/sucata-card'
import { CarFilter } from '@/components/car-filter'
import { Carousel } from '@/components/carousel'

export default async function Home() {
  const store = await getStore()
  const [categories, destaques, facets, sucatas] = await Promise.all([
    listCategories(store.slug),
    listProducts(store.slug, { limit: 6 }),
    getFacets(store.slug),
    store.has_sucatas ? listSucatas(store.slug, 1, 3) : Promise.resolve(null),
  ])
  const wa = whatsappLink(store.whatsapp, store.whatsapp_message)

  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div className="hero-text">
            {store.tagline && <div className="small" style={{ opacity: .7, letterSpacing: 1 }}>{store.tagline.toUpperCase()}</div>}
            <h1>{store.hero_title}</h1>
            {store.hero_subtitle && <p style={{ opacity: .8, marginTop: -6 }}>{store.hero_subtitle}</p>}
            <CarFilter facets={facets} />
          </div>
          <div className={`hero-art${store.banners?.length ? ' has-carousel' : ''}`}>
            {store.banners?.length ? <Carousel banners={store.banners} /> : (store.address || store.name)}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <h2 className="h2">Categorias</h2>
            <div className="cats">
              {categories.slice(0, 8).map((c) => (
                <Link key={c.name} href={categoriaPath(c.name)} className="cat">
                  <div className="ph">{capitalize(c.name)}</div>
                  <div className="n">{c.total} {c.total === 1 ? 'peça' : 'peças'}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="sec soft">
        <div className="wrap">
          <h2 className="h2">Destaques</h2>
          {destaques.products.length === 0
            ? <p className="muted">Nenhuma peça disponível no momento.</p>
            : <div className="grid">{destaques.products.map((p) => <ProductCardView key={p.id} product={p} whatsapp={store.whatsapp} storeName={store.name} />)}</div>}
          <p style={{ marginTop: 18 }}><Link href="/produtos" className="btn ghost">Ver todas as peças</Link></p>
        </div>
      </section>

      {sucatas && sucatas.sucatas.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <h2 className="h2">Carros em desmanche</h2>
            <p className="muted">Veja os veículos que temos e as peças de cada um.</p>
            <div className="grid">{sucatas.sucatas.map((s) => <SucataCardView key={s.id} sucata={s} />)}</div>
            <p style={{ marginTop: 18 }}><Link href="/sucatas" className="btn ghost">Ver todas as sucatas</Link></p>
          </div>
        </section>
      )}

      {facets.montadoras.length > 0 && (
        <section className="sec soft">
          <div className="wrap">
            <h2 className="h2">Peças por marca{store.city ? ` em ${cidadeDe(store)}` : ''}</h2>
            <div className="filters">
              {facets.montadoras.slice(0, 16).map((m) => <Link key={m.name} href={marcaPath(m.name)} className="chip">{m.name}</Link>)}
            </div>
          </div>
        </section>
      )}

      {wa && (
        <section className="cta">
          <div className="wrap">
            <div><b>Não achou a peça?</b><span style={{ opacity: .75 }}>Fale com a gente, procuramos para você.</span></div>
            <a className="btn wa" href={wa} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
          </div>
        </section>
      )}
    </main>
  )
}
