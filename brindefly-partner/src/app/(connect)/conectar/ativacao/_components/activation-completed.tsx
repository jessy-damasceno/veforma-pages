import { ArrowRight } from 'lucide-react'

import { PartnershipBadge } from '@/components/brand/partnership-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { env } from '@/config/env'

// Pedido já COMPLETED ao abrir a página: o código de troca foi emitido numa
// aba anterior. Sem reemitir (pendência P4), só orienta a voltar ao painel.
export function ActivationCompleted() {
  return (
    <Card className="w-full max-w-lg">
      <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
        <PartnershipBadge />
        <div>
          <h1 className="font-bold text-xl tracking-tight">
            Sua loja já está conectada à Veforma
          </h1>
          <p className="mt-1.5 text-muted-foreground text-sm">
            Volte ao painel da Brindefly para continuar. Se o aplicativo Veforma
            ainda aparecer como pendente por lá, fale com o suporte da Veforma.
          </p>
        </div>
        <Button asChild size="lg" className="w-full">
          <a href={env.NEXT_PUBLIC_BRINDEFLY_PANEL_URL}>
            Ir para o painel Brindefly <ArrowRight aria-hidden />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
