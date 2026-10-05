import Link from 'next/link'
import type { Store } from '@/lib/api'
import { whatsappLink } from '@/lib/format'
import { CartLink } from './cart-link'

export function Header({ store }: { store: Store }) {
  const wa = whatsappLink(store.whatsapp, store.whatsapp_message)
  return (
    <header className="top">
      <div className="wrap">
        <div className="row">
          <Link href="/" className="brand">
            {store.logo_url
              ? <img src={store.logo_url} alt={store.name} />
              : <span className="logo-fallback">{store.name.slice(0, 1)}</span>}
            {/* A logo da empresa ja traz o nome; sem logo, o nome aparece em texto. */}
            <span className={store.logo_url ? 'sr-only' : undefined}>{store.name}</span>
          </Link>
          <form action="/produtos" className="search" role="search">
            <input name="q" placeholder="Buscar peça, código ou carro" aria-label="Buscar peça" maxLength={80} />
            <button className="btn sm" type="submit">Buscar</button>
          </form>
          {wa && <a className="btn wa sm" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          <CartLink />
        </div>
        <nav className="nav" aria-label="Principal">
          <Link href="/">Início</Link>
          <Link href="/produtos">Peças</Link>
          {store.has_sucatas && <Link href="/sucatas">Sucatas</Link>}
        </nav>
      </div>
    </header>
  )
}
