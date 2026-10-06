'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePortalCart } from '@/lib/portal-cart'
import { LogoutButton } from '@/components/portal-forms'

const ABAS: { href: string; label: string; exato?: boolean }[] = [
  { href: '/conta', label: 'Início', exato: true },
  { href: '/conta/produtos', label: 'Produtos' },
  { href: '/conta/carrinho', label: 'Meu pedido' },
  { href: '/conta/pedidos', label: 'Meus pedidos' },
]

/** Abas da área do cliente: a da página atual fica destacada e "Meu pedido" mostra quantos itens estão no carrinho. */
export function PortalNav({ temSucatas = false }: { temSucatas?: boolean }) {
  const caminho = usePathname()
  const { count } = usePortalCart()
  return (
    <nav className="ptabs" aria-label="Área do cliente">
      {(temSucatas ? [ABAS[0], ABAS[1], { href: '/conta/sucatas', label: 'Sucatas' }, ABAS[2], ABAS[3]] : ABAS).map((a) => {
        const ativa = a.exato ? caminho === a.href : caminho === a.href || caminho.startsWith(`${a.href}/`)
        return (
          <Link key={a.href} href={a.href} className={ativa ? 'on' : undefined} aria-current={ativa ? 'page' : undefined}>
            {a.label}
            {a.href === '/conta/carrinho' && count > 0 && <span className="badge">{count}</span>}
          </Link>
        )
      })}
      <LogoutButton />
    </nav>
  )
}
