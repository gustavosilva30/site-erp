import type { Store } from '@/lib/api'
import { whatsappLink } from '@/lib/format'

/** Cards de benefícios rápidos e proposta de valor exibidos na página inicial e destaque do catálogo */
export function TrustBanner({ store }: { store: Store }) {
  const wa = whatsappLink(store.whatsapp, 'Olá! Gostaria de tirar uma dúvida sobre compatibilidade de peças.')
  const frete = store.trust?.shipping_text || 'Enviamos para todo o Brasil com segurança'
  const garantiaDias = store.trust?.default_warranty_days || 90

  return (
    <section className="sec trust-section">
      <div className="wrap">
        <div className="trust-grid">
          <div className="trust-card">
            <div className="trust-icon" aria-hidden>🛡️</div>
            <div className="trust-body">
              <strong>Garantia & Procedência</strong>
              <span>Peças testadas, rastreadas com garantia de até {garantiaDias} dias.</span>
            </div>
          </div>

          <div className="trust-card">
            <div className="trust-icon" aria-hidden>🚚</div>
            <div className="trust-body">
              <strong>Envio Rápido & Seguro</strong>
              <span>{frete} e rastreamento completo.</span>
            </div>
          </div>

          <div className="trust-card">
            <div className="trust-icon" aria-hidden>💬</div>
            <div className="trust-body">
              <strong>Dúvidas de Compatibilidade?</strong>
              <span>
                {wa ? (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="trust-link">
                    Fale com nosso consultor no WhatsApp →
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
