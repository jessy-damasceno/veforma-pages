import { PartnershipBadge } from '@/components/brand/partnership-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { env } from '@/config/env'

export function InvalidLink() {
  return (
    <div className="grid flex-1 place-items-center px-6 py-12">
      <Card className="w-full max-w-lg">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          <PartnershipBadge />
          <div>
            <h1 className="font-bold text-xl tracking-tight">
              Este link não é válido
            </h1>
            <p className="mt-1.5 text-muted-foreground text-sm">
              Volte ao painel da Brindefly e clique em Conectar na página do
              aplicativo Veforma.
            </p>
          </div>
          <Button asChild size="lg" className="w-full">
            <a href={env.NEXT_PUBLIC_BRINDEFLY_PANEL_URL}>
              Ir para o painel Brindefly
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
