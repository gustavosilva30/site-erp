'use client'

import { useState } from 'react'
import { TruckIcon, WhatsAppIcon, CheckIcon, ClockIcon } from './icons'

interface ShippingCalculatorProps {
  productTitle: string
  sku?: string | null
  whatsapp?: string | null
}

export function ShippingCalculator({ productTitle, sku, whatsapp }: { productTitle: string; sku?: string | null; whatsapp?: string | null }) {
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState<{ localidade: string; uf: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const formatCep = (v: string) => {
    const raw = v.replace(/\D/g, '').slice(0, 8)
    if (raw.length > 5) {
      return `${raw.slice(0, 5)}-${raw.slice(5)}`
    }
    return raw
  }

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      setError('Por favor, digite um CEP válido com 8 dígitos.')
      setAddress(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      if (!res.ok) throw new Error('Falha ao consultar CEP')
      const data = await res.json()
      if (data.erro) {
        setError('CEP não localizado. Por favor, verifique os dígitos.')
        setAddress(null)
      } else {
        setAddress({ localidade: data.localidade, uf: data.uf })
      }
    } catch {
      setError('Não foi possível consultar o CEP no momento. Consulte diretamente no WhatsApp.')
      setAddress(null)
    } finally {
      setLoading(false)
    }
  }

  const waMsg = address
    ? encodeURIComponent(
        `Olá! Vim pelo site e tenho interesse na peça: ${productTitle}${sku ? ` (cód. ${sku})` : ''}.\nMeu CEP é ${cep} (${address.localidade} - ${address.uf}).\nGostaria de saber o valor exato do frete e o prazo de entrega.`
      )
    : encodeURIComponent(
        `Olá! Gostaria de consultar o valor do frete para a peça: ${productTitle}${sku ? ` (cód. ${sku})` : ''}.`
      )

  const waLink = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${waMsg}` : null

  return (
    <div className="shipping-box">
      <div className="shipping-head">
        <TruckIcon className="shipping-icon text-blue-500" />
        <div>
          <strong className="shipping-title">Simulação de Frete & Entrega</strong>
          <span className="shipping-sub">Enviamos para todo o Brasil com rastreamento e seguro</span>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="shipping-form">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Digite seu CEP (ex: 79800-000)"
          value={cep}
          onChange={(e) => {
            setCep(formatCep(e.target.value))
            setError(null)
          }}
          maxLength={9}
          className="shipping-input"
          aria-label="CEP para cálculo de frete"
        />
        <button type="submit" className="btn sm shipping-btn" disabled={loading}>
          {loading ? 'Consultando...' : 'Calcular'}
        </button>
      </form>

      {error && <p className="shipping-error">{error}</p>}

      {address && (
        <div className="shipping-result">
          <div className="shipping-location-badge">
            <CheckIcon className="h-4 w-4 text-emerald-500" />
            <span>
              Entrega disponível para <strong>{address.localidade} - {address.uf}</strong>
            </span>
          </div>

          <div className="shipping-options-list">
            <div className="shipping-option-item">
              <div className="option-info">
                <strong>Transportadora Rodoviária com Seguro</strong>
                <span className="muted small">Ideal para peças pesadas (câmbio, portas, motor, suspensão)</span>
              </div>
              <span className="badge-fast">
                <ClockIcon className="h-3 w-3" />
                <span>Rápido & Seguro</span>
              </span>
            </div>

            <div className="shipping-option-item">
              <div className="option-info">
                <strong>Correios (Sedex / PAC com Rastreamento)</strong>
                <span className="muted small">Ideal para peças leves (faróis, lanternas, módulos, sensores)</span>
              </div>
              <span className="badge-fast">
                <span>Rastreio Oficial</span>
              </span>
            </div>
          </div>

          {waLink && (
            <a
              data-wa="frete"
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn wa full-w shipping-wa-quote-btn"
            >
              <WhatsAppIcon className="wa-svg-icon" />
              <span>Cotar Frete Exato para {address.localidade} via WhatsApp</span>
            </a>
          )}
        </div>
      )}

      <div className="shipping-footer-note">
        <a
          href="https://buscacepinter.correios.com.br/app/endereco/index.php"
          target="_blank"
          rel="noopener noreferrer"
          className="shipping-help-link"
        >
          Não sei meu CEP →
        </a>
      </div>
    </div>
  )
}
