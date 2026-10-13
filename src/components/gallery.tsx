'use client'

import { useState, useEffect, useCallback } from 'react'

/** Fotos da peça/sucata: a grande troca ao tocar numa miniatura com modal Lightbox em tela cheia. */
export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [atual, setAtual] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (photos.length === 0) {
    return (
      <div className="main">
        <span className="muted">Sem foto disponível</span>
      </div>
    )
  }

  const i = Math.min(atual, photos.length - 1)

  const handlePrev = useCallback(() => {
    setAtual((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
  }, [photos.length])

  const handleNext = useCallback(() => {
    setAtual((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
  }, [photos.length])

  // Atalhos de teclado no Lightbox (Esc, Setas)
  useEffect(() => {
    if (!lightboxOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, handlePrev, handleNext])

  return (
    <div className="gallery-container">
      {/* Imagem Principal com Dica de Zoom */}
      <div
        className="main gallery-main-box"
        onClick={() => setLightboxOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Clique para ampliar foto em tela cheia"
      >
        <img
          src={photos[i]}
          alt={i === 0 ? alt : `${alt} - foto ${i + 1}`}
          fetchPriority={i === 0 ? 'high' : 'auto'}
          decoding="async"
        />
        <div className="gallery-zoom-hint">
          <span>🔍 Clique para ampliar</span>
        </div>
      </div>

      {/* Miniaturas */}
      {photos.length > 1 && (
        <div className="thumbs" role="tablist" aria-label="Fotos">
          {photos.slice(0, 12).map((f, n) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={n === i}
              aria-label={`Foto ${n + 1}`}
              className={n === i ? 'on' : undefined}
              onClick={() => setAtual(n)}
            >
              <img src={f} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}

      {/* Modal Lightbox em Tela Cheia */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <div className="lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <span className="lightbox-counter">
                Foto {i + 1} de {photos.length}
              </span>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setLightboxOpen(false)}
                aria-label="Fechar visualizador"
              >
                ✕
              </button>
            </div>

            <div className="lightbox-body">
              {photos.length > 1 && (
                <button
                  type="button"
                  className="lightbox-nav-btn prev"
                  onClick={handlePrev}
                  aria-label="Foto anterior"
                >
                  ‹
                </button>
              )}

              <div className="lightbox-img-wrapper">
                <img src={photos[i]} alt={`${alt} ampliada`} />
              </div>

              {photos.length > 1 && (
                <button
                  type="button"
                  className="lightbox-nav-btn next"
                  onClick={handleNext}
                  aria-label="Próxima foto"
                >
                  ›
                </button>
              )}
            </div>

            {photos.length > 1 && (
              <div className="lightbox-thumbs">
                {photos.map((f, n) => (
                  <button
                    key={`lb-${f}`}
                    type="button"
                    className={`lb-thumb ${n === i ? 'on' : ''}`}
                    onClick={() => setAtual(n)}
                  >
                    <img src={f} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
