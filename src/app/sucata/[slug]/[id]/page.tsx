import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getStore, getSucata } from '@/lib/api'
import { formatEngine, whatsappLink } from '@/lib/format'
import { slugify, sucataPath } from '@/lib/slug'
import { cidadeDe, cortar, siteOrigin } from '@/lib/seo'
import { Gallery } from '@/components/gallery'
import { JsonLd } from '@/components/json-ld'
import { Breadcrumb } from '@/components/listing'
import { ProductCardView } from '@/components/product-card'

type Props = { params: Promise<{ slug: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const store = await getStore()
  const s = await getSucata(store.slug, id)
  if (!s) return { title: 'Sucata não encontrada', robots: { index: false } }
  const nome = `${s.title}${s.year ? ` ${s.year}` : ''}`
  const titulo = cortar(`Peças do ${nome}${store.city ? ` em ${store.city}` : ''}`, 62)
  const descricao = cortar(`${s.parts_count > 0 ? `${s.parts_count} ${s.parts_count === 1 ? 'peça disponível' : 'peças disponíveis'} do` : 'Veículo'} ${nome} na ${store.name}${store.city ? `, ${cidadeDe(store)}` : ''}. Veja as fotos e chame no WhatsApp.`, 158)
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: sucataPath(s) },
    openGraph: { title: titulo, description: descricao, url: sucataPath(s), siteName: store.name, locale: 'pt_BR', type: 'website', ...(s.photo ? { images: [{ url: s.photo, alt: nome }] } : {}) },
    twitter: { card: 'summary_large_image', title: titulo, description: descricao, ...(s.photo ? { images: [s.photo] } : {}) },
  }
}

export default async function Sucata({ params }: Props) {
  const { slug, id } = await params
  const store = await getStore()
  const s = await getSucata(store.slug, id)
  if (!s) notFound()
  if (slug !== (slugify(s.title) || 'sucata')) permanentRedirect(sucataPath(s))

  const origem = await siteOrigin()
  const nome = `${s.title}${s.year ? ` ${s.year}` : ''}`
  const wa = whatsappLink(store.whatsapp, `Olá! Vim pelo site da ${store.name} e quero saber das peças do ${nome}.`)
  const dados: [string, string | null][] = [['Ano', s.year || null], ['Cor', s.color], ['Combustível', s.fuel], ['Motor', formatEngine(s.engine)], ['Câmbio', s.transmission || null]]
  const trilha: { label: string; href?: string }[] = [{ label: 'Início', href: '/' }, { label: 'Sucatas', href: '/sucatas' }, { label: nome }]

  return (
    <main className="wrap detail-page has-sticky">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trilha.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.label, ...(t.href ? { item: `${origem}${t.href}` } : {}) })),
      }} />
      <Breadcrumb items={trilha} />
      <div className="detail">
        <Gallery photos={s.photos} alt={nome} />
        <div>
          <h1>{nome}</h1>
          <p className="muted">{s.parts_count > 0 ? `${s.parts_count} ${s.parts_count === 1 ? 'peça deste veículo está' : 'peças deste veículo estão'} em estoque.` : 'No momento não há peças deste veículo em estoque.'}</p>
          {wa && <div className="row"><a className="btn wa" href={wa} target="_blank" rel="noopener noreferrer">Perguntar das peças no WhatsApp</a></div>}
          <table className="specs">
            <tbody>{dados.filter(([, v]) => v).map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <section className="sec" aria-labelledby="pecas-da-sucata">
        <h2 id="pecas-da-sucata" className="h2">Peças deste veículo em estoque</h2>
        {s.parts.length === 0
          ? <p className="muted">Nenhuma peça cadastrada com foto no momento. Fale com a gente pelo WhatsApp: pode haver peças que ainda não foram fotografadas.</p>
          : <div className="grid">{s.parts.map((p) => <ProductCardView key={p.id} product={p} whatsapp={store.whatsapp} storeName={store.name} />)}</div>}
      </section>

      {wa && (
        <div className="stickybar" role="region" aria-label="Falar com a loja">
          <span className="price" style={{ fontSize: '.95rem' }}>{s.parts_count} {s.parts_count === 1 ? 'peça' : 'peças'}</span>
          <a className="btn wa" href={wa} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
        </div>
      )}
    </main>
  )
}
