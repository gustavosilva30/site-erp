import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { PortalCartProvider } from '@/lib/portal-cart'
import { requireMe } from '@/lib/portal-data'
import { PortalCartLink } from '@/components/portal-cart-link'
import { LogoutButton } from '@/components/portal-forms'

export const metadata: Metadata = { title: 'Minha conta', robots: { index: false, follow: false } }

/** Área do cliente: exige sessão (senão volta ao login) e nunca é indexada. */
export default async function ContaLayout({ children }: { children: ReactNode }) {
  const { me } = await requireMe()
  return (
    <PortalCartProvider>
      <div className="wrap">
        <div className="pbar">
          <span className="small">Olá, <strong>{me.name.split(' ')[0]}</strong>{me.discount_percent > 0 ? ` · seu desconto: ${me.discount_percent}%` : ''}</span>
          <nav className="row" style={{ gap: 18 }} aria-label="Área do cliente">
            <Link href="/conta">Início</Link>
            <Link href="/conta/produtos">Produtos</Link>
            <PortalCartLink />
            <Link href="/conta/pedidos">Meus pedidos</Link>
            <LogoutButton />
          </nav>
        </div>
      </div>
      {children}
    </PortalCartProvider>
  )
}
