'use client'

import { useState } from 'react'
import { usePortalCart } from '@/lib/portal-cart'
import type { PortalProduct } from '@/lib/portal-data'

/** Escolher a quantidade e pôr no carrinho do portal. O limite é o que ainda está disponível. */
export function PortalAdd({ product }: { product: PortalProduct }) {
  const { add, items } = usePortalCart()
  const [qty, setQty] = useState(1)
  const [ok, setOk] = useState(false)
  const noCarrinho = items.find((i) => i.id === product.id)?.qty ?? 0
  const restante = Math.max(0, product.available - noCarrinho)

  return (
    <div className="row" style={{ gap: 8, marginTop: 8 }}>
      <div className="qty">
        <button type="button" aria-label="Diminuir" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
        <span>{Math.min(qty, Math.max(1, restante))}</span>
        <button type="button" aria-label="Aumentar" onClick={() => setQty((q) => Math.min(Math.max(1, restante), q + 1))}>+</button>
      </div>
      <button
        type="button"
        className="btn sm"
        disabled={restante <= 0}
        onClick={() => {
          add({ id: product.id, title: product.title, price: product.price_with_discount, photo: product.photo, sku: product.sku, available: product.available }, Math.min(qty, restante))
          setOk(true); setTimeout(() => setOk(false), 1500)
        }}
      >
        {restante <= 0 ? 'Tudo no carrinho' : ok ? 'Adicionado ✓' : 'Adicionar'}
      </button>
    </div>
  )
}
