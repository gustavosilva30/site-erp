'use client'

import Link from 'next/link'
import { usePortalCart } from '@/lib/portal-cart'

export function PortalCartLink() {
  const { count } = usePortalCart()
  return <Link href="/conta/carrinho">Meu pedido{count > 0 ? ` (${count})` : ''}</Link>
}
