'use client'

import { type CSSProperties, useEffect, useState } from 'react'

import { ACTIVATION_REDIRECT_COUNTDOWN_S } from '@/constants/connection'

interface ActivationDoneProps {
  callbackUrl: string
}

const RING_SIZE = 56
const RING_STROKE = 4
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

// Conclusão: anel que esvazia em ACTIVATION_REDIRECT_COUNTDOWN_S segundos e
// volta ao painel Brindefly. Única origem da navegação final.
export function ActivationDone({ callbackUrl }: ActivationDoneProps) {
  const [secondsLeft, setSecondsLeft] = useState(
    ACTIVATION_REDIRECT_COUNTDOWN_S,
  )

  useEffect(() => {
    if (secondsLeft <= 0) {
      // Navegação de aba inteira: o callback da api-rest precisa do cookie
      // de sessão do painel Brindefly, que só vai em navegação, não em fetch.
      window.location.assign(callbackUrl)
      return
    }

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)

    return () => clearTimeout(timer)
  }, [secondsLeft, callbackUrl])

  return (
    <div
      role="status"
      className="mt-6 flex flex-col items-center gap-3 text-center"
    >
      <div className="relative grid place-items-center">
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={RING_STROKE}
            className="text-secondary"
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            className="animate-countdown-ring text-primary"
            style={
              {
                '--ring-length': RING_LENGTH,
                animationDuration: `${ACTIVATION_REDIRECT_COUNTDOWN_S}s`,
              } as CSSProperties
            }
          />
        </svg>
        <span className="absolute font-semibold text-sm tabular-nums">
          {secondsLeft}
        </span>
      </div>
      <p className="text-muted-foreground text-sm">
        Voltando para o painel da Brindefly…
      </p>
    </div>
  )
}
