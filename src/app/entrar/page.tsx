import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getStore } from '@/lib/api'
import { portalCall, portalToken } from '@/lib/portal'
import { LoginForm } from '@/components/portal-forms'

export const metadata: Metadata = { title: 'Área do cliente', robots: { index: false, follow: false } }

export default async function Entrar() {
  const store = await getStore()
  if (!store.portal_enabled) notFound()
  // Já tem sessão válida: vai direto para a área do cliente.
  const token = await portalToken()
  if (token && (await portalCall('/me', { token })).data) redirect('/conta')
  return (
    <main className="wrap sec">
      <div className="pbox">
        <h1 className="h2">Área do cliente</h1>
        <p className="muted">Entre para ver os produtos disponíveis e fazer o seu pedido na {store.name}.</p>
        <LoginForm />
      </div>
    </main>
  )
}
