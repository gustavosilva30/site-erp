'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export interface CartItem {
  id: string
  title: string
  price: number
  photo: string | null
  sku: string | null
  qty: number
}

interface CartCtx {
  items: CartItem[]
  count: number
  total: number
  add: (item: Omit<CartItem, 'qty'>) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
}

const Ctx = createContext<CartCtx | null>(null)
const KEY = 'loja-carrinho'

/** Carrinho no navegador. So serve para montar a mensagem do WhatsApp: o preco final e confirmado pela loja na conversa. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      if (Array.isArray(saved)) {
        setItems(saved.filter((i) => i && typeof i.id === 'string' && Number.isFinite(i.price) && i.qty > 0).slice(0, 50))
      }
    } catch { /* sem armazenamento: carrinho vazio */ }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* ignora */ }
  }, [items, ready])

  const add = useCallback((item: Omit<CartItem, 'qty'>) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id)
      if (found) return prev.map((i) => (i.id === item.id ? { ...i, qty: Math.min(99, i.qty + 1) } : i))
      return [...prev, { ...item, qty: 1 }].slice(0, 50)
    })
  }, [])
  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(99, qty || 1)) } : i)))
  }, [])
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), [])
  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartCtx>(() => ({
    items,
    count: items.reduce((s, i) => s + i.qty, 0),
    total: items.reduce((s, i) => s + i.qty * i.price, 0),
    add, setQty, remove, clear,
  }), [items, add, setQty, remove, clear])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart fora do CartProvider')
  return ctx
}
