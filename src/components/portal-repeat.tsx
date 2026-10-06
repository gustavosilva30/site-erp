'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePortalCart } from '@/lib/portal-cart'
import type { PortalOrder, PortalProduct } from '@/lib/portal-data'

/**
 * Repetir um pedido: busca no ERP o que dos mesmos produtos ainda está disponível (com o preço de hoje) e põe no carrinho, até a
 * quantidade pedida da vez e o estoque. O que acabou fica de fora e o cliente é avisado.
 */
export function RepeatOrderButton({ items }: { items: PortalOrder['items'] }) {
  const router = useRouter()
  const { add } = usePortalCart()
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const repetir = async () => {
    setOcupado(true); setAviso(null)
    try {
      const ids = items.map((i) => i.product_id).filter((x): x is string => Boolean(x))
      const res = await fetch('/api/portal/produtos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
      const j = await res.json().catch(() => null)
      if (!res.ok) {
        if (res.status === 401) { router.replace('/entrar'); return }
        setAviso(j?.error ?? 'Não foi possível repetir o pedido.')
        return
      }
      const disponiveis = new Map<string, PortalProduct>((j.products as PortalProduct[]).map((p) => [p.id, p]))
      let colocados = 0
      for (const it of items) {
        const p = it.product_id ? disponiveis.get(it.product_id) : undefined
        if (!p) continue
        add({ id: p.id, title: p.title, price: p.price_with_discount, photo: p.photo, sku: p.sku, available: p.available }, Math.min(it.quantity, p.available))
        colocados++
      }
      if (colocados === 0) { setAviso('Nenhum destes produtos está disponível agora.'); return }
      // O aviso acompanha o cliente ate o carrinho (a pagina muda logo em seguida).
      if (colocados < items.length) {
        try { sessionStorage.setItem('portal-aviso', `${items.length - colocados} item(ns) do pedido anterior não estão mais disponíveis e ficaram de fora.`) } catch { /* sem armazenamento: sem aviso */ }
      }
      router.push('/conta/carrinho')
    } catch {
      setAviso('Sem conexão. Tente novamente.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div>
      <button type="button" className="btn ghost sm" onClick={repetir} disabled={ocupado}>{ocupado ? 'Conferindo estoque...' : 'Repetir este pedido'}</button>
      {aviso && <p className="alert" role="status">{aviso}</p>}
    </div>
  )
}
