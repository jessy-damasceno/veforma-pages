import type { Plan, PlanFeatureKey } from '@/@types/plan'
import { LANDING_SECTION_IDS } from '@/constants/landing'

import { SectionBadge } from '../section-badge'
import { SectionSubtitle } from '../section-subtitle'
import { SectionTitle } from '../section-title'
import { PlanCard } from './plan-card'

// Incluídos em todos os planos.
const BASE_FEATURES: PlanFeatureKey[] = [
  'integration',
  'models',
  'views',
  'metrics',
  'augmented-reality',
]

const PLANS: Plan[] = [
  {
    name: 'Essencial',
    monthlyPrice: 97,
    monthlyViews: '10 mil',
    includedFeatures: BASE_FEATURES,
  },
  {
    name: 'Básico',
    monthlyPrice: 147,
    monthlyViews: '30 mil',
    includedFeatures: [...BASE_FEATURES, 'campaign-links'],
  },
  {
    name: 'Profissional',
    monthlyPrice: 197,
    monthlyViews: '80 mil',
    includedFeatures: [
      ...BASE_FEATURES,
      'campaign-links',
      'print-type-preview',
      'priority-queue',
    ],
    isFeatured: true,
  },
]

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

        <div className="mt-9 grid grid-cols-[minmax(0,420px)] justify-center gap-7 text-left sm:mt-12 xl:mt-19.75 xl:grid-cols-[repeat(3,minmax(0,382px))] xl:gap-7.5">
          {PLANS.map((plan, index) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              data-scrub="up"
              data-scrub-seq={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
