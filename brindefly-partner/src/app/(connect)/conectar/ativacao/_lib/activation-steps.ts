import type { ConnectionRequestStatus } from '@/@types/connection'
import { ACTIVATION_STEPS } from '@/constants/connection'

export type ActivationStepState = 'pending' | 'active' | 'done'

export interface ActivationStep {
  id: string
  label: string
  state: ActivationStepState
}

const STATUS_RANK: Record<ConnectionRequestStatus, number> = {
  FAILED: -1,
  PENDING: 0,
  CHECKOUT_COMPLETED: 1,
  STORE_CONNECTED: 2,
  PRODUCTS_SYNCED: 3,
  COMPLETED: 4,
}

/**
 * Quantas etapas o backend já concluiu. A última ("Finalizando") só conta
 * quando o `complete` respondeu, porque COMPLETED sem callbackUrl é reentrada.
 */
export const countStepsDone = (
  status: ConnectionRequestStatus,
  completeDone: boolean,
): number => {
  if (completeDone) return ACTIVATION_STEPS.length

  const rank = STATUS_RANK[status]

  return ACTIVATION_STEPS.filter(
    (step) => step.doneAt !== 'COMPLETED' && STATUS_RANK[step.doneAt] <= rank,
  ).length
}

/** Primeiras `doneCount` etapas concluídas, a seguinte ativa, o resto pendente. */
export const getActivationSteps = (doneCount: number): ActivationStep[] =>
  ACTIVATION_STEPS.map((step, index) => ({
    id: step.id,
    label: step.label,
    state:
      index < doneCount ? 'done' : index === doneCount ? 'active' : 'pending',
  }))
