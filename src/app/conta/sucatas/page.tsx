import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStore } from '@/lib/api'
import { portalGet, requireMe, type PortalSucataCard } from '@/lib/portal-data'

export const metadata: Metadata = { title: 'Veículos em desmontagem', robots: { index: false, follow: false } }

type Raw = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

/** Sucatas que a loja tem no site (veículos em desmontagem), para o cliente ver as peças de cada uma. */
export default async function ContaSucatas({ searchParams }: { searchParams: Promise<Raw> }) {
  const raw = await searchParams
  const page = Math.max(1, Number.parseInt(one(raw.page) ?? '1', 10) || 1)
  const { token } = await requireMe()
  const store = await getStore()
  if (!store.has_sucatas) notFound()
  const r = await portalGet<{ sucatas: PortalSucataCard[]; total: number; limit: number }>(token, `/sucatas?page=${page}&limit=24`)
  const sucatas = r?.sucatas ?? []
  const total = r?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / (r?.limit ?? 24)))
  const href = (p: number) => (p > 1 ? `/conta/sucatas?page=${p}` : '/conta/sucatas')

  return (
    <main className="wrap sec">
      <div className="psec-head">
        <h1 className="h2" style={{ margin: 0 }}>Veículos em desmontagem</h1>
        <span className="muted small">{total} {total === 1 ? 'veículo' : 'veículos'}</span>
      </div>
      <p className="muted" style={{ marginTop: 0 }}>Escolha um veículo para ver as peças que já tiramos dele e ainda estão disponíveis.</p>

      {sucatas.length === 0 && <div className="pempty"><p><strong>Nenhum veículo em desmontagem no momento.</strong></p></div>}
      <div className="pgrid">
        {sucatas.map((s) => {
          const detalhe = `/conta/sucatas/${encodeURIComponent(s.id)}`
          return (
            <article className="pcard" key={s.id}>
              <Link className="pimg" href={detalhe} aria-label={`Ver as peças de ${s.title}`}>
                {s.photo ? <img src={s.photo} alt={s.title} loading="lazy" /> : <span className="nophoto">Sem foto</span>}
                <span className="tag dark">{s.parts_count} {s.parts_count === 1 ? 'peça' : 'peças'}</span>
              </Link>
              <div className="pbody">
                <Link className="ptitle" href={detalhe}>{s.title}</Link>
                <div className="pmeta">{[s.year, s.color, s.fuel, s.engine].filter(Boolean).join(' · ')}</div>
              </div>
              <div className="pact"><Link href={detalhe} className="btn sm">Ver peças</Link></div>
            </article>
          )
        })}
      </div>

      {pages > 1 && (
        <nav className="pager" aria-label="Páginas">
          {page > 1 && <Link href={href(page - 1)} className="btn ghost sm">← Anterior</Link>}
          <span className="muted small">Página {page} de {pages}</span>
          {page < pages && <Link href={href(page + 1)} className="btn ghost sm">Próxima →</Link>}
        </nav>
      )}
    </main>
  )
}
