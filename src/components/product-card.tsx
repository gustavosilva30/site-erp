import Link from 'next/link'
import type { ProductCard as Product } from '@/lib/api'
import { mensagemConsulta, money, semPreco, whatsappLink } from '@/lib/format'
import { AddToCart } from './add-to-cart'

export function ProductCardView({ product, whatsapp, storeName }: { product: Product; whatsapp: string | null; storeName: string }) {
  const meta = [product.condition === 'usado' ? 'Usado' : product.condition === 'novo' ? 'Novo' : null, product.sku ? `cód. ${product.sku}` : null].filter(Boolean).join(' · ')
  const consulta = semPreco(product.price)
  const link = consulta ? whatsappLink(whatsapp, mensagemConsulta(storeName, product)) : null
  return (
    <div className="card">
      <Link href={`/produto/${encodeURIComponent(product.id)}`}>
        <div className="ph">
          {product.photo ? <img src={product.photo} alt={product.title} loading="lazy" /> : 'Sem foto'}
        </div>
        <div className="t">{product.title}</div>
        {meta && <div className="m">{meta}</div>}
      </Link>
      <div className="p">
        {consulta ? (
          <>
            <span className="price" style={{ fontSize: '.95rem' }}>Consulte a loja</span>
            {link
              ? <a className="btn sm wa" href={link} target="_blank" rel="noopener noreferrer">Consultar</a>
              : <Link className="btn sm" href={`/produto/${encodeURIComponent(product.id)}`}>Ver peça</Link>}
          </>
        ) : (
          <>
            <span className="price">{money(product.price)}</span>
            <AddToCart product={product} small />
          </>
        )}
      </div>
    </div>
  )
}
