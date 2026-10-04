'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { money, whatsappLink } from '@/lib/format'

/** O pedido vira uma mensagem de WhatsApp para a loja; ela confirma estoque, frete e forma de pagamento na conversa. */
export function CartView({ storeName, whatsapp }: { storeName: string; whatsapp: string | null }) {
  const { items, total, setQty, remove, clear } = useCart()

  if (items.length === 0) {
    return (
      <div className="sec">
        <p className="muted">Seu carrinho está vazio.</p>
        <Link href="/produtos" className="btn">Ver peças</Link>
      </div>
    )
  }

  const linhas = items.map((i) => `${i.qty}x ${i.title}${i.sku ? ` (cód. ${i.sku})` : ''} - ${money(i.price * i.qty)}`)
  const texto = `Olá! Quero pedir na ${storeName}:\n\n${linhas.join('\n')}\n\nTotal: ${money(total)}\n\nPode confirmar a disponibilidade?`
  const link = whatsappLink(whatsapp, texto)

  return (
    <div className="sec">
      <h1 className="h2">Seu carrinho</h1>
      {items.map((i) => (
        <div className="cartrow" key={i.id}>
          <div className="ph">{i.photo && <img src={i.photo} alt="" />}</div>
          <div>
            <div className="title">{i.title}</div>
            <div className="qty">
              <button type="button" aria-label="Diminuir" onClick={() => setQty(i.id, i.qty - 1)}>-</button>
              <span>{i.qty}</span>
              <button type="button" aria-label="Aumentar" onClick={() => setQty(i.id, i.qty + 1)}>+</button>
              <button type="button" className="linkbtn" onClick={() => remove(i.id)}>remover</button>
            </div>
          </div>
          <div className="price">{money(i.price * i.qty)}</div>
        </div>
      ))}
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 18 }}>
        <span className="price">Total {money(total)}</span>
        <div className="row">
          <button type="button" className="linkbtn" onClick={clear}>esvaziar</button>
          {link
            ? <a className="btn wa" href={link} target="_blank" rel="noopener noreferrer">Finalizar pelo WhatsApp</a>
            : <span className="muted small">Esta loja ainda não configurou o WhatsApp.</span>}
        </div>
      </div>
      <p className="muted small">O valor final, o frete e a forma de pagamento são combinados com a loja na conversa.</p>
    </div>
  )
}
