import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProduct, getStore } from '@/lib/api'
import { mensagemConsulta, money, semPreco, whatsappLink, years } from '@/lib/format'
import { AddToCart } from '@/components/add-to-cart'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const store = await getStore()
  const p = await getProduct(store.slug, id)
  return { title: p?.title ?? 'Peça' }
}

export default async function Produto({ params }: Props) {
  const { id } = await params
  const store = await getStore()
  const p = await getProduct(store.slug, id)
  if (!p) notFound()
  const fotos = p.photos.length ? p.photos : p.photo ? [p.photo] : []
  const anos = years(p)
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
  const consulta = semPreco(p.price)
  const wa = whatsappLink(
    store.whatsapp,
    consulta
      ? mensagemConsulta(store.name, p)
      : `Olá! Vim pelo site da ${store.name} e tenho interesse na peça: ${p.title}${p.sku ? ` (cód. ${p.sku})` : ''} - ${money(p.price)}. Ainda está disponível?`,
  )

  return (
    <main className="wrap detail">
      <div>
        <div className="main">{fotos[0] ? <img src={fotos[0]} alt={p.title} /> : <span className="muted">Sem foto</span>}</div>
        {fotos.length > 1 && <div className="thumbs">{fotos.slice(0, 8).map((f) => <img key={f} src={f} alt="" loading="lazy" />)}</div>}
      </div>
      <div>
        <h1>{p.title}</h1>
        <span className="price">{consulta ? 'Consulte a loja' : money(p.price)}</span>
        <div className="row">
          {!consulta && <AddToCart product={p} />}
          {wa && <a className="btn wa" href={wa} target="_blank" rel="noopener noreferrer">{consulta ? 'Consultar preço no WhatsApp' : 'Perguntar no WhatsApp'}</a>}
        </div>
        <table className="specs">
          <tbody>{linhas.filter(([, v]) => v).map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody>
        </table>
        {p.description && <p className="muted" style={{ whiteSpace: 'pre-line' }}>{p.description}</p>}
      </div>
    </main>
  )
}
