import type { Store } from '@/lib/api'
import { storeContactLink } from '@/lib/format'
import { ShieldCheckIcon, TruckIcon, MessageConsultIcon, ArrowRightIcon } from '@/components/icons'

/** Cards de benefícios rápidos e proposta de valor exibidos na página inicial e destaque do catálogo */
export function TrustBanner({ store }: { store: Store }) {
  const wa = storeContactLink(store, 'Olá! Gostaria de tirar uma dúvida sobre compatibilidade de peças.')
  const frete = store.trust?.shipping_text || 'Enviamos para todo o Brasil com segurança'
  const garantiaDias = store.trust?.default_warranty_days || 90

  return (
    <section className="sec trust-section">
      <div className="wrap">
        <div className="trust-grid">
          <div className="trust-card">
            <div className="trust-icon-box trust-shield">
              <ShieldCheckIcon className="trust-svg-icon" />
            </div>
            <div className="trust-body">
              <strong>Garantia & Procedência</strong>
              <span>Peças testadas e rastreadas com garantia legal de até {garantiaDias} dias.</span>
            </div>
          </div>

          <div className="trust-card">
            <div className="trust-icon-box trust-shipping">
              <TruckIcon className="trust-svg-icon" />
            </div>
            <div className="trust-body">
              <strong>Envio Rápido & Seguro</strong>
              <span>{frete} e rastreamento ponto a ponto.</span>
            </div>
          </div>

          <div className="trust-card">
            <div className="trust-icon-box trust-support">
              <MessageConsultIcon className="trust-svg-icon" />
            </div>
            <div className="trust-body">
              <strong>Dúvidas de Compatibilidade?</strong>
              <span>
                {wa ? (
                  <a data-wa="contato" href={wa} target="_blank" rel="noopener noreferrer" className="trust-link">
                    <span>Consultar equipe no WhatsApp</span>
                    <ArrowRightIcon className="inline-icon" />
                  </a>
                ) : (
                  'Consulte nosso atendimento especializado antes de comprar.'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
