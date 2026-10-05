import { notFound, permanentRedirect } from 'next/navigation'
import { getProduct, getStore } from '@/lib/api'
import { pecaPath } from '@/lib/slug'

type Props = { params: Promise<{ id: string }> }

/** Endereço antigo (/produto/código): leva para o endereço novo e definitivo, com o nome da peça no link. */
export default async function ProdutoAntigo({ params }: Props) {
  const { id } = await params
  const store = await getStore()
  const p = await getProduct(store.slug, id)
  if (!p) notFound()
  permanentRedirect(pecaPath(p))
}
