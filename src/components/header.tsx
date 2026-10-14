import Link from 'next/link'
import type { Store } from '@/lib/api'
import { storeContactLink } from '@/lib/format'
import { CartLink } from './cart-link'
import { DetranBadgeIcon } from './detran-badge'
import { SearchBar } from './search-bar'
import {
  PackageIcon,
  WhatsAppIcon,
  MapPinIcon,
  ClockIcon,
  SearchIcon,
  UserIcon,
} from './icons'

export function Header({ store }: { store: Store }) {
  const wa = storeContactLink(store, store.whatsapp_message)
  const frete = store.trust?.shipping_text || 'Enviamos para todo o Brasil'
  const credencial = store.trust?.credential_text
  const cidade = store.city ? `${store.city}${store.state ? ` - ${store.state}` : ''}` : null

  return (
    <header className="top header-sticky">
      {/* Top Bar de Atendimento e Confiança */}
      <div className="topbar">
        <div className="wrap topbar-inner">
          <div className="topbar-items">
            <span className="topbar-item">
              <PackageIcon className="topbar-icon" />
              <span>{frete}</span>
            </span>
            <span className="topbar-item hide-mobile">
              <WhatsAppIcon className="topbar-icon text-emerald-400" />
              <span>Atendimento especializado</span>
            </span>
            {cidade && (
              <span className="topbar-item hide-mobile">
                <MapPinIcon className="topbar-icon" />
                <span>Loja Física em {cidade}</span>
              </span>
            )}
            {credencial && (
              <span className="topbar-cred inline-flex items-center gap-1.5">
                <DetranBadgeIcon className="h-4 w-4 shrink-0" />
                <span>{credencial}</span>
              </span>
            )}
          </div>
          {store.hours && (
            <div className="topbar-hours">
              <ClockIcon className="topbar-icon" />
              <span>{store.hours}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="wrap header-main-wrap">
        <div className="row main-header-row">
          <Link href="/" className="brand" aria-label={store.name}>
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="brand-logo" />
            ) : (
              <span className="logo-fallback">{store.name.slice(0, 1)}</span>
            )}
            <span className={store.logo_url ? 'brand-text sr-only' : 'brand-text'}>{store.name}</span>
          </Link>

          <SearchBar />

          <div className="header-actions">
            {wa && (
              <a data-wa="cabecalho" className="btn wa sm whatsapp-header-btn" href={wa} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="wa-svg-icon" />
                <span className="wa-label">Vendedor</span>
              </a>
            )}
            <CartLink />
          </div>
        </div>

        {/* Main Nav Bar */}
        <nav className="nav" aria-label="Navegação principal">
          <Link href="/" className="nav-link">Início</Link>
          <Link href="/produtos" className="nav-link">Todas as Peças</Link>
          {store.has_sucatas && (
            <Link href="/sucatas" className="nav-link">Veículos em Desmontagem</Link>
          )}
          <Link href="/sobre" className="nav-link">Sobre a Loja</Link>
          {store.portal_enabled && (
            <Link href="/entrar" className="nav-portal-link">
              <UserIcon className="inline-icon" />
              <span>Área do Cliente</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
