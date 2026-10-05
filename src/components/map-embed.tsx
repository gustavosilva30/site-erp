'use client'

import { useConsent } from '@/lib/consent'

/** Mapa da loja. É um serviço do Google, então só carrega com a permissão do visitante; sem ela, mostra o link para abrir o mapa. */
export function MapEmbed({ query }: { query: string }) {
  const { thirdParty, acceptAll } = useConsent()
  const q = encodeURIComponent(query)
  const abrir = `https://www.google.com/maps/search/?api=1&query=${q}`

  if (!thirdParty) {
    return (
      <div className="map-box map-off">
        <p>O mapa é um serviço do Google e só é carregado com a sua permissão.</p>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button type="button" className="btn sm" onClick={acceptAll}>Permitir e mostrar o mapa</button>
          <a className="btn ghost sm" href={abrir} target="_blank" rel="noopener noreferrer">Abrir no Google Maps</a>
        </div>
      </div>
    )
  }
  return (
    <div className="map-box">
      <iframe
        title="Mapa com a localização da loja"
        src={`https://www.google.com/maps?q=${q}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  )
}
