'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Facets } from '@/lib/api'
import { DEPARTMENTS, getCategoriesForDepartment } from '@/lib/departments'

interface SidebarProps {
  categories: { name: string; total: number }[]
  facets: Facets
  showDepartments?: boolean
  current: {
    q?: string
    category?: string
    categories?: string[]
    condition?: string
    price_min?: string
    price_max?: string
    montadora?: string
    model?: string
    year?: string
  }
}

export function ProductSidebar({ categories, facets, showDepartments = true, current }: SidebarProps) {
  const router = useRouter()
  const [minPrice, setMinPrice] = useState(current.price_min ?? '')
  const [maxPrice, setMaxPrice] = useState(current.price_max ?? '')

  // Deduplicação case-insensitive no frontend para marcas/montadoras
  const montadorasDeduplicadas = facets.montadoras.reduce((acc, m) => {
    const nameStr = m.name?.trim() ?? ''
    if (!nameStr) return acc
    const key = nameStr.toLowerCase()
    const existing = acc.find((x) => x.name.trim().toLowerCase() === key)
    if (existing) {
      existing.total += m.total
      if (/[a-z]/.test(nameStr) && /[A-Z]/.test(nameStr)) {
        existing.name = nameStr
      }
    } else {
      let cleanName = nameStr
      if (/^[A-Z0-9\s-]+$/.test(nameStr) && nameStr.length > 3) {
        cleanName = nameStr.charAt(0).toUpperCase() + nameStr.slice(1).toLowerCase()
      }
      acc.push({ name: cleanName, total: m.total })
    }
    return acc
  }, [] as { name: string; total: number }[]).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))

  const aplicarPreco = (e: React.FormEvent) => {
    e.preventDefault()
    const sp = new URLSearchParams()
    if (current.q) sp.set('q', current.q)
    if (current.category) sp.set('category', current.category)
    if (current.categories?.length) {
      for (const c of current.categories) sp.append('categories', c)
    }
    if (current.condition) sp.set('condition', current.condition)
    if (current.montadora) sp.set('montadora', current.montadora)
    if (current.model) sp.set('model', current.model)
    if (current.year) sp.set('year', current.year)
    if (minPrice) sp.set('price_min', minPrice)
    if (maxPrice) sp.set('price_max', maxPrice)
    router.push(sp.toString() ? `/produtos?${sp.toString()}` : '/produtos')
  }

  const aplicarLado = (lado: string) => {
    const termoAtual = current.q ?? ''
    const novoTermo = termoAtual ? `${termoAtual} ${lado}` : lado
    const sp = new URLSearchParams()
    sp.set('q', novoTermo)
    if (current.category) sp.set('category', current.category)
    if (current.montadora) sp.set('montadora', current.montadora)
    if (current.model) sp.set('model', current.model)
    if (current.year) sp.set('year', current.year)
    router.push(`/produtos?${sp.toString()}`)
  }

  const buildUrl = (patch: Record<string, string | string[] | undefined>) => {
    const sp = new URLSearchParams()
    const combined = { ...current, ...patch }
    if (combined.q) sp.set('q', String(combined.q))
    if (combined.category) sp.set('category', String(combined.category))
    if (Array.isArray(combined.categories)) {
      for (const c of combined.categories) sp.append('categories', c)
    }
    if (combined.condition) sp.set('condition', String(combined.condition))
    if (combined.price_min) sp.set('price_min', String(combined.price_min))
    if (combined.price_max) sp.set('price_max', String(combined.price_max))
    if (combined.montadora) sp.set('montadora', String(combined.montadora))
    if (combined.model) sp.set('model', String(combined.model))
    if (combined.year) sp.set('year', String(combined.year))
    const s = sp.toString()
    return s ? `/produtos?${s}` : '/produtos'
  }

  const temFiltros = Boolean(
    current.q || current.category || current.categories?.length ||
    current.condition || current.price_min || current.price_max ||
    current.montadora || current.model || current.year
  )

  return (
    <aside className="product-sidebar">
      <div className="sidebar-head">
        <strong>Filtros</strong>
        {temFiltros && (
          <Link href="/produtos" className="sidebar-clear">Limpar todos</Link>
        )}
      </div>

      {/* Departamentos */}
      {showDepartments && (
        <div className="sidebar-group">
          <span className="sidebar-title">Departamentos</span>
          <div className="sidebar-list">
            {DEPARTMENTS.map((dept) => {
              const deptCats = getCategoriesForDepartment(dept.id, categories)
              if (deptCats.length === 0) return null
              const isSelected = current.categories?.some((c) => deptCats.includes(c))
              return (
                <Link
                  key={dept.id}
                  href={buildUrl({ categories: isSelected ? undefined : deptCats, category: undefined })}
                  className={`sidebar-item ${isSelected ? 'on' : ''}`}
                >
                  <span>{dept.icon} {dept.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Condição */}
      <div className="sidebar-group">
        <span className="sidebar-title">Condição da peça</span>
        <div className="sidebar-chips">
          <Link href={buildUrl({ condition: undefined })} className={`chip ${!current.condition ? 'on' : ''}`}>Todas</Link>
          <Link href={buildUrl({ condition: 'usado' })} className={`chip ${current.condition === 'usado' ? 'on' : ''}`}>Usado / Testado</Link>
          <Link href={buildUrl({ condition: 'novo' })} className={`chip ${current.condition === 'novo' ? 'on' : ''}`}>Novo / Genuíno</Link>
        </div>
      </div>

      {/* Posição / Lado da Peça */}
      <div className="sidebar-group">
        <span className="sidebar-title">Lado / Posição</span>
        <div className="sidebar-chips">
          <button type="button" onClick={() => aplicarLado('dianteiro')} className="chip">Dianteiro</button>
          <button type="button" onClick={() => aplicarLado('traseiro')} className="chip">Traseiro</button>
          <button type="button" onClick={() => aplicarLado('direito')} className="chip">Direito (LD)</button>
          <button type="button" onClick={() => aplicarLado('esquerdo')} className="chip">Esquerdo (LE)</button>
        </div>
      </div>

      {/* Faixa de Preço */}
      <div className="sidebar-group">
        <span className="sidebar-title">Faixa de preço (R$)</span>
        <form onSubmit={aplicarPreco} className="price-inputs">
          <input
            type="number"
            placeholder="Mín"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="sidebar-input"
          />
          <span>até</span>
          <input
            type="number"
            placeholder="Máx"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="sidebar-input"
          />
          <button type="submit" className="btn sm">Ok</button>
        </form>
      </div>

      {/* Montadoras */}
      {montadorasDeduplicadas.length > 0 && (
        <div className="sidebar-group">
          <span className="sidebar-title">Marca / Montadora</span>
          <div className="sidebar-list scrollable">
            <Link href={buildUrl({ montadora: undefined, model: undefined })} className={`sidebar-item ${!current.montadora ? 'on' : ''}`}>
              <span>Todas as marcas</span>
            </Link>
            {montadorasDeduplicadas.map((m) => (
              <Link
                key={m.name}
                href={buildUrl({ montadora: current.montadora?.toLowerCase() === m.name.toLowerCase() ? undefined : m.name, model: undefined })}
                className={`sidebar-item ${current.montadora?.toLowerCase() === m.name.toLowerCase() ? 'on' : ''}`}
              >
                <span>{m.name}</span>
                <span className="count">{m.total}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
