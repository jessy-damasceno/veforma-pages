import { LANDING_SECTION_IDS } from '@/constants/landing'

import { SectionBadge } from '../section-badge'
import { SectionSubtitle } from '../section-subtitle'
import { SectionTitle } from '../section-title'
import { PlansList } from './plans-list'

export function Plans() {
  return (
    <section
      id={LANDING_SECTION_IDS.plans}
      className="bg-white pt-16 pb-18 text-center sm:pt-20 sm:pb-22 xl:pt-30 xl:pb-30.5"
    >
      <div className="mx-auto max-w-331 px-5 sm:px-8">
        <SectionBadge data-scrub="up" variant="blue">
          Planos
        </SectionBadge>

        <SectionTitle data-scrub="up">
          Escolha o plano ideal para sua loja
        </SectionTitle>
        <SectionSubtitle data-scrub="up" className="mt-[13.2px]">
          Teste qualquer plano{' '}
          <strong className="font-semibold">grátis por 14 dias</strong>.
        </SectionSubtitle>

        <PlansList />
      </div>
    </section>
  )
}
