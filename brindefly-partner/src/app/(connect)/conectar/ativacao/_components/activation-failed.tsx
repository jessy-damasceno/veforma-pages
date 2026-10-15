import { LoaderCircle, TriangleAlert } from 'lucide-react'

import { PartnershipBadge } from '@/components/brand/partnership-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ActivationFailedProps {
  reason: string | null
  onRetry: () => void
  isRetrying: boolean
}

export function ActivationFailed({
  reason,
  onRetry,
  isRetrying,
}: ActivationFailedProps) {
  const description = reason
    ? `${reason.trim().replace(/\.?$/, '.')} Seu cartão já está salvo e nada foi cobrado.`
    : 'Algo deu errado do lado da Veforma. Seu cartão já está salvo e nada foi cobrado.'

  return (
    <Card className="w-full max-w-lg">
      <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
        <PartnershipBadge />
        <div className="flex flex-col items-center gap-2">
          <TriangleAlert className="size-6 text-destructive" aria-hidden />
          <h1 className="font-bold text-xl tracking-tight">
            Não conseguimos concluir a configuração
          </h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <Button
          size="lg"
          className="w-full"
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying && <LoaderCircle className="animate-spin" aria-hidden />}
          Tentar de novo
        </Button>
      </CardContent>
    </Card>
  )
}
