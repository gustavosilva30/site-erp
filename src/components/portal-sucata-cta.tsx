import Link from 'next/link'

/** Botão de destaque para a área de sucatas (veículos em desmontagem). `compacto` é a versão fina, usada acima do catálogo. */
export function PortalSucataCta({ compacto = false }: { compacto?: boolean }) {
  return (
    <Link href="/conta/sucatas" className={`psucata-cta${compacto ? ' compacto' : ''}`}>
      <span className="ico" aria-hidden>🚗</span>
      <span className="txt">
        <strong>Veículos em desmontagem</strong>
        {!compacto && <span>Veja os carros que estamos desmontando e todas as peças disponíveis de cada um.</span>}
      </span>
      <span className="seta" aria-hidden>Ver sucatas →</span>
    </Link>
  )
}
