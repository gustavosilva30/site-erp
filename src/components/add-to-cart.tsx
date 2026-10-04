'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart'
import type { ProductCard } from '@/lib/api'

export function AddToCart({ product, small = false }: { product: ProductCard; small?: boolean }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  return (
    <button
      type="button"
      className={`btn${small ? ' sm' : ''}`}
      onClick={() => {
        add({ id: product.id, title: product.title, price: product.price, photo: product.photo, sku: product.sku })
        setAdded(true)
        setTimeout(() => setAdded(false), 1500)
      }}
    >
      {added ? 'Adicionado' : 'Adicionar'}
    </button>
  )
}
