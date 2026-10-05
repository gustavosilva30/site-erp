import Link from 'next/link'
import type { Store } from '@/lib/api'
import { whatsappLink } from '@/lib/format'
import { MapEmbed } from './map-embed'
import { CookiePrefsLink } from './cookie-prefs-link'

/** Páginas legais: a chave da URL, o texto do link e a chave que o ERP usa nos indicadores. */
export const LEGAL_PAGES = [
  { slug: 'privacidade', label: 'Política de privacidade' },
  { slug: 'termos-de-uso', label: 'Termos de uso' },
  { slug: 'cookies', label: 'Cookies' },
  { slug: 'lgpd', label: 'LGPD' },
  { slug: 'exclusao-de-dados', label: 'Exclusão de dados' },
] as const

const instagramOk = (h: string) => /^[A-Za-z0-9._]{1,40}$/.test(h)

export function Footer({ store }: { store: Store }) {
  const wa = whatsappLink(store.whatsapp, store.whatsapp_message)
  const legais = LEGAL_PAGES.filter((p) => store.policies?.[p.slug])
  const temEndereco = Boolean(store.full_address)
  const comoChegar = store.map_query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.map_query)}` : null

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <h2 className="foot-title">{store.name}</h2>
            {store.tagline && <p className="muted small">{store.tagline}</p>}
            <ul className="foot-list">
              {wa && <li><a href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>}
              {store.instagram && instagramOk(store.instagram) && <li><a href={`https://www.instagram.com/${store.instagram}`} target="_blank" rel="noopener noreferrer">Instagram @{store.instagram}</a></li>}
            </ul>
          </div>

          {(temEndereco || store.hours) && (
            <div>
              <h2 className="foot-title">Onde estamos</h2>
              {temEndereco && <p className="small">{store.full_address}</p>}
              {store.hours && <p className="muted small">{store.hours}</p>}
              {comoChegar && <p className="small"><a className="foot-link" href={comoChegar} target="_blank" rel="noopener noreferrer">Como chegar</a></p>}
            </div>
          )}

          {store.map_query && (
            <div className="foot-map">
              <MapEmbed query={store.map_query} />
            </div>
          )}
        </div>

        <div className="foot-legal">
          <nav aria-label="Políticas e termos">
            {legais.map((p) => <Link key={p.slug} href={`/politicas/${p.slug}`}>{p.label}</Link>)}
            <CookiePrefsLink />
          </nav>
          <span>Loja criada com Desmonte360</span>
        </div>
      </div>
    </footer>
  )
}
