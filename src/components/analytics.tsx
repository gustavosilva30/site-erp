'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useConsent } from '@/lib/consent'
import { aplicarNoTrack, eventosDaPagina, flush, ignorada, produtoDoCaminho, setAnalyticsConsent, track } from '@/lib/track'

const WHATSAPP = /^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|chat\.whatsapp\.com)\//i
const MAPA = /^https?:\/\/((www\.)?google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|goo\.gl\/maps)/i
const REDE = /^https?:\/\/(www\.)?(instagram|facebook|fb|tiktok|youtube)\.com\//i

const texto = (el: Element) => (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60)

/**
 * Lê o que o visitante faz e manda para as estatísticas. Não altera nada na tela e nunca atrapalha a loja (erro aqui é ignorado).
 * Os cliques são lidos em um único ouvinte no documento; os lugares da página que precisam de mais contexto trazem atributos
 * data-* : data-wa (origem do botão de WhatsApp), data-product-id (card/botão do produto) e data-banner (banner do carrossel).
 */
export function Analytics() {
  const pathname = usePathname()
  const { thirdParty } = useConsent()
  const ultima = useRef('')

  useEffect(() => { setAnalyticsConsent(thirdParty) }, [thirdParty])

  useEffect(() => { aplicarNoTrack() }, [])

  useEffect(() => {
    if (ignorada(pathname)) return
    const chave = pathname + location.search
    if (ultima.current === chave) return
    ultima.current = chave
    track({ type: 'page_view', path: pathname })
    for (const ev of eventosDaPagina(pathname, location.search)) track(ev)
  }, [pathname])

  useEffect(() => {
    const aoClicar = (e: MouseEvent) => {
      try {
        const alvo = e.target as Element | null
        const el = alvo?.closest?.('a, button') as HTMLElement | null
        if (!el) return
        const path = location.pathname
        if (ignorada(path)) return
        const card = el.closest('[data-product-id]') as HTMLElement | null
        const produto = card?.dataset.productId || produtoDoCaminho(path)
        const href = el instanceof HTMLAnchorElement ? el.href : ''

        // WhatsApp (ou o botão de contato com os vendedores, que ocupa o lugar dele): o atributo diz de onde o clique saiu.
        const wa = el.closest('[data-wa]') as HTMLElement | null
        if (wa || WHATSAPP.test(href)) {
          track({ type: 'whatsapp_click', label: wa?.dataset.wa || 'outro', product_id: produto })
          return
        }
        if (href.startsWith('tel:')) { track({ type: 'phone_click' }); return }
        if (MAPA.test(href)) { track({ type: 'map_click', label: 'como-chegar' }); return }
        const rede = href.match(REDE)
        if (rede) { track({ type: 'social_click', label: rede[1].toLowerCase() }); return }
        if (el.classList.contains('add-to-cart-btn')) {
          track({ type: 'add_to_cart', product_id: el.dataset.productId || produto })
          return
        }
        const banner = el.closest('[data-banner]') as HTMLElement | null
        if (banner) { track({ type: 'banner_click', label: (banner.dataset.banner || 'banner').slice(0, 100) }); return }

        // Clique num produto da lista (a página do produto é registrada à parte, ao abrir).
        if (card && el instanceof HTMLAnchorElement && /^\/(peca|produto)\//.test(el.getAttribute('href') ?? '') && card.dataset.productId !== produtoDoCaminho(path)) {
          track({ type: 'product_click', product_id: card.dataset.productId, label: path })
          return
        }

        // Menus, rodapé e botões marcados com data-track.
        const grupo = el.closest('[data-track]') as HTMLElement | null
        const area = grupo ?? el.closest('header, nav, footer')
        if (area && el instanceof HTMLAnchorElement) {
          const nome = texto(el)
          if (nome) track({ type: 'ui_click', label: grupo?.dataset.track ? `${grupo.dataset.track}: ${nome}` : nome })
        }
      } catch { /* estatística nunca atrapalha a loja */ }
    }
    const aoSair = () => { if (document.visibilityState === 'hidden') flush() }
    document.addEventListener('click', aoClicar, true)
    document.addEventListener('visibilitychange', aoSair)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('click', aoClicar, true)
      document.removeEventListener('visibilitychange', aoSair)
      window.removeEventListener('pagehide', flush)
    }
  }, [])

  return null
}

/** Registra uma busca (e quantas peças ela achou) na lista de produtos. Só a primeira página: paginar não é buscar de novo. */
export function TrackSearch({ label, total, page }: { label: string; total: number; page: number }) {
  useEffect(() => {
    if (page === 1 && label.trim()) track({ type: 'search', path: '/produtos', label: label.trim().slice(0, 80), value: total })
  }, [label, total, page])
  return null
}
