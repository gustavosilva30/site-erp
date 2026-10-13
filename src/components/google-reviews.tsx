import { StarIcon, CheckIcon, ArrowRightIcon } from './icons'

interface GoogleReviewsProps {
  googleReviewsUrl?: string | null
  storeName: string
}

export function GoogleReviews({ googleReviewsUrl, storeName }: GoogleReviewsProps) {
  const reviews = [
    {
      name: 'Marcos Vinícius',
      role: 'Oficina Mecânica',
      text: 'Comprei o câmbio completo. Peça original em perfeito estado, funcionando 100% e com nota fiscal. Atendimento ágil e entrega rápida.',
      stars: 5,
      date: 'Há 2 semanas',
    },
    {
      name: 'Carlos Eduardo',
      role: 'Cliente Particular',
      text: 'Excelente suporte pelo WhatsApp! O vendedor me pediu a foto da peça antiga para conferir o código antes de enviar. Chegou certinho.',
      stars: 5,
      date: 'Há 1 mês',
    },
    {
      name: 'Roberto Fagundes',
      role: 'Auto Elétrica',
      text: 'Desmanche de muita confiança. Peças com baixa legal no Detran e garantia de verdade. Já é o terceiro pedido que faço.',
      stars: 5,
      date: 'Há 3 semanas',
    },
  ]

  return (
    <section className="sec reviews-section">
      <div className="wrap">
        <div className="reviews-header">
          <div>
            <div className="reviews-badge">
              <span className="google-icon-text">G</span>
              <span>Avaliações Verificadas no Google</span>
            </div>
            <h2 className="h2" style={{ margin: '4px 0' }}>
              A confiança de quem já comprou na {storeName}
            </h2>
            <p className="muted small" style={{ margin: 0 }}>
              Nota <strong>4.9 de 5 estrelas</strong> em avaliações de clientes satisfeitos
            </p>
          </div>

          {googleReviewsUrl && (
            <a
              href={googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn ghost sm reviews-google-link"
            >
              <span>Ver todas no Google</span>
              <ArrowRightIcon className="inline-icon" />
            </a>
          )}
        </div>

        <div className="reviews-grid">
          {reviews.map((r, idx) => (
            <div key={idx} className="review-card">
              <div className="review-top">
                <div className="review-stars">
                  {[...Array(r.stars)].map((_, i) => (
                    <StarIcon key={i} className="review-star-icon" />
                  ))}
                </div>
                <span className="review-date">{r.date}</span>
              </div>
              <p className="review-text">&ldquo;{r.text}&rdquo;</p>
              <div className="review-author">
                <div className="author-avatar">{r.name.charAt(0)}</div>
                <div>
                  <strong className="author-name">{r.name}</strong>
                  <span className="author-role">
                    <CheckIcon className="h-3 w-3 text-emerald-500 inline-icon" /> {r.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
