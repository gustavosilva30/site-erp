/**
 * Endereços amigáveis das páginas. O texto do endereço ajuda a busca e a leitura do link, mas a página é sempre localizada
 * pelo código (id) ou pela comparação do apelido com os nomes que a loja realmente tem; texto digitado na URL nunca vira consulta.
 */

export const slugify = (texto: string | null | undefined): string =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/g, '')

export const pecaPath = (p: { id: string; title: string }) => `/peca/${slugify(p.title) || 'peca'}/${encodeURIComponent(p.id)}`

export const sucataPath = (s: { id: string; title: string }) => `/sucata/${slugify(s.title) || 'sucata'}/${encodeURIComponent(s.id)}`

export const categoriaPath = (nome: string) => `/categoria/${slugify(nome) || 'pecas'}`

export const marcaPath = (montadora: string, modelo?: string) =>
  modelo ? `/marca/${slugify(montadora)}/${slugify(modelo)}` : `/marca/${slugify(montadora)}`
