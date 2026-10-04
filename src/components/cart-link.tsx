'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'

export function CartLink() {
  const { count } = useCart()
  return (
    <Link href="/carrinho" className="btn ghost sm" aria-label={`Carrinho com ${count} itens`}>
      Carrinho{count > 0 ? ` (${count})` : ''}
    </Link>
  )
}
