import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStore } from '@/lib/api'
import { portalGet, requireMe, type PortalSucataDetail } from '@/lib/portal-data'
import { PortalGallery } from '@/components/portal-gallery'
import { PortalProductCard } from '@/components/portal-product-card'

export const metadata: Metadata = { title: 'Veículo em desmontagem', robots: { index: false, follow: false } }

/** Um veículo em desmontagem: fotos, dados e as peças dele que ainda estão disponíveis (com o preço do cliente). */
export default async function ContaSucata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { token, me } = await requireMe()
  const s = await portalGet<PortalSucataDetail>(token, `/sucatas/${encodeURIComponent(id.slice(0, 255))}`)
  if (!s) notFound()
  const store = await getStore()
  const fotos = Array.isArray(s.photos) ? s.photos : []
  const pecas = Array.isArray(s.parts) ? s.parts : []
  const dados: [string, string][] = ([
    ['Ano', s.year ?? ''],
    ['Cor', s.color ?? ''],
    ['Combustível', s.fuel ?? ''],
    ['Motor', s.engine ?? ''],
  ] as [string, string][]).filter(([, v]) => v)

  return (
    <main className="wrap sec">
      <p className="muted small"><Link href="/conta/sucatas">← Voltar aos veículos</Link></p>
      <div className="detail">
        <PortalGallery photos={fotos} alt={s.title} />
        <div>
          <h1>{s.title}</h1>
          <p className="muted">Veículo em desmontagem. Abaixo estão as peças dele que ainda temos em estoque.</p>
          {dados.length > 0 && (
            <table className="specs">
              <tbody>{dados.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody>
            </table>
          )}
          <p className="pstock" style={{ marginTop: 14 }}>{pecas.length} {pecas.length === 1 ? 'peça disponível' : 'peças disponíveis'} deste veículo</p>
        </div>
      </div>

      <div className="psec-head" style={{ marginTop: 28 }}><h2>Peças deste veículo</h2></div>
      {pecas.length === 0 && <div className="pempty"><p><strong>Nenhuma peça disponível desta sucata agora.</strong></p><p className="muted small">Fale com a loja para saber das próximas peças.</p></div>}
      <div className="pgrid">
        {pecas.map((p) => <PortalProductCard key={p.id} p={p} descontoPercent={me.discount_percent} loja={store} />)}
      </div>
    </main>
  )
}
