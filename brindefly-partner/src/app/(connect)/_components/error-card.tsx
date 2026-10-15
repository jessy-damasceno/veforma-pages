import { LoaderCircle, TriangleAlert } from 'lucide-react'

import { PartnershipBadge } from '@/components/brand/partnership-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorCardProps {
  title: string
  description: string
  onRetry: () => void
  isRetrying?: boolean
}

export function ErrorCard({
  title,
  description,
  onRetry,
  isRetrying = false,
}: ErrorCardProps) {
  return (
    <div className="grid flex-1 place-items-center px-6 py-12">
      <Card role="alert" className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          <PartnershipBadge />
          <div className="flex flex-col items-center gap-2">
            <TriangleAlert className="size-6 text-destructive" aria-hidden />
            <h1 className="font-bold text-xl tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          <Button
            size="lg"
            className="w-full"
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying && (
              <LoaderCircle className="animate-spin" aria-hidden />
            )}
            Tentar de novo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
