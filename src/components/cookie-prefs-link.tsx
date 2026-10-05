'use client'

import { useConsent } from '@/lib/consent'

/** "Preferências de cookies": reabre o aviso para o visitante mudar a escolha (direito de revogar o consentimento). */
export function CookiePrefsLink() {
  const { reopen } = useConsent()
  return <button type="button" className="linkbtn" onClick={reopen}>Preferências de cookies</button>
}
