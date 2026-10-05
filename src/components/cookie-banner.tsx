'use client'

import Link from 'next/link'
import { useConsent } from '@/lib/consent'

/** Aviso de cookies: o visitante aceita os de terceiros (mapa) ou fica só com os necessários. */
export function CookieBanner({ hasCookiePolicy, hasPrivacyPolicy }: { hasCookiePolicy: boolean; hasPrivacyPolicy: boolean }) {
  const { decided, acceptAll, rejectOptional } = useConsent()
  if (decided) return null
  return (
    <div className="cookie-banner" role="dialog" aria-modal="false" aria-label="Aviso de cookies">
      <p>
        Usamos cookies necessários para o carrinho funcionar. Com a sua permissão, também carregamos o mapa do Google, que pode usar cookies de terceiros.
        {hasCookiePolicy && <> Saiba mais na <Link href="/politicas/cookies">política de cookies</Link>.</>}
        {!hasCookiePolicy && hasPrivacyPolicy && <> Saiba mais na <Link href="/politicas/privacidade">política de privacidade</Link>.</>}
      </p>
      <div className="cookie-actions">
        <button type="button" className="btn ghost sm" onClick={rejectOptional}>Só os necessários</button>
        <button type="button" className="btn sm" onClick={acceptAll}>Aceitar todos</button>
      </div>
    </div>
  )
}
