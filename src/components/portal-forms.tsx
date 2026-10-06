'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/** Chama as rotas do site (que falam com o ERP no servidor). Devolve a mensagem de erro, ou null se deu certo. */
async function enviar(url: string, body?: unknown): Promise<string | null> {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })
    if (res.ok) return null
    const j = await res.json().catch(() => null)
    return j?.error ?? 'Não foi possível concluir. Tente novamente.'
  } catch {
    return 'Sem conexão. Tente novamente.'
  }
}

export function LoginForm() {
  const router = useRouter()
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErro(null); setEnviando(true)
    const r = await enviar('/api/portal/login', { login, password: senha })
    setEnviando(false)
    if (r) { setErro(r); return }
    router.replace('/conta')
    router.refresh()
  }

  return (
    <form className="pform" onSubmit={submit}>
      <label className="field">
        <span>Login</span>
        <input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" placeholder="E-mail, CPF/CNPJ ou telefone" required maxLength={120} />
      </label>
      <label className="field">
        <span>Senha</span>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required maxLength={200} />
      </label>
      {erro && <p className="alert" role="alert">{erro}</p>}
      <button className="btn" type="submit" disabled={enviando || !login.trim() || !senha}>{enviando ? 'Entrando...' : 'Entrar'}</button>
      <p className="muted small"><Link href="/entrar/esqueci">Esqueci a senha</Link> · Ainda não tem acesso? Peça à loja.</p>
    </form>
  )
}

export function SetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (senha !== confirma) { setErro('As senhas não conferem.'); return }
    setErro(null); setEnviando(true)
    const r = await enviar('/api/portal/senha', { token, password: senha })
    setEnviando(false)
    if (r) { setErro(r); return }
    router.replace('/conta')
    router.refresh()
  }

  return (
    <form className="pform" onSubmit={submit}>
      <label className="field">
        <span>Nova senha</span>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" required minLength={8} maxLength={72} />
        <small className="muted">Pelo menos 8 caracteres, com letras e números.</small>
      </label>
      <label className="field">
        <span>Repita a senha</span>
        <input type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} autoComplete="new-password" required maxLength={72} />
      </label>
      {erro && <p className="alert" role="alert">{erro}</p>}
      <button className="btn" type="submit" disabled={enviando || senha.length < 8}>{enviando ? 'Salvando...' : 'Criar senha e entrar'}</button>
    </form>
  )
}

export function LogoutButton() {
  const router = useRouter()
  const [saindo, setSaindo] = useState(false)
  return (
    <button
      type="button"
      className="linkbtn"
      disabled={saindo}
      onClick={async () => {
        setSaindo(true)
        await enviar('/api/portal/sair')
        router.replace('/entrar')
        router.refresh()
      }}
    >
      Sair
    </button>
  )
}

export function CancelOrderButton({ id }: { id: string }) {
  const router = useRouter()
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  return (
    <div>
      <button
        type="button"
        className="btn ghost sm"
        disabled={enviando}
        onClick={async () => {
          if (!window.confirm('Cancelar este pedido? Os produtos voltam para o estoque.')) return
          setEnviando(true); setErro(null)
          const r = await enviar(`/api/portal/pedidos/${encodeURIComponent(id)}/cancelar`)
          setEnviando(false)
          if (r) { setErro(r); return }
          router.refresh()
        }}
      >
        {enviando ? 'Cancelando...' : 'Cancelar pedido'}
      </button>
      {erro && <p className="alert" role="alert">{erro}</p>}
    </div>
  )
}

/** "Esqueci a senha": o link de nova senha chega pelo WhatsApp cadastrado. A mensagem de resposta é a mesma para qualquer login. */
export function ForgotForm() {
  const [login, setLogin] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErro(null); setEnviando(true)
    const r = await enviar('/api/portal/esqueci', { login })
    setEnviando(false)
    if (r) { setErro(r); return }
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="pform">
        <p className="okbox" role="status">Se o login estiver cadastrado e tiver WhatsApp, você vai receber o link para criar uma nova senha em instantes.</p>
        <Link href="/entrar" className="btn ghost">Voltar ao login</Link>
      </div>
    )
  }
  return (
    <form className="pform" onSubmit={submit}>
      <label className="field">
        <span>Login</span>
        <input value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" placeholder="E-mail, CPF/CNPJ ou telefone" required maxLength={120} />
      </label>
      {erro && <p className="alert" role="alert">{erro}</p>}
      <button className="btn" type="submit" disabled={enviando || !login.trim()}>{enviando ? 'Enviando...' : 'Enviar link por WhatsApp'}</button>
      <p className="muted small">O link vai para o WhatsApp que a loja tem no seu cadastro. Não chegou? Peça à loja.</p>
    </form>
  )
}
