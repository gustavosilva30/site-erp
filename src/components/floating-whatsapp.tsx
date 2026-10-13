'use client'

import { useState } from 'react'
import { WhatsAppIcon } from './icons'

export function FloatingWhatsApp({ whatsapp, storeName }: { whatsapp: string | null; storeName: string }) {
  const [closed, setClosed] = useState(false)
  if (!whatsapp) return null

  const msg = encodeURIComponent(`Olá! Estou no site da ${storeName} e gostaria de tirar uma dúvida sobre uma peça.`)
  const url = `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${msg}`

  return (
    <div className="floating-wa-container" role="complementary" aria-label="Atendimento rápido via WhatsApp">
      {!closed && (
        <div className="floating-wa-tooltip">
          <div className="tooltip-content">
            <span className="tooltip-title">Precisa de ajuda com a peça?</span>
            <span className="tooltip-sub">Fale agora com nossa equipe de vendas!</span>
          </div>
          <button
            type="button"
            className="tooltip-close"
            onClick={() => setClosed(true)}
            aria-label="Fechar mensagem de ajuda"
          >
            ✕
          </button>
        </div>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-wa-btn"
        aria-label="Conversar com vendedor pelo WhatsApp"
      >
        <span className="wa-pulse-ring" />
        <WhatsAppIcon className="floating-wa-icon" />
      </a>
    </div>
  )
}
