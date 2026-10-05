'use client'

import { useState } from 'react'

/** Fotos da peça/sucata: a grande troca ao tocar numa miniatura. Primeira foto carrega com prioridade (melhora o LCP). */
export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [atual, setAtual] = useState(0)
  if (photos.length === 0) return <div className="main"><span className="muted">Sem foto</span></div>
  const i = Math.min(atual, photos.length - 1)
  return (
    <div>
      <div className="main">
        <img src={photos[i]} alt={i === 0 ? alt : `${alt} - foto ${i + 1}`} fetchPriority={i === 0 ? 'high' : 'auto'} decoding="async" />
      </div>
      {photos.length > 1 && (
        <div className="thumbs" role="tablist" aria-label="Fotos">
          {photos.slice(0, 12).map((f, n) => (
            <button key={f} type="button" role="tab" aria-selected={n === i} aria-label={`Foto ${n + 1}`} className={n === i ? 'on' : undefined} onClick={() => setAtual(n)}>
              <img src={f} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
