'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePortalCart } from '@/lib/portal-cart'
import { money } from '@/lib/format'

/**
 * Revisar e enviar o pedido. Os preços aqui são só uma prévia: o ERP recalcula tudo (preço, desconto, total e estoque) ao
 * receber. Pagamento e entrega ficam para combinar com a loja.
 */
export function PortalCartView() {
  const router = useRouter()
  const { items, total, setQty, remove, clear } = usePortalCart()
  const [fulfillment, setFulfillment] = useState<'retirada' | 'entrega'>('retirada')
  const [notes, setNotes] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  // Aviso deixado por "repetir pedido" (itens que acabaram): aparece uma vez.
  useEffect(() => {
    try {
      const a = sessionStorage.getItem('portal-aviso')
      if (a) { setAviso(a); sessionStorage.removeItem('portal-aviso') }
    } catch { /* ignora */ }
  }, [])

  if (items.length === 0) {
    return (
      <div className="sec">
        <p className="muted">Seu carrinho está vazio.</p>
        <Link href="/conta/produtos" className="btn">Ver produtos</Link>
      </div>
    )
  }

  const enviar = async () => {
    setEnviando(true); setErro(null)
    try {
      const res = await fetch('/api/portal/pedidos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map((i) => ({ product_id: i.id, quantity: i.qty })), fulfillment, notes }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok) {
        if (res.status === 401) { router.replace('/entrar'); return }
        setErro(j?.error ?? 'Não foi possível enviar o pedido.')
        return
      }
      clear()
      router.replace(`/conta/pedidos/${encodeURIComponent(j.id)}?novo=1`)
    } catch {
      setErro('Sem conexão. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="sec">
      <h1 className="h2">Seu pedido</h1>
      {aviso && <p className="alert" role="status">{aviso}</p>}
      {items.map((i) => (
        <div className="cartrow" key={i.id}>
          <div className="ph">{i.photo && <img src={i.photo} alt="" />}</div>
          <div>
            <div className="title">{i.title}</div>
            <div className="qty">
              <button type="button" aria-label="Diminuir" onClick={() => setQty(i.id, i.qty - 1)}>-</button>
              <span>{i.qty}</span>
              <button type="button" aria-label="Aumentar" onClick={() => setQty(i.id, i.qty + 1)} disabled={i.qty >= i.available}>+</button>
              <button type="button" className="linkbtn" onClick={() => remove(i.id)}>remover</button>
            </div>
          </div>
          <div className="price">{money(i.price * i.qty)}</div>
        </div>
      ))}

      <div className="pform" style={{ marginTop: 18 }}>
        <fieldset className="field">
          <span>Como prefere receber?</span>
          <label className="row" style={{ gap: 8 }}><input type="radio" name="ful" checked={fulfillment === 'retirada'} onChange={() => setFulfillment('retirada')} /> Retirar na loja</label>
          <label className="row" style={{ gap: 8 }}><input type="radio" name="ful" checked={fulfillment === 'entrega'} onChange={() => setFulfillment('entrega')} /> Receber por entrega</label>
          <small className="muted">É só uma preferência: a entrega e o pagamento são combinados com a loja.</small>
        </fieldset>
        <label className="field">
          <span>Observação (opcional)</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={500} placeholder="Ex.: preciso até sexta" />
        </label>
      </div>

      <div className="row" style={{ justifyContent: 'space-between', marginTop: 18 }}>
        <span className="price">Total estimado {money(total)}</span>
        <div className="row">
          <button type="button" className="linkbtn" onClick={clear}>esvaziar</button>
          <button type="button" className="btn" onClick={enviar} disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar pedido'}</button>
        </div>
      </div>
      {erro && <p className="alert" role="alert">{erro}</p>}
      <p className="muted small">O pedido chega para a loja aprovar e os produtos ficam reservados para você. O valor final é confirmado pela loja.</p>
    </div>
  )
}
