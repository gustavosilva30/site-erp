import Link from 'next/link'
import type { SucataCard } from '@/lib/api'
import { formatEngine } from '@/lib/format'
import { sucataPath } from '@/lib/slug'
import { ArrowRightIcon } from './icons'

export function SucataCardView({ sucata, prioridade = false }: { sucata: SucataCard; prioridade?: boolean }) {
  const meta = [sucata.year, sucata.fuel, formatEngine(sucata.engine), sucata.transmission].filter(Boolean).join(' · ')
  return (
    <div className="card sucata-card-v2">
      <Link href={sucataPath(sucata)} className="card-top">
        <div className="ph">
          {sucata.photo ? (
            <img src={sucata.photo} alt={sucata.title} loading={prioridade ? 'eager' : 'lazy'} decoding="async" />
          ) : (
            <div className="nophoto">
              <span>Sem foto</span>
            </div>
          )}
          <div className="card-badges">
            <span className="badge sucata-status">
              <span className="status-dot green" />
              <span>No Pátio / Desmonte</span>
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="t">{sucata.title}{sucata.year ? ` ${sucata.year}` : ''}</div>
          {meta && <div className="m">{meta}</div>}
        </div>
      </Link>
      <div className="card-act sucata-card-act">
        <span className="sucata-parts-info">
          {sucata.parts_count > 0 ? `${sucata.parts_count} peças em estoque` : 'Aguardando desmontagem'}
        </span>
        <Link className="btn sm ghost sucata-action-btn" href={sucataPath(sucata)}>
          <span>Ver peças</span>
          <ArrowRightIcon className="inline-icon" />
        </Link>
      </div>
    </div>
  )
}
