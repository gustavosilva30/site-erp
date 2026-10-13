'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SearchIcon, ArrowRightIcon } from './icons'
import { money } from '@/lib/format'
import { pecaPath } from '@/lib/slug'
import type { ProductCard } from '@/lib/api'

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductCard[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.products || [])
          setOpen(true)
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    router.push(`/produtos?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div ref={containerRef} className="search-autocomplete-wrapper">
      <form onSubmit={handleSubmit} className="search" role="search">
        <span className="search-icon" aria-hidden>
          <SearchIcon />
        </span>
        <input
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setOpen(true)
          }}
          placeholder="Buscar peça, código de fábrica ou modelo (ex.: farol sentra)"
          aria-label="Buscar peça"
          maxLength={80}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => {
              setQuery('')
              setResults([])
              setOpen(false)
            }}
            aria-label="Limpar pesquisa"
          >
            ✕
          </button>
        )}
        <button className="btn sm search-btn" type="submit">
          Buscar
        </button>
      </form>

      {open && (
        <div className="search-dropdown-menu">
          {loading && (
            <div className="search-loading-row">
              <span className="search-spinner" />
              <span>Buscando no estoque...</span>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="search-empty-row">
              <span>Nenhuma peça encontrada para &quot;{query}&quot;</span>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="search-dropdown-header">
                <span>Peças sugeridas</span>
                <span className="search-count-badge">{results.length} resultados</span>
              </div>
              <div className="search-results-list">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={pecaPath(p)}
                    className="search-result-item"
                    onClick={() => setOpen(false)}
                  >
                    <div className="search-item-photo">
                      {p.photo ? (
                        <img src={p.photo} alt={p.title} />
                      ) : (
                        <span className="nophoto-micro">Foto</span>
                      )}
                    </div>
                    <div className="search-item-info">
                      <strong className="search-item-title">{p.title}</strong>
                      <span className="search-item-meta">
                        {[p.montadora, p.model, p.sku ? `Cód: ${p.sku}` : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </div>
                    <div className="search-item-price">
                      {p.price > 0 ? (
                        <span className="search-price-val">{money(p.price)}</span>
                      ) : (
                        <span className="search-consult-val">Sob consulta</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={`/produtos?q=${encodeURIComponent(query.trim())}`}
                className="search-dropdown-footer"
                onClick={() => setOpen(false)}
              >
                <span>Ver todas as peças encontradas para &quot;{query}&quot;</span>
                <ArrowRightIcon className="inline-icon" />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
