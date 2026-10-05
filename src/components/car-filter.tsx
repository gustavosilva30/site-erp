'use client'

import { useState } from 'react'
import type { Facets } from '@/lib/api'

/**
 * "Qual é o seu carro?": montadora, modelo (só os que existem naquela montadora) e ano. Envia por GET para /produtos, então
 * o resultado é um endereço normal que pode ser compartilhado. As opções vêm só do que a loja realmente tem em estoque.
 */
export function CarFilter({ facets, atual, compacto = false }: { facets: Facets; atual?: { montadora?: string; model?: string; year?: string }; compacto?: boolean }) {
  const [montadora, setMontadora] = useState(atual?.montadora ?? '')
  const [modelo, setModelo] = useState(atual?.model ?? '')
  const modelos = facets.models.filter((m) => !montadora || m.montadora.toLowerCase() === montadora.toLowerCase())
  if (facets.montadoras.length === 0) return null
  return (
    <form action="/produtos" className={`finder${compacto ? ' compact' : ''}`}>
      <b>Qual é o seu carro?</b>
      <div className="fields">
        <select name="montadora" aria-label="Marca do carro" value={montadora} onChange={(e) => { setMontadora(e.target.value); setModelo('') }}>
          <option value="">Marca</option>
          {facets.montadoras.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
        </select>
        <select name="model" aria-label="Modelo do carro" value={modelo} onChange={(e) => setModelo(e.target.value)}>
          <option value="">Modelo</option>
          {[...new Map(modelos.map((m) => [m.name.toLowerCase(), m])).values()].map((m) => <option key={`${m.montadora}-${m.name}`} value={m.name}>{m.name}</option>)}
        </select>
        <input name="year" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} placeholder="Ano" aria-label="Ano do carro" defaultValue={atual?.year ?? ''} />
      </div>
      <button className="btn" type="submit">Ver peças</button>
    </form>
  )
}
