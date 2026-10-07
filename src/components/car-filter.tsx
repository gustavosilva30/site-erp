'use client'

import { useState } from 'react'
import type { Facets } from '@/lib/api'

/**
 * "Qual é o seu carro?": Seletor estilo Garagem / Filtro Rápido com ícones e busca por compatibilidade.
 */
export function CarFilter({
  facets,
  atual,
  compacto = false,
}: {
  facets: Facets
  atual?: { montadora?: string; model?: string; year?: string }
  compacto?: boolean
}) {
  const [montadora, setMontadora] = useState(atual?.montadora ?? '')
  const [modelo, setModelo] = useState(atual?.model ?? '')
  const modelos = facets.models.filter((m) => !montadora || m.montadora.toLowerCase() === montadora.toLowerCase())

  const montadorasDeduplicadas = [...new Map(facets.montadoras.map((m) => [m.name.trim().toLowerCase(), m.name])).values()].sort((a, b) => a.localeCompare(b))

  if (facets.montadoras.length === 0) return null

  return (
    <form action="/produtos" className={`finder ${compacto ? 'compact' : 'garage-finder'}`}>
      <div className="finder-header">
        <span className="finder-icon" aria-hidden>🚗</span>
        <div>
          <strong className="finder-title">Qual é o seu carro?</strong>
          {!compacto && <span className="finder-sub">Selecione a marca e modelo para filtrar peças 100% compatíveis</span>}
        </div>
      </div>

      <div className="fields">
        <div className="field-select-wrap">
          <span className="field-icon" aria-hidden>🏎️</span>
          <select
            name="montadora"
            aria-label="Marca do carro"
            value={montadora}
            onChange={(e) => {
              setMontadora(e.target.value)
              setModelo('')
            }}
          >
            <option value="">Selecione a Marca</option>
            {montadorasDeduplicadas.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
        </div>

        <div className="field-select-wrap">
          <span className="field-icon" aria-hidden>🚘</span>
          <select
            name="model"
            aria-label="Modelo do carro"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
          >
            <option value="">Selecione o Modelo</option>
            {[...new Map(modelos.map((m) => [m.name.toLowerCase(), m])).values()].map((m) => (
              <option key={`${m.montadora}-${m.name}`} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field-input-wrap">
          <span className="field-icon" aria-hidden>📅</span>
          <input
            name="year"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="Ano (ex: 2018)"
            aria-label="Ano do carro"
            defaultValue={atual?.year ?? ''}
          />
        </div>
      </div>

      <button className="btn finder-submit-btn" type="submit">
        <span>🔍 Buscar Peças Compatíveis</span>
      </button>
    </form>
  )
}
