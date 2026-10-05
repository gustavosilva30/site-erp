'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/**
 * Consentimento de cookies (LGPD). Os recursos necessários (carrinho e esta própria escolha) funcionam sempre; os de terceiros
 * (hoje, o mapa do Google) só carregam depois que o visitante permite. A escolha fica salva no navegador.
 */
interface Consent {
  /** Já escolheu? Enquanto não, o aviso aparece. */
  decided: boolean
  /** Permitiu recursos de terceiros? */
  thirdParty: boolean
  acceptAll: () => void
  rejectOptional: () => void
  /** Reabre o aviso para mudar a escolha. */
  reopen: () => void
}

const Ctx = createContext<Consent | null>(null)
const KEY = 'loja-cookies'

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [decided, setDecided] = useState(false)
  const [thirdParty, setThirdParty] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null')
      if (saved && typeof saved.thirdParty === 'boolean') {
        setThirdParty(saved.thirdParty)
        setDecided(true)
      }
    } catch { /* sem armazenamento: o aviso aparece de novo */ }
    setReady(true)
  }, [])

  const gravar = useCallback((permitido: boolean) => {
    setThirdParty(permitido)
    setDecided(true)
    try { localStorage.setItem(KEY, JSON.stringify({ thirdParty: permitido, at: new Date().toISOString() })) } catch { /* ignora */ }
  }, [])

  const value = useMemo<Consent>(() => ({
    // Antes de ler o navegador, considera "decidido" para o aviso não piscar na tela.
    decided: ready ? decided : true,
    thirdParty,
    acceptAll: () => gravar(true),
    rejectOptional: () => gravar(false),
    reopen: () => setDecided(false),
  }), [ready, decided, thirdParty, gravar])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useConsent() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useConsent fora do ConsentProvider')
  return ctx
}
