'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { money, whatsappLink } from '@/lib/format'
import {
  CartIcon,
  WhatsAppIcon,
  TrashIcon,
  LockIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from '@/components/icons'

/** O pedido vira uma mensagem de WhatsApp para a loja; ela confirma estoque, frete e forma de pagamento na conversa. */
export function CartView({ storeName, whatsapp }: { storeName: string; whatsapp: string | null }) {
  const { items, total, setQty, remove, clear } = useCart()

  if (items.length === 0) {
    return (
      <div className="sec cart-empty-section">
        <div className="cart-empty-card">
          <div className="cart-empty-icon">
            <CartIcon />
          </div>
          <h1 className="h2" style={{ margin: '8px 0' }}>Seu carrinho está vazio</h1>
          <p className="muted" style={{ maxWidth: 460, margin: '0 auto 20px' }}>
            Navegue pelo nosso catálogo de peças testadas e com garantia para adicionar ao seu pedido.
          </p>
          <Link href="/produtos" className="btn">
            <span>Explorar catálogo de peças</span>
            <ArrowRightIcon className="inline-icon" />
          </Link>
        </div>
      </div>
    )
  }

  const linhas = items.map((i) => `${i.qty}x ${i.title}${i.sku ? ` (cód. ${i.sku})` : ''} - ${money(i.price * i.qty)}`)
  const texto = `Olá! Quero pedir na ${storeName}:\n\n${linhas.join('\n')}\n\nTotal: ${money(total)}\n\nPode confirmar a disponibilidade e o frete?`
  const link = whatsappLink(whatsapp, texto)

  return (
    <div className="sec cart-page-section">
      <div className="cart-header-title">
        <h1 className="h2" style={{ margin: 0 }}>Meu Pedido ({items.length} {items.length === 1 ? 'item' : 'itens'})</h1>
        <button type="button" className="linkbtn cart-clear-all" onClick={clear}>
          <TrashIcon className="inline-icon" />
          <span>Esvaziar carrinho</span>
        </button>
      </div>

      <div className="cart-layout">
        {/* Lista de itens */}
        <div className="cart-items-col">
          {items.map((i) => (
            <div className="cartrow" key={i.id}>
              <div className="ph">
                {i.photo ? (
                  <img src={i.photo} alt={i.title} />
                ) : (
                  <div className="nophoto">Sem foto</div>
                )}
              </div>
              <div className="cart-item-details">
                <div className="title">{i.title}</div>
                {i.sku && <div className="sku muted small">Cód: {i.sku}</div>}
                <div className="qty-row">
                  <div className="qty">
                    <button
                      type="button"
                      aria-label="Diminuir quantidade"
                      className="qty-btn"
                      onClick={() => setQty(i.id, i.qty - 1)}
                    >
                      −
                    </button>
                    <span className="qty-val">{i.qty}</span>
                    <button
                      type="button"
                      aria-label="Aumentar quantidade"
                      className="qty-btn"
                      onClick={() => setQty(i.id, i.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="linkbtn remove-btn"
                    onClick={() => remove(i.id)}
                    title="Remover peça do carrinho"
                  >
                    <TrashIcon className="inline-icon" />
                    <span>Remover</span>
                  </button>
                </div>
              </div>
              <div className="cart-price-col">
                <span className="price">{money(i.price * i.qty)}</span>
                {i.qty > 1 && (
                  <span className="unit-price muted small">{money(i.price)} cada</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Resumo e Checkout */}
        <div className="cart-summary-col">
          <div className="cart-summary-box">
            <h2 className="summary-title">Resumo da Compra</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{money(total)}</strong>
            </div>
            <div className="summary-row shipping-note">
              <span>Frete</span>
              <span className="text-emerald-600 font-semibold">A combinar via WhatsApp</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total-row">
              <span>Total Estimado</span>
              <span className="summary-total-val">{money(total)}</span>
            </div>

            <div className="summary-checkout-act">
              {link ? (
                <a data-wa="carrinho" className="btn wa full-w cart-whatsapp-checkout" href={link} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="wa-svg-icon" />
                  <span>Finalizar pelo WhatsApp</span>
                </a>
              ) : (
                <span className="muted small">Esta loja ainda não configurou o WhatsApp de atendimento.</span>
              )}
            </div>

            <div className="summary-trust-seals">
              <div className="trust-seal-item">
                <ShieldCheckIcon className="seal-icon" />
                <span>Garantia de procedência & funcionamento</span>
              </div>
              <div className="trust-seal-item">
                <LockIcon className="seal-icon" />
                <span>Atendimento direto com a equipe oficial</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
