import Link from 'next/link'

/** Paginação por links normais (rastreáveis pelo Google). */
export function Pager({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (p: number) => string }) {
  if (pages <= 1) return null
  return (
    <div className="pager">
      {page > 1 && <Link className="btn ghost sm" href={hrefFor(page - 1)} rel="prev">Anterior</Link>}
      <span className="muted small" style={{ alignSelf: 'center' }}>Página {page} de {pages}</span>
      {page < pages && <Link className="btn ghost sm" href={hrefFor(page + 1)} rel="next">Próxima</Link>}
    </div>
  )
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Você está em">
      {items.map((it, i) => (
        <span key={`${it.label}-${i}`}>
          {it.href ? <Link href={it.href}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
          {i < items.length - 1 && <span aria-hidden="true"> › </span>}
        </span>
      ))}
    </nav>
  )
}
