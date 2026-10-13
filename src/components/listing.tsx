import Link from 'next/link'
import { ChevronDownIcon } from './icons'

/** Paginação por links normais (rastreáveis pelo Google). */
export function Pager({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (p: number) => string }) {
  if (pages <= 1) return null
  return (
    <div className="pager" role="navigation" aria-label="Paginação">
      {page > 1 ? (
        <Link className="btn ghost sm pager-btn" href={hrefFor(page - 1)} rel="prev">
          <span style={{ transform: 'rotate(90deg)', display: 'inline-block' }}>
            <ChevronDownIcon />
          </span>
          <span>Anterior</span>
        </Link>
      ) : (
        <span className="btn ghost sm pager-btn disabled" aria-disabled="true">
          <span style={{ transform: 'rotate(90deg)', display: 'inline-block' }}>
            <ChevronDownIcon />
          </span>
          <span>Anterior</span>
        </span>
      )}

      <span className="pager-badge">
        Página <strong>{page}</strong> de {pages}
      </span>

      {page < pages ? (
        <Link className="btn ghost sm pager-btn" href={hrefFor(page + 1)} rel="next">
          <span>Próxima</span>
          <span style={{ transform: 'rotate(-90deg)', display: 'inline-block' }}>
            <ChevronDownIcon />
          </span>
        </Link>
      ) : (
        <span className="btn ghost sm pager-btn disabled" aria-disabled="true">
          <span>Próxima</span>
          <span style={{ transform: 'rotate(-90deg)', display: 'inline-block' }}>
            <ChevronDownIcon />
          </span>
        </span>
      )}
    </div>
  )
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Você está em">
      <ol className="crumbs-list">
        {items.map((it, i) => (
          <li key={`${it.label}-${i}`} className="crumb-item">
            {it.href ? (
              <Link href={it.href} className="crumb-link">
                {it.label}
              </Link>
            ) : (
              <span className="crumb-current" aria-current="page">
                {it.label}
              </span>
            )}
            {i < items.length - 1 && (
              <span className="crumb-sep" aria-hidden="true">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
