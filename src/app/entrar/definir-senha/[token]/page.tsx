import type { Metadata } from 'next'
import Link from 'next/link'
import { getStore } from '@/lib/api'
import { portalCall } from '@/lib/portal'
import { SetPasswordForm } from '@/components/portal-forms'

export const metadata: Metadata = { title: 'Criar senha', robots: { index: false, follow: false } }

/** Página do link do convite (uso único, 48 h): o cliente cria a própria senha. */
export default async function DefinirSenha({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  await getStore()
  const info = await portalCall<{ login: string; customer_name: string; company_name: string }>(`/invite/${encodeURIComponent(token.slice(0, 80))}`)
  if (!info.data) {
    return (
      <main className="wrap sec">
        <div className="pbox">
          <h1 className="h2">Link inválido ou expirado</h1>
          <p className="muted">Este link já foi usado ou venceu. Peça um novo à loja.</p>
          <Link href="/entrar" className="btn">Ir para o login</Link>
        </div>
      </main>
    )
  }
  return (
    <main className="wrap sec">
      <div className="pbox">
        <h1 className="h2">Criar sua senha</h1>
        <p className="muted">Olá, {info.data.customer_name.split(' ')[0]}! Crie a senha de acesso ao portal da {info.data.company_name}. Seu login será <strong>{info.data.login}</strong>.</p>
        <SetPasswordForm token={token} />
      </div>
    </main>
  )
}
