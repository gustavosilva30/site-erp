const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
export const money = (v: number) => brl.format(v)

/** Link do WhatsApp da loja. O numero vem do ERP (so digitos); o texto e codificado e limitado. */
export const whatsappLink = (number: string | null, text: string) =>
  number ? `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text.slice(0, 1500))}` : null

export const years = (p: { year_start: number | null; year_end: number | null }) =>
  p.year_start ? (p.year_end && p.year_end !== p.year_start ? `${p.year_start}-${p.year_end}` : String(p.year_start)) : ''

/** Nome de categoria para exibir: tudo minúsculo e só a primeira letra maiúscula ("MOTOR DE ARRANQUE" -> "Motor de arranque"). */
export const capitalize = (text: string | null | undefined) => {
  const t = (text ?? '').trim().toLocaleLowerCase('pt-BR')
  return t ? t.charAt(0).toLocaleUpperCase('pt-BR') + t.slice(1) : ''
}
