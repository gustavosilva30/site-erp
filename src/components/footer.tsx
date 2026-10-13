import Link from 'next/link'
import type { Store } from '@/lib/api'
import { storeContactLink } from '@/lib/format'
import { MapEmbed } from './map-embed'
import { CookiePrefsLink } from './cookie-prefs-link'
import { DetranBadgeIcon } from './detran-badge'
import {
  LockIcon,
  ClockIcon,
  WhatsAppIcon,
  StarIcon,
  InstagramIcon,
  FacebookIcon,
  MapPinIcon,
} from './icons'

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
              <LockIcon className="foot-icon text-emerald-400" />
              <span>Compra Segura & Peças Auditadas</span>
            </div>
          </div>

          {/* Coluna 2: Atendimento & Redes */}
          <div className="foot-col">
            <h2 className="foot-title">Atendimento</h2>
            {store.hours && (
              <p className="foot-hours">
                <ClockIcon className="foot-icon" />
                <span>{store.hours}</span>
              </p>
            )}
            <ul className="foot-list">
              {wa && (
                <li>
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="foot-wa">
                    <WhatsAppIcon className="foot-icon text-emerald-400" />
                    <span>WhatsApp / Vendas</span>
                  </a>
                </li>
              )}
              {store.google_reviews_url && (
                <li>
                  <a href={store.google_reviews_url} target="_blank" rel="noopener noreferrer" className="foot-link">
                    <StarIcon className="foot-icon text-amber-400" />
                    <span>Avaliações no Google</span>
                  </a>
                </li>
              )}
              {store.instagram && instagramOk(store.instagram) && (
                <li>
                  <a href={`https://www.instagram.com/${store.instagram}`} target="_blank" rel="noopener noreferrer" className="foot-link">
                    <InstagramIcon className="foot-icon text-pink-400" />
                    <span>@{store.instagram}</span>
                  </a>
                </li>
              )}
              {store.facebook && store.facebook.trim() && (
                <li>
                  <a href={facebookUrl(store.facebook.trim())} target="_blank" rel="noopener noreferrer" className="foot-link">
                    <FacebookIcon className="foot-icon text-blue-400" />
                    <span>Facebook Oficial</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Coluna 3: Localização */}
          {(temEndereco || store.hours) && (
            <div className="foot-col">
              <h2 className="foot-title">Localização</h2>
              {temEndereco && (
                <p className="foot-addr">
                  <MapPinIcon className="foot-icon" />
                  <span>{store.full_address}</span>
                </p>
              )}
              {comoChegar && (
                <p className="foot-route">
                  <a className="btn sm ghostlight" href={comoChegar} target="_blank" rel="noopener noreferrer">
                    <MapPinIcon className="inline-icon" />
                    <span>Traçar Rota no Mapa</span>
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
          <span className="pay-title">Formas de Pagamento:</span>
          <div className="pay-badges">
            <span className="pay-chip pix">⚡ PIX à Vista</span>
            <span className="pay-chip card">💳 Cartão até 12x</span>
            <span className="pay-chip card">💳 Cartão de Débito</span>
            <span className="pay-chip boleto">📄 Faturamento PJ / Boleto</span>
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
          <span>Desmonte360 • Peças Rastreadas com Baixa no DETRAN</span>
        </div>
      </div>
    </footer>
  )
}
