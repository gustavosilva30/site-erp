import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getStore, listSucatas } from '@/lib/api'
import { cidadeDe, cortar } from '@/lib/seo'
import { Breadcrumb, Pager } from '@/components/listing'
import { SucataCardView } from '@/components/sucata-card'

type Props = { searchParams: Promise<{ page?: string }> }

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore()
  return {
    title: cortar(`Carros em desmanche${store.city ? ` em ${store.city}` : ''}: sucatas e peças`, 62),
    description: cortar(`Veja os veículos que a ${store.name} está desmontando${store.city ? ` em ${cidadeDe(store)}` : ''} e as peças que ainda temos de cada um.`, 158),
    alternates: { canonical: '/sucatas' },
  }
}

export default async function Sucatas({ searchParams }: Props) {
  const sp = await searchParams
  const store = await getStore()
  // Sem nenhuma sucata escolhida pela empresa, a página não existe.
  if (!store.has_sucatas) notFound()
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1)
  const result = await listSucatas(store.slug, page, 24)
  const pages = Math.max(1, Math.ceil(result.total / result.limit))

  return (
    <main className="wrap sec">
      <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Sucatas' }]} />
      <h1 className="h2">Sucatas e carros em desmanche <span className="muted small">({result.total})</span></h1>
      <p className="muted">Estes são os veículos que temos. Abra o veículo para ver as peças dele que ainda estão em estoque.</p>
      {result.sucatas.length === 0
        ? <p className="muted">Nenhum veículo no momento.</p>
        : <div className="grid">{result.sucatas.map((s, i) => <SucataCardView key={s.id} sucata={s} prioridade={i < 3} />)}</div>}
      <Pager page={page} pages={pages} hrefFor={(n) => (n > 1 ? `/sucatas?page=${n}` : '/sucatas')} />
    </main>
  )
}
