import { NextResponse } from 'next/server'
import { findStore, listProducts } from '@/lib/api'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ products: [] })
  }

  try {
    const store = await findStore()
    if (!store) {
      return NextResponse.json({ products: [] })
    }

    const res = await listProducts(store.slug, { q, limit: 6 })
    const products = res.products.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      photo: p.photo,
      sku: p.sku,
      montadora: p.montadora,
      model: p.model,
      condition: p.condition,
    }))

    return NextResponse.json({ products })
  } catch {
    return NextResponse.json({ products: [] })
  }
}
