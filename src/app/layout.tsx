import type { Metadata } from 'next'
import type { CSSProperties, ReactNode } from 'react'
import { getStore } from '@/lib/api'
import { CartProvider } from '@/lib/cart'
import { Header } from '@/components/header'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore()
  return {
    title: { default: store.name, template: `%s | ${store.name}` },
    description: store.tagline || `Peças para o seu carro na ${store.name}.`,
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const store = await getStore()
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
