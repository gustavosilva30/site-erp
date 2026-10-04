'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Banner } from '@/lib/api'

const INTERVALO = 5000

/** Carrossel da página inicial (até 5 imagens 8:3). Desliza no celular, passa sozinho e para quando o cliente interage. */
export function Carousel({ banners }: { banners: Banner[] }) {
  const trilho = useRef<HTMLDivElement>(null)
  const [atual, setAtual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const total = banners.length

  const ir = useCallback((i: number) => {
    const el = trilho.current
    if (!el) return
    const alvo = (i + total) % total
    el.scrollTo({ left: alvo * el.clientWidth, behavior: 'smooth' })
  }, [total])

  useEffect(() => {
    if (total < 2 || pausado) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => ir(atual + 1), INTERVALO)
    return () => clearInterval(t)
  }, [atual, total, pausado, ir])

  if (total === 0) return null

  return (
    <section
      className="carousel"
      aria-roledescription="carrossel"
      aria-label="Destaques da loja"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div
        className="carousel-track"
        ref={trilho}
        onScroll={(e) => {
          const el = e.currentTarget
          setAtual(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))
        }}
      >
        {banners.map((b, i) => {
          const img = <img src={b.image_url} alt={b.alt} loading={i === 0 ? 'eager' : 'lazy'} draggable={false} />
          const externo = b.link_url && /^https?:\/\//i.test(b.link_url)
          return (
            <div className="carousel-slide" key={b.id} role="group" aria-roledescription="slide" aria-label={`${i + 1} de ${total}`}>
              {b.link_url
                ? externo
                  ? <a href={b.link_url} target="_blank" rel="noopener noreferrer">{img}</a>
                  : <Link href={b.link_url}>{img}</Link>
                : img}
            </div>
          )
        })}
      </div>
      {total > 1 && (
        <>
          <button type="button" className="carousel-btn prev" aria-label="Imagem anterior" onClick={() => ir(atual - 1)}>‹</button>
          <button type="button" className="carousel-btn next" aria-label="Próxima imagem" onClick={() => ir(atual + 1)}>›</button>
          <div className="carousel-dots">
            {banners.map((b, i) => (
              <button key={b.id} type="button" aria-label={`Ir para a imagem ${i + 1}`} aria-current={i === atual} className={i === atual ? 'on' : ''} onClick={() => ir(i)} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
