'use client'

import { useState } from 'react'
import { useCartOptional } from '@/lib/cart'
import type { ProductCard } from '@/lib/api'
import { CartIcon, CheckIcon } from './icons'

export function AddToCart({ product, small = false }: { product: ProductCard; small?: boolean }) {
  const cart = useCartOptional()
  const [added, setAdded] = useState(false)

  return (
    <button
      type="button"
      className={`btn add-to-cart-btn ${added ? 'added' : ''}${small ? ' sm full-w' : ''}`}
      onClick={() => {
        cart?.add({ id: product.id, title: product.title, price: product.price, photo: product.photo, sku: product.sku })
        setAdded(true)
        setTimeout(() => setAdded(false), 1600)
      }}
    >
      {added ? (
        <>
          <CheckIcon className="btn-icon text-emerald-300" />
          <span>Adicionado!</span>
        </>
      ) : (
        <>
          <CartIcon className="btn-icon" />
          <span>Comprar</span>
        </>
      )}
    </button>
  )
}
