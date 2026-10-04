import type { Metadata } from 'next'
import type { CSSProperties, ReactNode } from 'react'
import { findStore } from '@/lib/api'
import { CartProvider } from '@/lib/cart'
import { Header } from '@/components/header'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const store = await findStore()
  if (!store) return { title: 'Loja não encontrada' }
  return {
    title: { default: store.name, template: `%s | ${store.name}` },
    description: store.tagline || `Peças para o seu carro na ${store.name}.`,
    // O ícone da aba é a logo que a empresa enviou nas configurações.
    ...(store.logo_url ? { icons: { icon: store.logo_url } } : {}),
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const store = await findStore()
  // Sem loja ativa para este endereco: mensagem simples (e nunca uma tela em branco).
  if (!store) {
    return (
      <html lang="pt-BR">
        <body>
          <main className="wrap sec">
            <h1 className="h2">Loja não encontrada</h1>
            <p className="muted">Este endereço não tem uma loja ativa no momento.</p>
          </main>
        </body>
      </html>
    )
  }
  // A cor vem do ERP ja validada (#RRGGBB); aqui confere de novo antes de virar estilo.
  const brand = /^#[0-9a-f]{6}$/i.test(store.primary_color) ? store.primary_color : '#111111'
  return (
    <html lang="pt-BR">
      <body style={{ '--brand': brand } as CSSProperties}>
        <CartProvider>
          <Header store={store} />
          {children}
          <footer className="foot">
            <div className="wrap">
              <span>{[store.name, store.address, store.hours].filter(Boolean).join(' · ')}</span>
              <span>Loja criada com Desmonte360</span>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  )
}
