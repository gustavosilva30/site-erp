import Link from 'next/link'
import { getStore, listCategories, listProducts } from '@/lib/api'
import { whatsappLink } from '@/lib/format'
import { ProductCardView } from '@/components/product-card'

export default async function Home() {
  const store = await getStore()
  const [categories, destaques] = await Promise.all([
    listCategories(store.slug),
    listProducts(store.slug, { limit: 6 }),
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
            <form action="/produtos" className="finder">
              <b>Qual é o seu carro?</b>
              <div className="fields">
                <input name="marca" placeholder="Marca (ex.: Fiat)" maxLength={30} aria-label="Marca" />
                <input name="modelo" placeholder="Modelo (ex.: Palio)" maxLength={30} aria-label="Modelo" />
              </div>
              <button className="btn" type="submit">Ver peças</button>
            </form>
          </div>
          <div className="hero-art">{store.address || store.name}</div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <h2 className="h2">Categorias</h2>
            <div className="cats">
              {categories.slice(0, 8).map((c) => (
                <Link key={c.name} href={`/produtos?category=${encodeURIComponent(c.name)}`} className="cat">
                  <div className="ph">{c.name}</div>
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
            : <div className="grid">{destaques.products.map((p) => <ProductCardView key={p.id} product={p} />)}</div>}
          <p style={{ marginTop: 18 }}><Link href="/produtos" className="btn ghost">Ver todas as peças</Link></p>
        </div>
      </section>

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
