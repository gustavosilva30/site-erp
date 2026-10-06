'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { usePortalCartOptional } from '@/lib/portal-cart'

export function CartLink() {
  const caminho = usePathname()
  const { count: publicCount } = useCart()
  const portalCtx = usePortalCartOptional()

  const ePortal = caminho.startsWith('/conta')
  const href = ePortal ? '/conta/carrinho' : '/carrinho'
  const count = ePortal ? (portalCtx?.count ?? 0) : publicCount
  const label = ePortal ? 'Meu pedido' : 'Carrinho'

  return (
    <Link href={href} className="btn ghost sm" aria-label={`${label} com ${count} itens`}>
      {label}{count > 0 ? ` (${count})` : ''}
    </Link>
  )
}
