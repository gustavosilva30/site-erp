'use client'

import { useState } from 'react'
import type { Facets } from '@/lib/api'
import {
  CarIcon,
  SteeringWheelIcon,
  CalendarIcon,
  SearchIcon,
  ChevronDownIcon,
} from '@/components/icons'

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
        <div className="finder-icon-badge">
          <CarIcon className="finder-icon-svg" />
        </div>
        <div>
          <strong className="finder-title">Qual é o seu veículo?</strong>
          {!compacto && (
            <span className="finder-sub">
              Selecione montadora, modelo e ano para filtrar peças 100% compatíveis
            </span>
          )}
        </div>
      </div>

      <div className="fields">
        {/* Marca */}
        <div className="field-select-wrap">
          <span className="field-icon" aria-hidden>
            <SteeringWheelIcon className="field-svg" />
          </span>
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
          <span className="select-arrow" aria-hidden>
            <ChevronDownIcon />
          </span>
        </div>

        {/* Modelo */}
        <div className="field-select-wrap">
          <span className="field-icon" aria-hidden>
            <CarIcon className="field-svg" />
          </span>
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
          <span className="select-arrow" aria-hidden>
            <ChevronDownIcon />
          </span>
        </div>

        {/* Ano */}
        <div className="field-input-wrap">
          <span className="field-icon" aria-hidden>
            <CalendarIcon className="field-svg" />
          </span>
          <input
            name="year"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="Ano (ex: 2019)"
            aria-label="Ano do carro"
            defaultValue={atual?.year ?? ''}
          />
        </div>
      </div>

      <button className="btn finder-submit-btn" type="submit">
        <SearchIcon className="btn-search-icon" />
        <span>Buscar Peças Compatíveis</span>
      </button>
    </form>
  )
}
