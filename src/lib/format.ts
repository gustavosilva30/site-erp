const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const money = (v: number) => brl.format(v)

/** Link do WhatsApp da loja. O numero vem do ERP (so digitos); o texto e codificado e limitado. */
export const whatsappLink = (number: string | null, text: string) =>
  number ? `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text.slice(0, 1500))}` : null

/** Peça sem preço cadastrado (zero): a vitrine mostra "Consulte a loja" e o pedido é combinado pelo WhatsApp. */
export const semPreco = (price: number | null | undefined) => !(Number(price) > 0)

/** Mensagem de quem clicou numa peça "Consulte a loja": diz que veio do site e leva o nome e o código da peça. */
export const mensagemConsulta = (storeName: string, p: { title: string; sku: string | null }) =>
  `Olá! Vim pelo site da ${storeName} e quero saber o preço e a disponibilidade desta peça:\n\n${p.title}${p.sku ? ` (cód. ${p.sku})` : ''}`

export const years = (p: { year_start: number | null; year_end: number | null }) =>
  p.year_start ? (p.year_end && p.year_end !== p.year_start ? `${p.year_start}-${p.year_end}` : String(p.year_start)) : ''

/** Nome de categoria para exibir: tudo minúsculo e só a primeira letra maiúscula ("MOTOR DE ARRANQUE" -> "Motor de arranque"). */
export const capitalize = (text: string | null | undefined) => {
  const t = (text ?? '').trim().toLocaleLowerCase('pt-BR')
  return t ? t.charAt(0).toLocaleUpperCase('pt-BR') + t.slice(1) : ''
}

/** Mensagem de quem, logado no portal, clicou em uma peça "Consulte a loja": diz que veio do portal e leva o nome e o código. */
export const mensagemConsultaPortal = (storeName: string, p: { title: string; sku: string | null }) =>
  `Olá! Vim pelo portal do cliente da ${storeName} e quero saber o preço e a disponibilidade desta peça:\n\n${p.title}${p.sku ? ` (cód. ${p.sku})` : ''}`
