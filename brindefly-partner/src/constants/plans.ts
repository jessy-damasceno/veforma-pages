import type { PlansSlugEnumKey } from '@/http/veforma-client-api'

type PlanLimitKey = 'monthlyViews' | 'modelRequests' | 'qrCodeLinks'

export type PlanFeature =
  | {
      kind: 'flag'
      label: string
      note?: string
      /** `true` inclui, `false` risca, texto vira o selo à direita. */
      availability: Record<PlansSlugEnumKey, boolean | string>
    }
  | {
      kind: 'limit'
      label: string
      note?: string
      limit: PlanLimitKey
    }

const ALL_PLANS: Record<PlansSlugEnumKey, boolean | string> = {
  essencial: true,
  basico: true,
  profissional: true,
}

// Ordem e textos do protótipo (pages/02-fluxo-aquisicao/1-pagina-de-vendas.html).
// Valores numéricos vêm de GET /plans (limits): 0 = não incluso, null = ilimitado.
export const PLAN_FEATURES: readonly PlanFeature[] = [
  { kind: 'flag', label: '3D integrado à Brindefly', availability: ALL_PLANS },
  {
    kind: 'flag',
    label: 'Modelos disponíveis',
    availability: {
      essencial: 'Ilimitado',
      basico: 'Ilimitado',
      profissional: 'Ilimitado',
    },
  },
  {
    kind: 'limit',
    label: 'Views por mês',
    limit: 'monthlyViews',
    note: 'R$ 0,02 por view extra',
  },
  { kind: 'flag', label: 'Métricas de engajamento', availability: ALL_PLANS },
  { kind: 'flag', label: 'Realidade aumentada', availability: ALL_PLANS },
  {
    kind: 'limit',
    label: 'Links e QR Codes para campanhas',
    limit: 'qrCodeLinks',
  },
  {
    kind: 'flag',
    label: 'Visualização por tipo de impressão',
    availability: { essencial: false, basico: false, profissional: true },
  },
  {
    kind: 'limit',
    label: 'Lista de prioridade para novos modelos',
    note: 'pedidos de modelos incluídos',
    limit: 'modelRequests',
  },
]

export const FEATURED_PLAN_SLUG: PlansSlugEnumKey = 'profissional'
