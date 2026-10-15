import type { ConnectionRequestStatus } from '@/@types/connection'

/** A Veforma ainda está trabalhando: a tela de ativação continua consultando. */
export const IN_PROGRESS_STATUSES: readonly ConnectionRequestStatus[] = [
  'CHECKOUT_COMPLETED',
  'STORE_CONNECTED',
  'PRODUCTS_SYNCED',
]

/** Na ativação, PENDING também é consultado: o webhook da Stripe é assíncrono. */
export const POLLED_STATUSES: readonly ConnectionRequestStatus[] = [
  'PENDING',
  ...IN_PROGRESS_STATUSES,
]

export const CONNECTION_POLLING_INTERVAL_MS = 2000
/** Depois disso, PENDING na ativação mostra a dica de voltar para os planos. */
export const CHECKOUT_CONFIRMATION_GRACE_MS = 60_000
export const CONNECTION_POLLING_FAILURES_BEFORE_WARNING = 3
export const ACTIVATION_STEP_MIN_VISIBLE_MS = 1200
/** Contagem regressiva antes de voltar ao painel Brindefly (o código de troca vale 10 min). */
export const ACTIVATION_REDIRECT_COUNTDOWN_S = 5

export const LINK_TOKEN_PARAM = 'linkToken'

export interface ActivationStepDefinition {
  id: string
  label: string
  /** Status da API a partir do qual a etapa conta como concluída. */
  doneAt: ConnectionRequestStatus
}

// Etapas do protótipo do Bruno. As cosméticas (3 e 5) acompanham a real anterior.
// Copy conforme D11: "Cartão confirmado", nunca "pagamento confirmado".
export const ACTIVATION_STEPS: readonly ActivationStepDefinition[] = [
  { id: 'card', label: 'Cartão confirmado', doneAt: 'CHECKOUT_COMPLETED' },
  {
    id: 'store',
    label: 'Conectando à sua loja Brindefly',
    doneAt: 'STORE_CONNECTED',
  },
  {
    id: 'viewer',
    label: 'Adicionando o 3D às páginas de produto',
    doneAt: 'STORE_CONNECTED',
  },
  {
    id: 'products',
    label: 'Sincronizando produtos e variações',
    doneAt: 'PRODUCTS_SYNCED',
  },
  {
    id: 'ar',
    label: 'Ativando a realidade aumentada',
    doneAt: 'PRODUCTS_SYNCED',
  },
  { id: 'finish', label: 'Finalizando a configuração', doneAt: 'COMPLETED' },
]
