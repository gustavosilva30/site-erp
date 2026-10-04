import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="wrap sec">
      <h1 className="h2">Página não encontrada</h1>
      <p className="muted">O endereço não existe ou a peça não está mais disponível.</p>
      <Link href="/" className="btn">Voltar ao início</Link>
    </main>
  )
}
