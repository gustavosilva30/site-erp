import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStore } from '@/lib/api'
import { ForgotForm } from '@/components/portal-forms'

export const metadata: Metadata = { title: 'Esqueci a senha', robots: { index: false, follow: false } }

export default async function Esqueci() {
  const store = await getStore()
  if (!store.portal_enabled) notFound()
  return (
    <main className="wrap sec">
      <div className="pbox">
        <h1 className="h2">Esqueci a senha</h1>
        <p className="muted">Informe o seu login e enviaremos pelo WhatsApp um link para criar uma nova senha.</p>
        <ForgotForm />
        <p className="muted small" style={{ marginTop: 14 }}><Link href="/entrar">← Voltar ao login</Link></p>
      </div>
    </main>
  )
}
