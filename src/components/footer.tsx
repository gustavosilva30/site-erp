import Link from 'next/link'
import type { Store } from '@/lib/api'
import { storeContactLink } from '@/lib/format'
import { MapEmbed } from './map-embed'
import { CookiePrefsLink } from './cookie-prefs-link'
import { DetranBadgeIcon } from './detran-badge'

export const LEGAL_PAGES = [
  { slug: 'privacidade', label: 'Política de Privacidade' },
  { slug: 'termos-de-uso', label: 'Termos de Uso' },
  { slug: 'cookies', label: 'Política de Cookies' },
  { slug: 'lgpd', label: 'LGPD' },
  { slug: 'exclusao-de-dados', label: 'Exclusão de Dados' },
] as const

const instagramOk = (h: string) => /^[A-Za-z0-9._]{1,40}$/.test(h)
const facebookUrl = (fb: string) => (/^https?:\/\//i.test(fb) ? fb : `https://www.facebook.com/${fb.replace(/^@/, '')}`)

export function Footer({ store }: { store: Store }) {
  const wa = storeContactLink(store, store.whatsapp_message)
  const legais = LEGAL_PAGES.filter((p) => store.policies?.[p.slug])
  const temEndereco = Boolean(store.full_address)
  const comoChegar = store.map_query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.map_query)}` : null
  const cnpj = store.trust?.tax_id
  const credencial = store.trust?.credential_text

  return (
    <footer className="site-footer dark-footer">
      <div className="wrap">
        <div className="foot-grid">
          {/* Coluna 1: Empresa & Credenciamento */}
          <div className="foot-col">
            <h2 className="foot-title">{store.name}</h2>
            {store.tagline && <p className="foot-desc">{store.tagline}</p>}

            {cnpj && <p className="foot-tax">CNPJ: {cnpj}</p>}

            {credencial && (
              <div className="foot-badge-cred inline-flex items-center gap-2">
                <DetranBadgeIcon className="h-5 w-5 shrink-0" />
                <span>{credencial}</span>
              </div>
            )}

            <div className="foot-ssl">
              <span>🔒 Compra 100% Segura & Auditada</span>
            </div>
          </div>

          {/* Coluna 2: Atendimento & Redes */}
          <div className="foot-col">
            <h2 className="foot-title">Atendimento</h2>
            {store.hours && <p className="foot-hours">🕒 {store.hours}</p>}
            <ul className="foot-list">
              {wa && (
                <li>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="foot-wa">
                    💬 Falar com Vendedor / WhatsApp
                  </a>
                </li>
              )}
              {store.google_reviews_url && (
                <li>
                  <a href={store.google_reviews_url} target="_blank" rel="noopener noreferrer">
                    ⭐ Avaliações no Google
                  </a>
                </li>
              )}
              {store.instagram && instagramOk(store.instagram) && (
                <li>
                  <a href={`https://www.instagram.com/${store.instagram}`} target="_blank" rel="noopener noreferrer">
                    📷 Instagram @{store.instagram}
                  </a>
                </li>
              )}
              {store.facebook && store.facebook.trim() && (
                <li>
                  <a href={facebookUrl(store.facebook.trim())} target="_blank" rel="noopener noreferrer">
                    📘 Facebook
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Coluna 3: Localização */}
          {(temEndereco || store.hours) && (
            <div className="foot-col">
              <h2 className="foot-title">Onde Estamos</h2>
              {temEndereco && <p className="foot-addr">📍 {store.full_address}</p>}
              {comoChegar && (
                <p className="foot-route">
                  <a className="btn sm ghostlight" href={comoChegar} target="_blank" rel="noopener noreferrer">
                    🗺️ Traçar Rota de Como Chegar
                  </a>
                </p>
              )}
            </div>
          )}

          {/* Coluna 4: Mapa */}
          {store.map_query && (
            <div className="foot-col foot-map-col">
              <div className="map-box">
                <MapEmbed query={store.map_query} />
              </div>
            </div>
          )}
        </div>

        {/* Formas de Pagamento & Bandeiras */}
        <div className="foot-payments">
          <span className="pay-title">Formas de Pagamento Aceitas:</span>
          <div className="pay-badges">
            <span className="pay-chip pix">⚡ PIX</span>
            <span className="pay-chip card">💳 Cartão de Crédito</span>
            <span className="pay-chip card">💳 Cartão de Débito</span>
            <span className="pay-chip boleto">📄 Boleto / Faturamento</span>
          </div>
        </div>

        {/* Rodapé Legal */}
        <div className="foot-legal">
          <nav aria-label="Políticas e termos">
            {legais.map((p) => (
              <Link key={p.slug} href={`/politicas/${p.slug}`}>
                {p.label}
              </Link>
            ))}
            <CookiePrefsLink />
          </nav>
          <span>Plataforma Desmonte360 • Peças Rastreadas & Genuínas</span>
        </div>
      </div>
    </footer>
  )
}
