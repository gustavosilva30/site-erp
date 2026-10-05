import { jsonLd } from '@/lib/seo'

/** Dados estruturados para o Google (produto, loja, migalhas de pão). O texto é escapado para nunca fechar a tag <script>. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />
}
