import { Button } from '@/components/ui/button'
import { LANDING_SECTION_IDS } from '@/constants/landing'

import { RevealOnView } from './reveal-on-view'
import { SectionBadge } from './section-badge'
import { SectionSubtitle } from './section-subtitle'
import { SectionTitle } from './section-title'

export function FinalCta() {
  return (
    <section
      id={LANDING_SECTION_IDS.finalCta}
      className="bg-white pt-16 pb-18 text-center sm:pt-18 sm:pb-20 lg:pt-20.25 lg:pb-27"
    >
      <div className="mx-auto w-full max-w-331 px-5 sm:px-8">
        <RevealOnView>
          <SectionBadge variant="blue" className="pr-5.5">
            Veforma
          </SectionBadge>

          <SectionTitle className="max-w-182.25">
            Pronto para ativar a Veforma na sua loja Brindefly?
          </SectionTitle>
          {/* quebra depois de "para você", como no Figma */}
          <SectionSubtitle className="mt-[18.4px] max-w-140">
            Escolha o plano ideal e nós cuidamos da configuração para você
            começar sem complicação.
          </SectionSubtitle>

          <Button
            className="mx-auto mt-11 flex h-14.5 w-full max-w-[320px] rounded-[40px] font-bold text-[15px] leading-[1.587] tracking-[-0.45px] hover:scale-104 sm:w-62"
            asChild
          >
            <a href={`#${LANDING_SECTION_IDS.plans}`}>Escolher meu plano</a>
          </Button>
        </RevealOnView>
      </div>
    </section>
  )
}
