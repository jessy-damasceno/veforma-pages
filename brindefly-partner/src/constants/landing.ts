// Âncoras das seções da landing: usadas nos `id` das seções e nos links do menu.
export const LANDING_SECTION_IDS = {
  hero: 'inicio',
  problem: 'problema',
  howItWorks: 'como-funciona',
  madeForBrindefly: 'feito-para-brindefly',
  catalog: 'catalogo',
  plans: 'planos',
  faq: 'duvidas',
  finalCta: 'ativar',
} as const

export const LANDING_NAV_LINKS = [
  { label: 'Como funciona', sectionId: LANDING_SECTION_IDS.howItWorks },
  { label: 'Integração', sectionId: LANDING_SECTION_IDS.madeForBrindefly },
  { label: 'Catálogo', sectionId: LANDING_SECTION_IDS.catalog },
  { label: 'Planos', sectionId: LANDING_SECTION_IDS.plans },
  { label: 'Dúvidas', sectionId: LANDING_SECTION_IDS.faq },
] as const

// Microvídeos dos 3 passos (cor → logo → realidade aumentada), usados em
// "Como funciona" e na galeria do catálogo.
export const STEP_VIDEOS = [
  {
    src: '/static/landing/video/passo-01.mp4',
    poster: '/static/landing/03-como-funciona/passo-01-poster.jpg',
  },
  {
    src: '/static/landing/video/passo-02.mp4',
    poster: '/static/landing/03-como-funciona/passo-02-poster.jpg',
  },
  {
    src: '/static/landing/video/passo-03.mp4',
    poster: '/static/landing/03-como-funciona/passo-03-poster.jpg',
  },
] as const
