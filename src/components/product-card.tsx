import Link from 'next/link'
import type { ProductCard as Product } from '@/lib/api'
import { money } from '@/lib/format'
import { AddToCart } from './add-to-cart'

export function ProductCardView({ product }: { product: Product }) {
  const meta = [product.condition === 'usado' ? 'Usado' : product.condition === 'novo' ? 'Novo' : null, product.sku ? `cód. ${product.sku}` : null].filter(Boolean).join(' · ')
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
        <span className="price">{money(product.price)}</span>
        <AddToCart product={product} small />
      </div>
    </div>
  )
}
