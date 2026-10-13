import type { Metadata } from 'next'
import Link from 'next/link'
import { getStore } from '@/lib/api'
import { Breadcrumb } from '@/components/listing'
import { DetranBadgeIcon } from '@/components/detran-badge'
import {
  ShieldCheckIcon,
  TruckIcon,
  PackageIcon,
  MapPinIcon,
  ClockIcon,
  WhatsAppIcon,
  LockIcon,
  CheckIcon,
} from '@/components/icons'
import { MapEmbed } from '@/components/map-embed'
import { storeContactLink } from '@/lib/format'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore()
  return {
    title: `Sobre a ${store.name} | Desmanche Credenciado e Peças Originais`,
    description: `Conheça a ${store.name}: desmanche credenciado no DETRAN. Peças automotivas usadas originais com garantia, nota fiscal e procedência comprovada.`,
  }
}

export default async function SobrePage() {
  const store = await getStore()
  const wa = storeContactLink(store, `Olá! Vim pela página "Sobre a Loja" e gostaria de tirar uma dúvida.`)
  const credencial = store.trust?.credential_text
  const cnpj = store.trust?.tax_id

  const trilha = [
    { label: 'Início', href: '/' },
    { label: 'Sobre a Loja' },
  ]

  const pilares = [
    {
      icon: <ShieldCheckIcon className="pilar-svg text-emerald-500" />,
      title: 'Procedência 100% Legal',
      desc: 'Veículos adquiridos legalmente em leilões oficiais com certidão de baixa definitiva no sistema do DETRAN.',
    },
    {
      icon: <PackageIcon className="pilar-svg text-blue-500" />,
      title: 'Peças Testadas & Rastreáveis',
      desc: 'Todas as peças mecânicas, elétricas e de acabamento passam por rigoroso teste técnico antes de irem para o estoque.',
    },
    {
      icon: <LockIcon className="pilar-svg text-amber-500" />,
      title: 'Garantia de 90 Dias com NF-e',
      desc: 'Compre com segurança jurídica e comercial. Emitimos nota fiscal eletrônica e garantia de funcionamento.',
    },
    {
      icon: <TruckIcon className="pilar-svg text-purple-500" />,
      title: 'Envio Rápido para Todo o Brasil',
      desc: 'Parcerias com transportadoras rodoviárias e Correios para envio protegido com seguro de carga e rastreio.',
    },
  ]

  return (
    <main className="wrap sec sobre-page">
      <Breadcrumb items={trilha} />

      {/* Header Institucional */}
      <section className="sobre-hero">
        <div className="sobre-hero-badge">
          <DetranBadgeIcon className="h-6 w-6" />
          <span>Desmanche Veicular Credenciado no DETRAN</span>
        </div>
        <h1 className="sobre-title">Conheça a {store.name}</h1>
        <p className="sobre-tagline">
          {store.tagline || 'Peças automotivas usadas originais, com garantia de procedência e preços justos.'}
        </p>
      </section>

      {/* Pilares de Credibilidade */}
      <section className="sobre-pilares-grid">
        {pilares.map((p, idx) => (
          <div key={idx} className="pilar-card">
            <div className="pilar-icon-wrapper">{p.icon}</div>
            <strong className="pilar-title">{p.title}</strong>
            <p className="pilar-desc">{p.desc}</p>
          </div>
        ))}
      </section>

      {/* Conteúdo Institucional em 2 Colunas */}
      <section className="sobre-content-grid">
        <div className="sobre-text-col">
          <h2 className="h2">Compromisso com a Legalidade e Qualidade</h2>
          <p>
            Na <strong>{store.name}</strong>, atuamos com rigorosa conformidade com a <strong>Lei Federal nº 12.977/2014</strong> (Lei do Desmanche), que regulamenta a atividade de desmontagem de veículos no Brasil.
          </p>
          <p>
            Nosso compromisso é combater o comércio ilegal e fornecer aos nossos clientes peças genuínas, testadas e seguras por uma fração do valor de uma peça nova na concessionária.
          </p>

          <div className="sobre-checklist">
            <div className="check-item">
              <CheckIcon className="check-icon text-emerald-500" />
              <span>Desmontagem técnica sem danos estruturais às peças</span>
            </div>
            <div className="check-item">
              <CheckIcon className="check-icon text-emerald-500" />
              <span>Etiqueta de rastreabilidade e número de série gravado</span>
            </div>
            <div className="check-item">
              <CheckIcon className="check-icon text-emerald-500" />
              <span>Atendimento técnico especializado para mecânicos e proprietários</span>
            </div>
            <div className="check-item">
              <CheckIcon className="check-icon text-emerald-500" />
              <span>Economia circular: reaproveitamento ecológico e sustentável</span>
            </div>
          </div>

          {credencial && (
            <div className="sobre-credencial-box">
              <DetranBadgeIcon className="h-8 w-8" />
              <div>
                <strong>Registro Oficial:</strong>
                <span>{credencial}</span>
              </div>
            </div>
          )}

          {wa && (
            <div style={{ marginTop: 24 }}>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn wa">
                <WhatsAppIcon className="wa-svg-icon" />
                <span>Falar com Nossa Equipe no WhatsApp</span>
              </a>
            </div>
          )}
        </div>

        <div className="sobre-info-col">
          <div className="sobre-card-dados">
            <h3 className="h3" style={{ marginTop: 0 }}>Informações da Empresa</h3>

            {cnpj && (
              <div className="dado-row">
                <span className="dado-label">CNPJ:</span>
                <span className="dado-val">{cnpj}</span>
              </div>
            )}

            {store.full_address && (
              <div className="dado-row">
                <MapPinIcon className="dado-icon" />
                <div>
                  <span className="dado-label">Endereço da Loja Física:</span>
                  <p className="dado-val" style={{ margin: 0 }}>{store.full_address}</p>
                </div>
              </div>
            )}

            {store.hours && (
              <div className="dado-row">
                <ClockIcon className="dado-icon" />
                <div>
                  <span className="dado-label">Horário de Atendimento:</span>
                  <p className="dado-val" style={{ margin: 0 }}>{store.hours}</p>
                </div>
              </div>
            )}

            {store.map_query && (
              <div className="sobre-map-wrapper">
                <MapEmbed query={store.map_query} />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
