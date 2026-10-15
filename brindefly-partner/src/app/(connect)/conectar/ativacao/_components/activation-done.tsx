'use client'

import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useBoolean } from 'usehooks-ts'

import { Button } from '@/components/ui/button'
import { ACTIVATION_REDIRECT_COUNTDOWN_S } from '@/constants/connection'

interface ActivationDoneProps {
  callbackUrl: string
}

// Conclusão: contagem regressiva para voltar ao painel Brindefly, com saída
// imediata pelo botão e pausa pelo link. Única origem da navegação final.
export function ActivationDone({ callbackUrl }: ActivationDoneProps) {
  const [secondsLeft, setSecondsLeft] = useState(
    ACTIVATION_REDIRECT_COUNTDOWN_S,
  )
  const { value: isPaused, setTrue: pause } = useBoolean(false)

  useEffect(() => {
    if (isPaused) return

    if (secondsLeft <= 0) {
      // Navegação de aba inteira: o callback da api-rest precisa do cookie
      // de sessão do painel Brindefly, que só vai em navegação, não em fetch.
      window.location.assign(callbackUrl)
      return
    }

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)

    return () => clearTimeout(timer)
  }, [secondsLeft, isPaused, callbackUrl])

  function goNow() {
    window.location.assign(callbackUrl)
  }

  return (
    <div className="mt-6 space-y-3">
      <Button size="lg" className="w-full" onClick={goNow}>
        Ir para o painel da Brindefly <ArrowRight aria-hidden />
      </Button>
      <p role="status" className="text-center text-muted-foreground text-xs">
        {isPaused ? (
          'Quando quiser, é só clicar no botão acima.'
        ) : (
          <>
            Levando você de volta ao painel da Brindefly em {secondsLeft} s.{' '}
            <button
              type="button"
              onClick={pause}
              className="underline underline-offset-4 hover:text-foreground"
            >
              Esperar
            </button>
          </>
        )}
      </p>
    </div>
  )
}
