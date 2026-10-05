import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPolicy, getStore } from '@/lib/api'
import { LEGAL_PAGES } from '@/components/footer'
import { PolicyText } from '@/components/policy-text'

type Props = { params: Promise<{ tipo: string }> }

const valido = (tipo: string) => LEGAL_PAGES.some((p) => p.slug === tipo)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tipo } = await params
  return { title: LEGAL_PAGES.find((p) => p.slug === tipo)?.label ?? 'Políticas' }
}

export default async function Politica({ params }: Props) {
  const { tipo } = await params
  if (!valido(tipo)) notFound()
  const store = await getStore()
  const politica = await getPolicy(store.slug, tipo)
  if (!politica) notFound()
  return (
    <main className="wrap sec">
      <PolicyText text={politica.text} />
    </main>
  )
}
