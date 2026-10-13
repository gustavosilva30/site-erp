'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { usePortalCartOptional } from '@/lib/portal-cart'
import { CartIcon } from '@/components/icons'

export function CartLink() {
  const caminho = usePathname()
  const { count: publicCount } = useCart()
  const portalCtx = usePortalCartOptional()

  const ePortal = caminho.startsWith('/conta')
  const href = ePortal ? '/conta/carrinho' : '/carrinho'
  const count = ePortal ? (portalCtx?.count ?? 0) : publicCount
  const label = ePortal ? 'Meu pedido' : 'Carrinho'

  return (
    <Link href={href} className="cart-header-btn" aria-label={`${label} com ${count} itens`}>
      <span className="cart-icon-wrapper">
        <CartIcon className="cart-header-icon" />
        {count > 0 && <span className="cart-count-pill">{count}</span>}
      </span>
      <span className="cart-header-label">{label}</span>
    </Link>
  )
}
