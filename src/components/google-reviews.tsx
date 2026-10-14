import { StarIcon, ArrowRightIcon } from './icons'
import type { GoogleReviewsData } from '@/lib/api'

interface GoogleReviewsProps {
  /** Avaliações reais do Google da empresa (null = a empresa não configurou o Place ID). */
  data: GoogleReviewsData | null
  /** Link das avaliações cadastrado pela empresa (usado quando não há avaliações carregadas). */
  googleReviewsUrl?: string | null
  storeName: string
}

const nota = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** Estrelas cheias/vazias de uma avaliação individual (nota inteira de 1 a 5). */
function Stars({ value, label }: { value: number; label: string }) {
  return (
    <div className="review-stars" role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} className={`review-star-icon${i <= value ? '' : ' is-empty'}`} />
      ))}
    </div>
  )
}

/** Estrelas da nota geral, preenchidas proporcionalmente (ex.: 4,6 = 4 estrelas e 60% da quinta). */
function RatingStars({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100))
  return (
    <span className="rating-stars" role="img" aria-label={`Nota ${nota(value)} de 5`}>
      <span className="rating-stars-base">
        {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} className="rating-star" />)}
      </span>
      <span className="rating-stars-fill" style={{ width: `${pct}%` }}>
        {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} className="rating-star" />)}
      </span>
    </span>
  )
}

function GoogleLogo() {
  return (
    <svg className="google-g-logo" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

/**
 * Prova social da Home. Mostra SOMENTE avaliações reais do perfil da empresa no Google (Places API, via ERP).
 * Sem avaliações carregadas: só um convite para ver no Google (se a empresa cadastrou o link). Nunca inventa texto ou nota.
 */
export function GoogleReviews({ data, googleReviewsUrl, storeName }: GoogleReviewsProps) {
  const link = data?.reviews_url || googleReviewsUrl || data?.maps_url || null
  const reviews = data?.reviews ?? []

  if (!data || (!data.rating && reviews.length === 0)) {
    if (!link) return null
    return (
      <section className="sec reviews-section reviews-section--compact" aria-labelledby="reviews-title">
        <div className="wrap reviews-cta">
          <div className="reviews-cta-text">
            <GoogleLogo />
            <div>
              <h2 id="reviews-title" className="reviews-cta-title">Veja o que os clientes dizem da {storeName}</h2>
              <p className="muted small" style={{ margin: 0 }}>Avaliações públicas no nosso perfil do Google.</p>
            </div>
          </div>
          <a href={link} target="_blank" rel="noopener noreferrer" className="btn ghost sm reviews-google-link">
            <span>Ver avaliações no Google</span>
            <ArrowRightIcon className="inline-icon" />
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="sec reviews-section" aria-labelledby="reviews-title">
      <div className="wrap">
        <div className="reviews-header">
          <div>
            <div className="reviews-badge">
              <GoogleLogo />
              <span>Avaliações do Google</span>
            </div>
            <h2 id="reviews-title" className="h2" style={{ margin: '4px 0' }}>
              O que dizem os clientes da {storeName}
            </h2>
            {data.rating ? (
              <div className="reviews-summary">
                <strong className="reviews-summary-score">{nota(data.rating)}</strong>
                <RatingStars value={data.rating} />
                {data.total > 0 && (
                  <span className="muted small">
                    {data.total.toLocaleString('pt-BR')} {data.total === 1 ? 'avaliação' : 'avaliações'} no Google
                  </span>
                )}
              </div>
            ) : null}
          </div>

          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="btn ghost sm reviews-google-link">
              <span>Ver todas no Google</span>
              <ArrowRightIcon className="inline-icon" />
            </a>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="reviews-grid">
            {reviews.map((r, idx) => (
              <article key={`${r.author}-${r.publish_time ?? idx}`} className="review-card">
                <div className="review-top">
                  <Stars value={r.rating} label={`${r.rating} de 5 estrelas`} />
                  {r.relative_time && (
                    <time className="review-date" dateTime={r.publish_time ?? undefined}>{r.relative_time}</time>
                  )}
                </div>
                <p className="review-text">&ldquo;{r.text}&rdquo;</p>
                <div className="review-author">
                  {r.author_photo ? (
                    // Foto do perfil Google do autor (domínio externo; sem otimização do Next de propósito).
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.author_photo} alt="" className="author-avatar author-avatar--img" width={36} height={36} loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="author-avatar" aria-hidden="true">{r.author.charAt(0).toUpperCase()}</div>
                  )}
                  <div>
                    {r.author_url ? (
                      <a href={r.author_url} target="_blank" rel="noopener noreferrer nofollow" className="author-name author-link">{r.author}</a>
                    ) : (
                      <strong className="author-name">{r.author}</strong>
                    )}
                    <span className="author-role">Avaliação no Google</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="reviews-source muted">Avaliações públicas exibidas a partir do Google. Fonte: Google.</p>
      </div>
    </section>
  )
}
