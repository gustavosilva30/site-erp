import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { PortalCartProvider } from '@/lib/portal-cart'
import { findStore } from '@/lib/api'
import { requireMe } from '@/lib/portal-data'
import { PortalNav } from '@/components/portal-nav'

export const metadata: Metadata = { title: 'Minha conta', robots: { index: false, follow: false } }

/** Área do cliente: exige sessão (senão volta ao login) e nunca é indexada. */
export default async function ContaLayout({ children }: { children: ReactNode }) {
  const { me } = await requireMe()
  const store = await findStore()
  const primeiro = me.name.trim().split(/\s+/)[0] || me.name
  return (
    <PortalCartProvider>
      <div className="wrap">
        <div className="pbar2">
          <div className="who">
            <span className="avatar" aria-hidden>{primeiro.charAt(0).toUpperCase()}</span>
            <div>
              <strong>Olá, {primeiro}</strong>
              {me.discount_percent > 0 && <span className="pill-disc">{me.discount_percent}% de desconto</span>}
            </div>
          </div>
          <PortalNav temSucatas={Boolean(store?.has_sucatas)} />
        </div>
      </div>
      {children}
    </PortalCartProvider>
  )
}
