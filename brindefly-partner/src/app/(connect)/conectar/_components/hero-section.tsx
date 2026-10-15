import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 pt-16 pb-8 text-center">
      <span className="rounded-full border bg-background px-3 py-1 font-medium text-xs">
        Brindefly + Veforma 3D
      </span>
      <h1 className="font-bold text-4xl tracking-tight">
        Seu cliente visualiza o resultado antes de pedir o orçamento
      </h1>
      <p className="max-w-xl text-muted-foreground">
        A Veforma adiciona um visualizador 3D à sua loja Brindefly para o
        cliente escolher cores, tipos de impressão e aplicar a própria logo no
        produto.
      </p>
      <Button asChild size="lg">
        <a href="#planos">Ver planos</a>
      </Button>
    </section>
  )
}
