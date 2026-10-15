import type { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { SITE } from '@/constants/site'

export const metadata: Metadata = {
  title: 'Planos',
}

// Placeholder da landing page. Conteúdo real (hero, planos, CTA) entra aqui;
// seções locais ficam em ./_components.
export default function LandingPage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="font-semibold text-4xl tracking-tight">{SITE.name}</h1>
      <p className="max-w-md text-muted-foreground">{SITE.description}</p>
      <Button>Ver planos</Button>
    </section>
  )
}
