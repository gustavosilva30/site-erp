export interface Department {
  id: string
  name: string
  icon: string
  keywords: string[]
  description: string
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'iluminacao',
    name: 'Faróis & Iluminação',
    icon: '💡',
    keywords: ['farol', 'lanterna', 'milha', 'seta', 'circuito', 'refletor', 'optico'],
    description: 'Faróis principais, lanternas traseiras, milhas e iluminação',
  },
  {
    id: 'lataria',
    name: 'Carroceria & Lataria',
    icon: '🚗',
    keywords: ['porta', 'capo', 'paralama', 'parachoque', 'tampa', 'painel frontal', 'retrovisor', 'vidro', 'grade', 'bocal'],
    description: 'Portas, paralamas, retrovisores, vidros e estrutura',
  },
  {
    id: 'motor',
    name: 'Motor & Câmbio',
    icon: '⚙️',
    keywords: ['motor', 'cambio', 'pistão', 'biela', 'cabeçote', 'bloco', 'carter', 'alternador', 'compressor', 'tbi', 'coletor', 'flauta', 'bomba', 'canister'],
    description: 'Componentes de motor, câmbio, injeção e periféricos',
  },
  {
    id: 'suspensao',
    name: 'Freios & Suspensão',
    icon: '🛑',
    keywords: ['freio', 'pinça', 'mola', 'agregado', 'caixa direção', 'coluna', 'reservatorio oleo', 'cilindro mestre', 'flexível', 'disco', 'pastilha', 'amortecedor'],
    description: 'Sistemas de freio, direção, molas e suspensão',
  },
  {
    id: 'eletrica',
    name: 'Elétrica & Eletrônica',
    icon: '⚡',
    keywords: ['chave', 'modulo', 'painel', 'sensor', 'chicote', 'rele', 'motor partida', 'bobina', 'bateria'],
    description: 'Módulos eletrônicos, chaves de seta e componentes elétricos',
  },
  {
    id: 'interior',
    name: 'Acabamento & Interior',
    icon: '💺',
    keywords: ['console', 'porta luvas', 'maçaneta', 'banco', 'volante', 'forro', 'difusor', 'cinto', 'tapete'],
    description: 'Console, porta-luvas, maçanetas e acabamento interno',
  },
]

export function getCategoriesForDepartment(deptId: string, allCategories: { name: string; total: number }[]): string[] {
  const dept = DEPARTMENTS.find((d) => d.id === deptId)
  if (!dept) return []
  return allCategories
    .filter((c) => {
      const name = c.name.toLowerCase()
      return dept.keywords.some((k) => name.includes(k))
    })
    .map((c) => c.name)
}
