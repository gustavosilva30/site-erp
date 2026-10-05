import Link from 'next/link'
import type { SucataCard } from '@/lib/api'
import { sucataPath } from '@/lib/slug'

export function SucataCardView({ sucata, prioridade = false }: { sucata: SucataCard; prioridade?: boolean }) {
  const meta = [sucata.year, sucata.fuel, sucata.engine].filter(Boolean).join(' · ')
  return (
    <div className="card">
      <Link href={sucataPath(sucata)}>
        <div className="ph">
          {sucata.photo ? <img src={sucata.photo} alt={sucata.title} loading={prioridade ? 'eager' : 'lazy'} decoding="async" /> : 'Sem foto'}
        </div>
        <div className="t">{sucata.title}{sucata.year ? ` ${sucata.year}` : ''}</div>
        {meta && <div className="m">{meta}</div>}
      </Link>
      <div className="p">
        <span className="price" style={{ fontSize: '.95rem' }}>{sucata.parts_count > 0 ? `${sucata.parts_count} ${sucata.parts_count === 1 ? 'peça disponível' : 'peças disponíveis'}` : 'Sem peças no momento'}</span>
        <Link className="btn sm" href={sucataPath(sucata)}>Ver peças</Link>
      </div>
    </div>
  )
}
