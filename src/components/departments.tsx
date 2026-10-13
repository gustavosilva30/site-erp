import Link from 'next/link'
import { DEPARTMENTS, getCategoriesForDepartment } from '@/lib/departments'
import {
  HeadlightsIcon,
  CarBodyIcon,
  EngineIcon,
  BrakesIcon,
  ElectricalIcon,
  InteriorIcon,
  ArrowRightIcon,
} from '@/components/icons'

function getDepartmentSvgIcon(id: string) {
  switch (id) {
    case 'iluminacao':
      return <HeadlightsIcon className="dept-svg-icon text-amber-500" />
    case 'lataria':
      return <CarBodyIcon className="dept-svg-icon text-blue-500" />
    case 'motor':
      return <EngineIcon className="dept-svg-icon text-orange-500" />
    case 'suspensao':
      return <BrakesIcon className="dept-svg-icon text-red-500" />
    case 'eletrica':
      return <ElectricalIcon className="dept-svg-icon text-yellow-500" />
    case 'interior':
      return <InteriorIcon className="dept-svg-icon text-emerald-500" />
    default:
      return <CarBodyIcon className="dept-svg-icon" />
  }
}

export function DepartmentsGrid({ categories }: { categories: { name: string; total: number }[] }) {
  if (categories.length === 0) return null

  // Calcula total de peças de cada departamento
  const deptData = DEPARTMENTS.map((dept) => {
    const deptCats = getCategoriesForDepartment(dept.id, categories)
    const totalParts = categories
      .filter((c) => deptCats.includes(c.name))
      .reduce((sum, c) => sum + c.total, 0)
    return { ...dept, totalParts, deptCats }
  }).filter((d) => d.totalParts > 0)

  if (deptData.length === 0) return null

  return (
    <section className="sec dept-section">
      <div className="wrap">
        <div className="dept-head">
          <div>
            <div className="dept-badge">Catálogo Especializado</div>
            <h2 className="h2" style={{ marginBottom: 4 }}>Navegue por Departamento</h2>
            <p className="muted small" style={{ margin: 0 }}>Encontre rapidamente peças testadas para o seu veículo</p>
          </div>
          <Link href="/produtos" className="btn ghost sm view-all-link">
            <span>Ver catálogo completo</span>
            <ArrowRightIcon className="inline-icon" />
          </Link>
        </div>

        <div className="dept-grid">
          {deptData.map((d) => {
            const params = new URLSearchParams()
            for (const cat of d.deptCats) {
              params.append('categories', cat)
            }
            const href = `/produtos?${params.toString()}`

            return (
              <Link key={d.id} href={href} className="dept-card group">
                <div className="dept-icon-wrapper">
                  {getDepartmentSvgIcon(d.id)}
                </div>
                <div className="dept-info">
                  <strong className="dept-title">{d.name}</strong>
                  <span className="dept-count">
                    {d.totalParts} {d.totalParts === 1 ? 'peça' : 'peças'}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
