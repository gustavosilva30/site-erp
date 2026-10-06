import { redirect } from 'next/navigation'
import { portalCall, portalToken } from '@/lib/portal'

export interface PortalMe { name: string; login: string; discount_percent: number }

export interface PortalProduct {
  id: string
  sku: string | null
  title: string
  price: number
  price_with_discount: number
  condition: string | null
  category: string | null
  brand: string | null
  model: string | null
  montadora: string | null
  year_start: number | null
  year_end: number | null
  photo: string | null
  /** Quantidade que ainda dá para pedir (estoque menos o já reservado). */
  available: number
  /** Sem preço cadastrado: não entra no pedido; o cliente fala com a loja para combinar o valor. */
  consult: boolean
}

/** Produto com as informações completas (página do produto). */
export interface PortalProductDetail extends PortalProduct {
  description: string | null
  part_number: string | null
  engine: string | null
  warranty_days: number | null
  photos: string[]
  compatibility: { brand: string | null; model: string; year_start: number | null; year_end: number | null; engine: string | null }[]
}

/** Veículo em desmontagem (sucata) que a loja colocou no site. */
export interface PortalSucataCard {
  id: string
  title: string
  brand: string | null
  model: string | null
  year: string
  color: string | null
  fuel: string | null
  engine: string | null
  photo: string | null
  /** Peças desta sucata que o cliente pode ver agora. */
  parts_count: number
}

export interface PortalSucataDetail extends PortalSucataCard {
  photos: string[]
  parts: PortalProduct[]
}

export type PortalStage = 'aguardando_aprovacao' | 'aprovado' | 'recusado' | 'pago' | 'retirado' | 'cancelado' | 'expirado'

export interface PortalOrder {
  id: string
  number: string
  stage: PortalStage
  created_at: string
  expires_at: string
  subtotal: number
  discount_total: number
  total: number
  notes: string | null
  approval_note: string | null
  /** Marcos do pedido, em ordem, para a linha do tempo. */
  events: { key: string; label: string; at: string }[]
  items: { product_id: string | null; description: string; quantity: number; unit_price: number; sku: string | null; photo: string | null }[]
}

export const STAGE_LABEL: Record<PortalStage, { text: string; hint: string }> = {
  aguardando_aprovacao: { text: 'Aguardando a loja', hint: 'A loja vai analisar o pedido e combinar pagamento e entrega com você. Os produtos ficam reservados.' },
  aprovado: { text: 'Aprovado', hint: 'A loja aprovou. Combine o pagamento e a entrega/retirada com ela.' },
  recusado: { text: 'Recusado', hint: 'A loja não pôde atender este pedido.' },
  pago: { text: 'Pago', hint: 'Pagamento recebido. Aguarde a separação ou a entrega.' },
  retirado: { text: 'Retirado', hint: 'Pedido concluído.' },
  cancelado: { text: 'Cancelado', hint: 'Este pedido foi cancelado.' },
  expirado: { text: 'Expirado', hint: 'A reserva venceu sem aprovação. Faça um novo pedido ou fale com a loja.' },
}

/** Dados do cliente logado; sem sessão válida, manda para o login. */
export async function requireMe(): Promise<{ token: string; me: PortalMe }> {
  const token = await portalToken()
  if (!token) redirect('/entrar')
  const r = await portalCall<PortalMe>('/me', { token })
  if (!r.data) redirect('/entrar')
  return { token, me: r.data }
}

/** Lê uma rota do portal com a sessão do cliente; sessão vencida volta ao login. */
export async function portalGet<T>(token: string, path: string): Promise<T | null> {
  const r = await portalCall<T>(path, { token })
  if (r.status === 401) redirect('/entrar')
  return r.data
}
