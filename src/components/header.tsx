import Link from 'next/link'
import type { Store } from '@/lib/api'
import { storeContactLink } from '@/lib/format'
import { CartLink } from './cart-link'
import { DetranBadgeIcon } from './detran-badge'

export function Header({ store }: { store: Store }) {
  const wa = storeContactLink(store, store.whatsapp_message)
  const frete = store.trust?.shipping_text || 'Enviamos para todo o Brasil'
  const credencial = store.trust?.credential_text
  const cidade = store.city ? `${store.city}${store.state ? ` - ${store.state}` : ''}` : null

  return (
    <header className="top">
      {/* Top Bar de Atendimento e Confiança */}
      <div className="topbar">
        <div className="wrap topbar-inner">
          <div className="topbar-items">
            <span>📦 {frete}</span>
            <span>💬 Atendimento rápido via WhatsApp</span>
            {cidade && <span>📍 Loja Física em {cidade}</span>}
            {credencial && (
              <span className="topbar-cred inline-flex items-center gap-1.5">
                <DetranBadgeIcon className="h-4 w-4 shrink-0" />
                {credencial}
              </span>
            )}
          </div>
          {store.hours && <div className="topbar-hours">🕒 {store.hours}</div>}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="wrap">
        <div className="row main-header-row">
          <Link href="/" className="brand">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="brand-logo" />
            ) : (
              <span className="logo-fallback">{store.name.slice(0, 1)}</span>
            )}
            <span className={store.logo_url ? 'brand-text sr-only' : 'brand-text'}>{store.name}</span>
          </Link>

          <form action="/produtos" className="search" role="search">
            <span className="search-icon" aria-hidden>🔍</span>
            <input name="q" placeholder="Buscar peça, código de fábrica ou carro (ex.: farol sentra)" aria-label="Buscar peça" maxLength={80} />
            <button className="btn sm search-btn" type="submit">Buscar</button>
          </form>

          <div className="header-actions">
            {wa && (
              <a className="btn wa sm whatsapp-header-btn" href={wa} target="_blank" rel="noopener noreferrer">
                <span className="wa-icon" aria-hidden>💬</span>
                <span className="wa-label">Falar com Vendedor</span>
              </a>
            )}
            <CartLink />
          </div>
        </div>

        {/* Main Nav Bar */}
        <nav className="nav" aria-label="Navegação principal">
          <Link href="/">Início</Link>
          <Link href="/produtos">Todas as Peças</Link>
          {store.has_sucatas && <Link href="/sucatas">Veículos em Desmontagem</Link>}
          {store.portal_enabled && <Link href="/entrar" className="nav-portal-link">👤 Área do Cliente / Entrar</Link>}
        </nav>
      </div>
    </header>
  )
}
