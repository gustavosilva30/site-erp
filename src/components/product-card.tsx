import Link from 'next/link'
import type { ProductCard as Product, StoreTrust } from '@/lib/api'
import { mensagemConsulta, money, semPreco, storeContactLink } from '@/lib/format'
import { pecaPath } from '@/lib/slug'
import { AddToCart } from './add-to-cart'

export function ProductCardView({
  product,
  whatsapp,
  storeName,
  trust,
  contactPageSlug,
  contactSellersUrl,
}: {
  product: Product
  whatsapp: string | null
  storeName: string
  trust?: StoreTrust
  contactPageSlug?: string | null
  contactSellersUrl?: string | null
}) {
  const consulta = semPreco(product.price)
  const link = consulta
    ? storeContactLink({ whatsapp, contact_page_slug: contactPageSlug, contact_sellers_url: contactSellersUrl }, mensagemConsulta(storeName, product))
    : null

  // Badges e informações de confiança
  const condicao = product.condition === 'novo' ? 'Novo' : product.condition === 'revisado' ? 'Revisado' : 'Usado'
  const garantia = product.warranty_days || trust?.default_warranty_days || null
  const showOriginal = Boolean(trust?.show_original_badge && (product.brand?.toLowerCase().includes('genuin') || product.brand?.toLowerCase().includes('original')))

  // Condições de pagamento
  const parcelas = trust?.installments_max && trust.installments_max >= 2 ? trust.installments_max : null
  const semJuros = trust?.installments_no_interest
  const descPix = trust?.pix_discount_percent && trust.pix_discount_percent > 0 ? trust.pix_discount_percent : null
  const precoPix = descPix && !consulta ? product.price * (1 - descPix / 100) : null

  return (
    <div className="card product-card-v2">
      <Link href={pecaPath(product)} className="card-top">
        <div className="ph">
          {product.photo ? (
            <img src={product.photo} alt={product.title} loading="lazy" decoding="async" />
          ) : (
            <span className="nophoto">Sem foto</span>
          )}

          {/* Badges no topo da imagem */}
          <div className="card-badges">
            {showOriginal && <span className="badge original">Genuína</span>}
            <span className={`badge cond ${product.condition === 'novo' ? 'novo' : 'usado'}`}>{condicao}</span>
          </div>

          {garantia && <span className="badge warranty">🛡️ {garantia} dias garantia</span>}
        </div>

        <div className="card-body">
          <div className="t">{product.title}</div>
          <div className="m">
            {[product.montadora, product.model, product.sku ? `cód. ${product.sku}` : null].filter(Boolean).join(' · ')}
          </div>

          {/* Preço e condições */}
          <div className="card-pricing">
            {consulta ? (
              <span className="price-consult">Consulte a loja</span>
            ) : (
              <>
                <div className="price-main">{money(product.price)}</div>
                {precoPix && (
                  <div className="price-pix">
                    <strong>{money(precoPix)}</strong> no Pix <span className="disc">({descPix}% off)</span>
                  </div>
                )}
                {parcelas && (
                  <div className="price-installments">
                    ou {parcelas}x de {money(product.price / parcelas)} {semJuros ? 'sem juros' : ''}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Link>

      <div className="card-act">
        {consulta ? (
          link ? (
            <a className="btn sm wa full-w" href={link} target="_blank" rel="noopener noreferrer">
              💬 Consultar no WhatsApp
            </a>
          ) : (
            <Link className="btn sm full-w" href={pecaPath(product)}>
              Ver peça
            </Link>
          )
        ) : (
          <AddToCart product={product} small />
        )}
      </div>
    </div>
  )
}
