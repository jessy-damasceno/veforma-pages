import { Check, LoaderCircle } from 'lucide-react'

import { cn } from '@/utils/cn'

import type {
  ActivationStep,
  ActivationStepState,
} from '../_lib/activation-steps'

const STEP_STATE_LABEL: Record<ActivationStepState, string> = {
  pending: 'pendente',
  active: 'em andamento',
  done: 'concluída',
}

interface ActivationStepListProps {
  steps: ActivationStep[]
}

export function ActivationStepList({ steps }: ActivationStepListProps) {
  return (
    <ol className="space-y-1 rounded-xl border p-2">
      {steps.map((step) => (
        <li
          key={step.id}
          aria-current={step.state === 'active' ? 'step' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5',
            step.state === 'active' && 'bg-secondary',
          )}
        >
          <span
            className={cn(
              'grid size-6 shrink-0 place-items-center rounded-full',
              step.state === 'pending' && 'border border-input bg-background',
              step.state === 'done' && 'bg-primary text-primary-foreground',
            )}
          >
            {step.state === 'active' && (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            )}
            {step.state === 'done' && (
              <Check className="size-3.5" aria-hidden />
            )}
          </span>
          <span
            className={cn(
              'text-sm',
              step.state === 'pending' && 'text-muted-foreground',
            )}
          >
            {step.label}
          </span>
          <span className="sr-only">{STEP_STATE_LABEL[step.state]}</span>
        </li>
      ))}
    </ol>
  )
}
