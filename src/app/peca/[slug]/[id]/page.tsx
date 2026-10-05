import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getProduct, getStore } from '@/lib/api'
import { mensagemConsulta, money, semPreco, whatsappLink, years } from '@/lib/format'
import { categoriaPath, marcaPath, pecaPath, slugify, sucataPath } from '@/lib/slug'
import { cidadeDe, descricaoPeca, siteOrigin, tituloPeca } from '@/lib/seo'
import { AddToCart } from '@/components/add-to-cart'
import { Gallery } from '@/components/gallery'
import { JsonLd } from '@/components/json-ld'
import { Breadcrumb } from '@/components/listing'
import { ProductCardView } from '@/components/product-card'

type Props = { params: Promise<{ slug: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const store = await getStore()
  const p = await getProduct(store.slug, id)
  if (!p) return { title: 'Peça não encontrada', robots: { index: false } }
  const titulo = tituloPeca(p, store)
  const descricao = descricaoPeca(p, store)
  const caminho = pecaPath(p)
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: caminho },
    openGraph: { title: titulo, description: descricao, url: caminho, siteName: store.name, locale: 'pt_BR', type: 'website', ...(p.photo ? { images: [{ url: p.photo, alt: p.title }] } : {}) },
    twitter: { card: 'summary_large_image', title: titulo, description: descricao, ...(p.photo ? { images: [p.photo] } : {}) },
  }
}

export default async function Peca({ params }: Props) {
  const { slug, id } = await params
  const store = await getStore()
  const p = await getProduct(store.slug, id)
  if (!p) notFound()
  // Um só endereço por peça: se o texto do link estiver diferente (título mudou ou link antigo), vai para o correto.
  if (slug !== (slugify(p.title) || 'peca')) permanentRedirect(pecaPath(p))

  const origem = await siteOrigin()
  const fotos = p.photos.length ? p.photos : p.photo ? [p.photo] : []
  const anos = years(p)
  const consulta = semPreco(p.price)
  const linhas: [string, string | null][] = [
    ['Condição', p.condition === 'usado' ? 'Usado' : p.condition === 'novo' ? 'Novo' : p.condition],
    ['Código', p.sku],
    ['Código da peça', p.part_number],
    ['Marca', p.brand],
    ['Montadora', p.montadora],
    ['Modelo', p.model],
    ['Anos', anos || null],
    ['Motor', p.engine],
    ['Garantia', p.warranty_days ? `${p.warranty_days} dias` : null],
  ]
  const wa = whatsappLink(
    store.whatsapp,
    consulta
      ? mensagemConsulta(store.name, p)
      : `Olá! Vim pelo site da ${store.name} e tenho interesse na peça: ${p.title}${p.sku ? ` (cód. ${p.sku})` : ''} - ${money(p.price)}. Ainda está disponível?`,
  )
  const condicao = p.condition === 'usado' ? 'https://schema.org/UsedCondition' : p.condition === 'novo' ? 'https://schema.org/NewCondition' : undefined
  const url = `${origem}${pecaPath(p)}`

  const trilha: { label: string; href?: string }[] = [
    { label: 'Início', href: '/' },
    { label: 'Peças', href: '/produtos' },
    ...(p.category ? [{ label: p.category, href: categoriaPath(p.category) }] : []),
    { label: p.title },
  ]

  return (
    <main className="wrap detail-page has-sticky">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Product',
            name: p.title,
            image: fotos.length ? fotos : undefined,
            sku: p.sku ?? undefined,
            mpn: p.part_number ?? undefined,
            description: p.description ?? descricaoPeca(p, store),
            brand: p.brand || p.montadora ? { '@type': 'Brand', name: p.brand || p.montadora } : undefined,
            itemCondition: condicao,
            url,
            offers: consulta ? undefined : {
              '@type': 'Offer', url, priceCurrency: 'BRL', price: p.price.toFixed(2), availability: 'https://schema.org/InStock', itemCondition: condicao,
              seller: { '@type': 'Organization', name: store.name },
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: trilha.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.label, ...(t.href ? { item: `${origem}${t.href}` } : {}) })),
          },
        ],
      }} />
      <Breadcrumb items={trilha} />
      <div className="detail">
        <Gallery photos={fotos} alt={p.title} />
        <div>
          <h1>{p.title}</h1>
          <span className="price">{consulta ? 'Consulte a loja' : money(p.price)}</span>
          <div className="row">
            {!consulta && <AddToCart product={p} />}
            {wa && <a className="btn wa" href={wa} target="_blank" rel="noopener noreferrer">{consulta ? 'Consultar preço no WhatsApp' : 'Perguntar no WhatsApp'}</a>}
          </div>

          <ul className="trust" aria-label="Informações da loja">
            {p.warranty_days ? <li>✔ Garantia de {p.warranty_days} dias</li> : null}
            {p.condition === 'usado' && <li>♻ Peça usada, retirada de veículo desmontado</li>}
            {store.google_reviews_url && <li><a href={store.google_reviews_url} target="_blank" rel="noopener noreferrer">★ Ver avaliações no Google</a></li>}
          </ul>

          <table className="specs">
            <tbody>{linhas.filter(([, v]) => v).map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody>
          </table>

          {p.compatibility.length > 0 && (
            <section aria-labelledby="serve-em">
              <h2 id="serve-em" className="h3">Serve em</h2>
              <ul className="compat">
                {p.compatibility.map((c, i) => {
                  const a = c.year_start ? (c.year_end && c.year_end !== c.year_start ? `${c.year_start}-${c.year_end}` : String(c.year_start)) : ''
                  const texto = [c.brand, c.model, a, c.engine].filter(Boolean).join(' ')
                  return <li key={`${texto}-${i}`}>{c.brand ? <Link href={marcaPath(c.brand, c.model)}>{texto}</Link> : texto}</li>
                })}
              </ul>
            </section>
          )}

          {p.description && <p className="muted" style={{ whiteSpace: 'pre-line' }}>{p.description}</p>}
          {p.sucata && <p className="small">Esta peça veio do veículo <Link className="foot-link" href={sucataPath(p.sucata)}>{p.sucata.title}</Link>. Veja as outras peças dele.</p>}
          {(p.montadora || store.city) && (
            <p className="muted small">
              {p.montadora && <><Link className="foot-link" href={p.model ? marcaPath(p.montadora, p.model) : marcaPath(p.montadora)}>Mais peças {[p.montadora, p.model].filter(Boolean).join(' ')}</Link>{store.city ? ' · ' : ''}</>}
              {store.city && <>Atendemos {cidadeDe(store)}.</>}
            </p>
          )}
        </div>
      </div>

      {p.related.length > 0 && (
        <section className="sec" aria-labelledby="relacionadas">
          <h2 id="relacionadas" className="h2">Peças relacionadas</h2>
          <div className="grid">{p.related.map((r) => <ProductCardView key={r.id} product={r} whatsapp={store.whatsapp} storeName={store.name} />)}</div>
        </section>
      )}

      {wa && (
        <div className="stickybar" role="region" aria-label="Falar com a loja">
          <span className="price">{consulta ? 'Consulte a loja' : money(p.price)}</span>
          <a className="btn wa" href={wa} target="_blank" rel="noopener noreferrer">{consulta ? 'Consultar' : 'Chamar no WhatsApp'}</a>
        </div>
      )}
    </main>
  )
}
