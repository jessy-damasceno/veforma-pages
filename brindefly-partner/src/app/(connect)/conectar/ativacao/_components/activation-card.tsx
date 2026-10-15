'use client'

import { CircleCheck } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'

import { PartnershipBadge } from '@/components/brand/partnership-badge'
import { Card } from '@/components/ui/card'
import {
  ACTIVATION_STEP_MIN_VISIBLE_MS,
  ACTIVATION_STEPS,
} from '@/constants/connection'

import { getActivationSteps } from '../_lib/activation-steps'
import { ActivationDone } from './activation-done'
import { ActivationStepList } from './activation-step-list'

interface ActivationCardProps {
  /** Etapas que o backend já concluiu (função pura em _lib). */
  doneCount: number
  /** Quando preenchido, a tela termina a animação e oferece a volta ao painel. */
  callbackUrl: string | null
  isReconnecting: boolean
  /** Checkout feito, mas a Veforma ainda não recebeu a confirmação da Stripe. */
  isAwaitingCheckout?: boolean
  footer?: ReactNode
}

export function ActivationCard({
  doneCount,
  callbackUrl,
  isReconnecting,
  isAwaitingCheckout = false,
  footer,
}: ActivationCardProps) {
  // "O que já mostrei" avança uma etapa por vez até alcançar "o que o backend concluiu".
  const [revealedCount, setRevealedCount] = useState(0)

  useEffect(() => {
    if (revealedCount >= doneCount) return

    const timer = setTimeout(
      () => setRevealedCount((count) => count + 1),
      ACTIVATION_STEP_MIN_VISIBLE_MS,
    )

    return () => clearTimeout(timer)
  }, [revealedCount, doneCount])

  const total = ACTIVATION_STEPS.length
  const isFinished = callbackUrl !== null && revealedCount >= total

  const steps = getActivationSteps(revealedCount)
  const progress = (revealedCount / total) * 100

  const subtitle = isFinished
    ? 'O 3D já pode ser usado nas páginas dos seus produtos.'
    : isAwaitingCheckout
      ? 'Confirmando seu cartão com a Stripe. Não feche esta página.'
      : 'Não feche esta página. Isso leva só alguns instantes.'

  return (
    <Card className="w-full max-w-lg overflow-hidden">
      <div className="h-1.5 bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-8">
        <PartnershipBadge />

        <div aria-live="polite" className="mt-6 text-center">
          {isFinished && (
            <CircleCheck
              className="mx-auto mb-3 size-10 text-primary"
              aria-hidden
            />
          )}
          <h1 className="font-bold text-xl tracking-tight">
            {isFinished
              ? 'Tudo pronto! A Veforma já está ativa'
              : 'Preparando a Veforma na sua loja'}
          </h1>
          <p className="mt-1.5 text-muted-foreground text-sm">{subtitle}</p>
        </div>

        <div className="mt-8">
          <ActivationStepList steps={steps} />
        </div>

        {isFinished && callbackUrl && (
          <ActivationDone callbackUrl={callbackUrl} />
        )}

        {isReconnecting && (
          <p
            role="status"
            className="mt-4 text-center text-muted-foreground text-xs"
          >
            Tentando reconectar com a Veforma…
          </p>
        )}

        {footer}
      </div>
    </Card>
  )
}
