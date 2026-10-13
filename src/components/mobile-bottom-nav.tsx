'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { CarIcon, SearchIcon, CartIcon, WhatsAppIcon } from './icons'

export function MobileBottomNav({ whatsapp, storeName }: { whatsapp: string | null; storeName: string }) {
  const pathname = usePathname()
  const { count } = useCart()

  const waMsg = encodeURIComponent(`Olá! Vim pelo site da ${storeName} e gostaria de tirar uma dúvida sobre uma peça.`)
  const waUrl = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${waMsg}` : null

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegação móvel inferior">
      <Link href="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
        <CarIcon className="bottom-nav-icon" />
        <span>Início</span>
      </Link>

      <Link
        href="/produtos"
        className={`bottom-nav-item ${pathname.startsWith('/produtos') ? 'active' : ''}`}
      >
        <SearchIcon className="bottom-nav-icon" />
        <span>Peças</span>
      </Link>

      <Link
        href="/carrinho"
        className={`bottom-nav-item ${pathname.startsWith('/carrinho') ? 'active' : ''}`}
      >
        <span className="bottom-nav-cart-wrapper">
          <CartIcon className="bottom-nav-icon" />
          {count > 0 && <span className="bottom-nav-badge">{count}</span>}
        </span>
        <span>Carrinho</span>
      </Link>

      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bottom-nav-item wa-item"
        >
          <WhatsAppIcon className="bottom-nav-icon text-emerald-500" />
          <span>WhatsApp</span>
        </a>
      )}
    </nav>
  )
}
