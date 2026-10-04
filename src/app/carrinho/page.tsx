import type { Metadata } from 'next'
import { getStore } from '@/lib/api'
import { CartView } from '@/components/cart-view'

export const metadata: Metadata = { title: 'Carrinho' }

export default async function Carrinho() {
  const store = await getStore()
  return (
    <main className="wrap">
      <CartView storeName={store.name} whatsapp={store.whatsapp} />
    </main>
  )
}
