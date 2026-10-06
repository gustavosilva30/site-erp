'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface PortalCartItem {
  id: string
  title: string
  /** Preço já com o desconto do cliente (só para exibir; o ERP recalcula o pedido). */
  price: number
  photo: string | null
  sku: string | null
  qty: number
  /** Quanto havia disponível ao adicionar: limita o botão "+". */
  available: number
}

interface Ctx {
  items: PortalCartItem[]
  count: number
  total: number
  add: (item: Omit<PortalCartItem, 'qty'>, qty: number) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
}

const PortalCart = createContext<Ctx | null>(null)
const KEY = 'portal-carrinho'

/** Carrinho do portal, no navegador. Só guarda o que o cliente escolheu: quem confirma preço e estoque é o ERP ao enviar o pedido. */
export function PortalCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PortalCartItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      if (Array.isArray(saved)) {
        setItems(saved.filter((i) => i && typeof i.id === 'string' && Number.isFinite(i.price) && i.qty > 0).slice(0, 60))
      }
    } catch { /* sem armazenamento: carrinho vazio */ }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* ignora */ }
  }, [items, ready])

  const add = useCallback((item: Omit<PortalCartItem, 'qty'>, qty: number) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id)
      const max = Math.max(1, item.available)
      if (found) return prev.map((i) => (i.id === item.id ? { ...i, ...item, qty: Math.min(max, i.qty + qty) } : i))
      return [...prev, { ...item, qty: Math.min(max, Math.max(1, qty)) }].slice(0, 60)
    })
  }, [])
  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(Math.max(1, i.available), Math.trunc(qty) || 1)) } : i)))
  }, [])
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), [])
  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<Ctx>(() => ({
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    total: items.reduce((n, i) => n + i.price * i.qty, 0),
    add, setQty, remove, clear,
  }), [items, add, setQty, remove, clear])

  return <PortalCart.Provider value={value}>{children}</PortalCart.Provider>
}

export function usePortalCart(): Ctx {
  const c = useContext(PortalCart)
  if (!c) throw new Error('usePortalCart fora do PortalCartProvider')
  return c
}

export function usePortalCartOptional(): Ctx | null {
  return useContext(PortalCart)
}
