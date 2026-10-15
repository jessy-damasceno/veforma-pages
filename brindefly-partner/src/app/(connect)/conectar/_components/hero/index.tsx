import { Button } from '@/components/ui/button'
import { LANDING_SECTION_IDS } from '@/constants/landing'
import { cn } from '@/utils/cn'

import { SectionBadge } from '../section-badge'
import { BrandLockup } from './brand-lockup'
import { FeatureCards } from './feature-cards'
import { HeroStage } from './hero-stage'

// O hero já nasce na tela, então não há rolagem para revelar nada: a entrada
// dispara uma vez no carregamento, em cascata pelo `delay-*`.
const REVEAL_ON_LOAD_CLASS_NAME =
  'fade-in animate-in fill-mode-both duration-700 motion-reduce:animate-none'

export function Hero() {
  return (
    <section
      id={LANDING_SECTION_IDS.hero}
      className="relative overflow-x-clip bg-[linear-gradient(180deg,#f1f2ff_0%,#f3f3fd_11.9%,#f6f5fb_23.8%,#f8f7f9_35.7%,#faf9f8_44.5%,#fcfaf7_51.6%,#faf9f8_59.6%,#f8f7fa_71.5%,#f7f6fd_83.4%,#f5f4fd_91.3%,#f3f3fe_100%)] pt-9 pb-14.5 text-center lg:pt-13.75"
    >
      <div className="mx-auto w-full max-w-331 px-5 sm:px-8">
        <div className="flex flex-col items-center">
          <SectionBadge
            variant="blue"
            className={cn(REVEAL_ON_LOAD_CLASS_NAME, 'relative -left-1.25')}
          >
            Parceria oficial
          </SectionBadge>

          <BrandLockup className={cn(REVEAL_ON_LOAD_CLASS_NAME, 'delay-100')} />

          <p
            className={cn(
              REVEAL_ON_LOAD_CLASS_NAME,
              'mt-2 text-[11px] text-black uppercase leading-[1.6] tracking-[3px] delay-160 md:mt-px md:whitespace-nowrap md:text-xs md:leading-[54.8px] md:tracking-[4px] lg:text-[13px] lg:tracking-[5.8px]',
            )}
          >
            Brindefly + Veforma 3D
          </p>

          <h1
            className={cn(
              REVEAL_ON_LOAD_CLASS_NAME,
              'mx-auto mt-0.75 max-w-205.75 font-bold text-[32px] text-foreground leading-none tracking-[-0.8px] delay-240 md:px-6 md:text-[40px] md:tracking-[-1px] lg:px-0 lg:text-5xl lg:leading-[47.8px] lg:tracking-[-1.2px]',
            )}
          >
            Já pensou em visualizar seu produto em 3D e personalizar com a logo
            do cliente?
          </h1>

          <p
            className={cn(
              REVEAL_ON_LOAD_CLASS_NAME,
              'mx-auto mt-3.5 max-w-176 text-[#080808] text-sm leading-normal tracking-[-0.15px] delay-380 md:mt-2.5 md:px-6 md:text-[15px] md:leading-5.75 lg:px-0',
            )}
          >
            A Veforma adiciona um visualizador 3D à sua loja Brindefly para o
            cliente escolher cores, tipos de impressão e aplicar a própria logo
            no produto.
          </p>

          <div
            className={cn(
              REVEAL_ON_LOAD_CLASS_NAME,
              'mt-7 flex w-full xs:w-auto flex-wrap justify-center gap-3 delay-520 md:mt-8.5',
            )}
          >
            <Button
              className="h-12.5 w-full xs:w-auto xs:min-w-59 rounded-[27px] px-4.75 font-bold text-[15px] leading-[1.587] tracking-[-0.45px] hover:scale-104"
              asChild
            >
              <a href={`#${LANDING_SECTION_IDS.plans}`}>
                Testar grátis por 14 dias
              </a>
            </Button>

            <Button
              variant="outline"
              className="h-12.5 w-full xs:w-auto xs:min-w-39.25 rounded-[27px] border-2 border-black/20 bg-transparent px-4.75 font-bold text-[15px] text-black leading-[1.587] tracking-[-0.45px] shadow-none hover:scale-104 hover:border-black/45 hover:bg-transparent hover:text-black"
              asChild
            >
              <a href={`#${LANDING_SECTION_IDS.howItWorks}`}>Como funciona</a>
            </Button>
          </div>
        </div>

        <HeroStage>
          <FeatureCards />
        </HeroStage>

        <p
          data-scrub="up"
          className="mt-8 px-6 text-foreground text-xs uppercase leading-normal tracking-[2.2px] md:mt-11.75 md:text-sm md:tracking-[2.6px] lg:px-0 lg:text-[17px] lg:leading-5.5 lg:tracking-[3.4px]"
        >
          O cliente personaliza sem sair da página do produto
        </p>
      </div>
    </section>
  )
}
