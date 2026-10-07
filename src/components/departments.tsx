import Link from 'next/link'
import { DEPARTMENTS, getCategoriesForDepartment } from '@/lib/departments'

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
            <h2 className="h2" style={{ marginBottom: 4 }}>Navegue por Departamento</h2>
            <p className="muted small" style={{ margin: 0 }}>Encontre rapidamente a peça certa para o seu veículo</p>
          </div>
          <Link href="/produtos" className="btn ghost sm">Ver catálogo completo →</Link>
        </div>

        <div className="dept-grid">
          {deptData.map((d) => {
            const params = new URLSearchParams()
            for (const cat of d.deptCats) {
              params.append('categories', cat)
            }
            const href = `/produtos?${params.toString()}`

            return (
              <Link key={d.id} href={href} className="dept-card">
                <div className="dept-icon">{d.icon}</div>
                <div className="dept-info">
                  <strong>{d.name}</strong>
                  <span className="dept-count">{d.totalParts} {d.totalParts === 1 ? 'peça' : 'peças'}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
