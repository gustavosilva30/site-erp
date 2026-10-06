'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Fotos do produto no portal: a foto grande troca nas miniaturas e, ao clicar nela, abre em tela cheia (setas, Esc e toque
 * fora fecham). Para o cliente conferir a peça de perto antes de pedir.
 */
export function PortalGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [atual, setAtual] = useState(0)
  const [aberta, setAberta] = useState(false)
  const total = photos.length
  const i = Math.min(atual, Math.max(0, total - 1))

  const anterior = useCallback(() => setAtual((n) => (n - 1 + total) % total), [total])
  const proxima = useCallback(() => setAtual((n) => (n + 1) % total), [total])

  useEffect(() => {
    if (!aberta) return
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberta(false)
      else if (e.key === 'ArrowLeft' && total > 1) anterior()
      else if (e.key === 'ArrowRight' && total > 1) proxima()
    }
    window.addEventListener('keydown', tecla)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', tecla); document.body.style.overflow = overflow }
  }, [aberta, total, anterior, proxima])

  if (total === 0) return <div className="main"><span className="muted">Sem foto</span></div>

  return (
    <div>
      <button type="button" className="main zoomable" onClick={() => setAberta(true)} aria-label="Ampliar a foto">
        <img src={photos[i]} alt={i === 0 ? alt : `${alt} - foto ${i + 1}`} fetchPriority={i === 0 ? 'high' : 'auto'} decoding="async" />
        <span className="zoomhint">Clique para ampliar</span>
      </button>
      {total > 1 && (
        <div className="thumbs" role="tablist" aria-label="Fotos">
          {photos.slice(0, 12).map((f, n) => (
            <button key={f + n} type="button" role="tab" aria-selected={n === i} aria-label={`Foto ${n + 1}`} className={n === i ? 'on' : undefined} onClick={() => setAtual(n)}>
              <img src={f} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}

      {aberta && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={() => setAberta(false)}>
          <button type="button" className="lb-close" aria-label="Fechar" onClick={() => setAberta(false)}>×</button>
          {total > 1 && <button type="button" className="lb-nav prev" aria-label="Foto anterior" onClick={(e) => { e.stopPropagation(); anterior() }}>‹</button>}
          <img src={photos[i]} alt={`${alt} - foto ${i + 1}`} onClick={(e) => e.stopPropagation()} />
          {total > 1 && <button type="button" className="lb-nav next" aria-label="Próxima foto" onClick={(e) => { e.stopPropagation(); proxima() }}>›</button>}
          {total > 1 && <span className="lb-count">{i + 1} / {total}</span>}
        </div>
      )}
    </div>
  )
}
