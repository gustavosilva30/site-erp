import type { ReactNode } from 'react'

/**
 * Mostra o texto que a empresa escreveu. Formato simples: "# título", "## subtítulo", "- item" e parágrafos separados por linha em
 * branco. Tudo vira elemento React (nunca HTML solto), então nada que a empresa digite é executado.
 */
export function PolicyText({ text }: { text: string }) {
  const blocos: ReactNode[] = []
  let lista: string[] = []
  let paragrafo: string[] = []
  let n = 0

  const fecharLista = () => {
    if (lista.length) blocos.push(<ul key={n++}>{lista.map((i, k) => <li key={k}>{i}</li>)}</ul>)
    lista = []
  }
  const fecharParagrafo = () => {
    if (paragrafo.length) blocos.push(<p key={n++}>{paragrafo.join('\n')}</p>)
    paragrafo = []
  }

  for (const bruta of text.split('\n')) {
    const linha = bruta.trimEnd()
    if (!linha.trim()) { fecharLista(); fecharParagrafo(); continue }
    if (linha.startsWith('## ')) { fecharLista(); fecharParagrafo(); blocos.push(<h2 key={n++}>{linha.slice(3)}</h2>); continue }
    if (linha.startsWith('# ')) { fecharLista(); fecharParagrafo(); blocos.push(<h1 key={n++}>{linha.slice(2)}</h1>); continue }
    if (/^[-*] /.test(linha)) { fecharParagrafo(); lista.push(linha.slice(2)); continue }
    fecharLista()
    paragrafo.push(linha)
  }
  fecharLista()
  fecharParagrafo()

  return <article className="policy">{blocos}</article>
}
