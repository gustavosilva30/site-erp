import type { Metadata } from 'next'
import type { CSSProperties, ReactNode } from 'react'
import { findStore } from '@/lib/api'
import { siteOrigin, telefoneIntl } from '@/lib/seo'
import { JsonLd } from '@/components/json-ld'
import { CartProvider } from '@/lib/cart'
import { ConsentProvider } from '@/lib/consent'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CookieBanner } from '@/components/cookie-banner'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})


export async function generateMetadata(): Promise<Metadata> {
  const store = await findStore()
  if (!store) return { title: 'Loja não encontrada' }
  const origem = await siteOrigin()
  const descricao = store.tagline || `Peças usadas para o seu carro na ${store.name}${store.city ? `, em ${store.city}` : ''}.`
  return {
    // Endereço base para os links canônicos e imagens de compartilhamento: o domínio da empresa que está sendo visitada.
    metadataBase: new URL(origem),
    title: { default: store.city ? `${store.name} | Peças usadas em ${store.city}` : store.name, template: `%s | ${store.name}` },
    description: descricao,
    alternates: { canonical: '/' },
    openGraph: { siteName: store.name, locale: 'pt_BR', type: 'website', title: store.name, description: descricao, ...(store.banners?.[0]?.image_url ? { images: [{ url: store.banners[0].image_url }] } : store.logo_url ? { images: [{ url: store.logo_url }] } : {}) },
    // Código do Google Search Console (validado no ERP: só letras, números, hífen e sublinhado).
    ...(store.google_verification ? { verification: { google: store.google_verification } } : {}),
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
  const origem = await siteOrigin()
  const rua = store.full_address.split(' · ')[0]
  return (
    <html lang="pt-BR" className={sansFont.variable}>
      <body className={sansFont.className} style={{ '--brand': brand } as CSSProperties}>
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'AutoPartsStore',
          name: store.name,
          url: origem,
          image: store.logo_url ?? undefined,
          logo: store.logo_url ?? undefined,
          description: store.tagline || undefined,
          telephone: telefoneIntl(store.whatsapp),
          address: store.full_address ? { '@type': 'PostalAddress', streetAddress: rua, addressLocality: store.city ?? undefined, addressRegion: store.state ?? undefined, addressCountry: 'BR' } : undefined,
          sameAs: [store.instagram && /^[A-Za-z0-9._]{1,40}$/.test(store.instagram) ? `https://www.instagram.com/${store.instagram}` : null, store.google_reviews_url].filter(Boolean),
        }} />
        <ConsentProvider>
          <CartProvider>
            <Header store={store} />
            {children}
            <Footer store={store} />
          </CartProvider>
          <CookieBanner hasCookiePolicy={Boolean(store.policies?.cookies)} hasPrivacyPolicy={Boolean(store.policies?.privacidade)} />
        </ConsentProvider>
      </body>
    </html>
  )
}
