'use client'

import Link from 'next/link'

/** Se uma página da área do cliente falhar, o cliente vê isto em vez de uma tela de erro técnica. */
export default function ContaErro({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="wrap sec">
      <div className="pbox" style={{ textAlign: 'center' }}>
        <h1 className="h2">Não foi possível abrir esta página</h1>
        <p className="muted">Pode ter sido uma falha passageira. Tente de novo, ou volte para a lista de produtos.</p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>
          <button type="button" className="btn" onClick={reset}>Tentar de novo</button>
          <Link href="/conta/produtos" className="btn ghost">Ver produtos</Link>
        </div>
      </div>
    </main>
  )
}
