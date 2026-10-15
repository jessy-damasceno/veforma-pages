import { Catalog } from './catalog'
import { Faq } from './faq'
import { FinalCta } from './final-cta'
import { Header } from './header'
import { Hero } from './hero'
import { HowItWorks } from './how-it-works'
import { MadeForBrindefly } from './made-for-brindefly'
import { Plans } from './plans'
import { Problem } from './problem'
import { ScrollScrub } from './scroll-scrub'

// Página de vendas, mostrada com o pedido PENDING (o gate decide). O menu
// flutuante fica aqui porque os links dele só existem nesta tela.
export function Landing() {
  return (
    // clip: os efeitos de entrada deslocam itens na horizontal (até 120px)
    <div className="flex flex-1 flex-col overflow-x-clip bg-background">
      <Header />

      <Hero />
      <Problem />
      <HowItWorks />
      <MadeForBrindefly />
      <Catalog />
      <Plans />
      <Faq />
      <FinalCta />

      <ScrollScrub />
    </div>
  )
}
