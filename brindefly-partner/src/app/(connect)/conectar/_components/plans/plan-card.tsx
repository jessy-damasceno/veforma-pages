import Image from 'next/image'
import type { ComponentProps } from 'react'

import type { Plan, PlanFeatureKey } from '@/@types/plan'
import { cn } from '@/utils/cn'

interface PlanFeature {
  key: PlanFeatureKey
  label: string
  hint?: string
  badgeClassName?: string
}

const PLAN_FEATURES: PlanFeature[] = [
  { key: 'integration', label: '3D integrado à Brindefly' },
  {
    key: 'models',
    label: 'Modelos disponíveis',
    badgeClassName: '-top-px right-4.5 w-21.75 sm:right-14',
  },
  {
    key: 'views',
    label: 'Views por mês',
    hint: 'R$ 0,02 por view extra',
    badgeClassName: 'top-1.75 right-12 w-16 sm:right-22.25',
  },
  { key: 'metrics', label: 'Métricas de engajamento' },
  { key: 'augmented-reality', label: 'Realidade aumentada' },
  { key: 'campaign-links', label: 'Links e QR Codes para campanhas' },
  { key: 'print-type-preview', label: 'Visualização por tipo de impressão' },
  { key: 'priority-queue', label: 'Lista de prioridade para novos modelos' },
]

const DEPTH_SHADOW_CLASS_NAME =
  'shadow-[0_87.56px_83.83px_-37.26px_rgba(22,39,82,.5),inset_1.86px_2.79px_1.86px_rgba(255,255,255,.1),inset_0_-2.79px_1.86px_rgba(52,127,252,.1)]'

function getFeatureBadge(key: PlanFeatureKey, plan: Plan) {
  if (key === 'models') return 'ilimitado'
  if (key === 'views') return plan.monthlyViews

  return null
}

interface PlanCardProps extends ComponentProps<'article'> {
  plan: Plan
}

// Card de preço: cabeçalho 382x158 (preço) + corpo 382x475 (itens + botão),
// com tudo posicionado em px do Figma. O plano em destaque ganha o gradiente
// da marca e borda azul.
export function PlanCard({ plan, className, ...props }: PlanCardProps) {
  const { name, monthlyPrice, includedFeatures, isFeatured } = plan

  return (
    <article className={cn('relative', className)} {...props}>
      <div
        className={cn(
          'relative z-1 h-39.5 text-white',
          isFeatured
            ? 'rounded-t-[36px] bg-brand-gradient'
            : cn(
                'rounded-t-[30px] bg-linear-to-b from-[#5f5e90] to-black',
                DEPTH_SHADOW_CLASS_NAME,
              ),
        )}
      >
        <h3 className="absolute top-7.75 left-6 font-medium text-lg leading-7.25 tracking-[-0.18px] sm:left-7.75">
          {name}
        </h3>
        <p className="absolute top-17.25 left-6 flex items-center gap-2 whitespace-nowrap font-semibold text-[34px] leading-7.25 tracking-[-1.11px] sm:left-7.75 sm:text-[37px]">
          R$ {monthlyPrice}
          <span className="relative top-1 font-normal text-sm tracking-[-0.14px]">
            /mês
          </span>
        </p>
        <p className="absolute top-26.5 left-6 whitespace-nowrap text-sm leading-7.25 tracking-[-0.14px] sm:left-7.75">
          Teste grátis por 14 dias
        </p>
        <Image
          src="/static/landing/05-planos/icon-ar.svg"
          alt=""
          width={33}
          height={33}
          className="absolute top-6 right-5.5 size-8.25 sm:right-8"
        />
      </div>

      <div
        className={cn(
          'relative z-2 h-118.75 rounded-b-[18px] bg-white text-[#0a0a0a] shadow-[0_0_12px_rgba(0,0,0,.07)]',
          // a borda de 2px do destaque não desloca os itens
          isFeatured
            ? 'border-2 border-[#0b40ca] pt-8.25 pr-4 pl-5 sm:pr-6 sm:pl-7'
            : 'pt-8.75 pr-4.5 pl-5.5 sm:pr-6.5 sm:pl-7.5',
        )}
      >
        <ul>
          {PLAN_FEATURES.map(({ key, label, hint, badgeClassName }) => {
            const isIncluded = includedFeatures.includes(key)
            const badge = getFeatureBadge(key, plan)

            return (
              <li
                key={key}
                className={cn(
                  'relative mb-4.5 flex min-h-5.5 items-start gap-2 font-medium text-[13.5px] leading-3.5 sm:text-sm',
                  hint && 'min-h-9',
                )}
              >
                <Image
                  src={
                    isIncluded
                      ? '/static/landing/05-planos/icon-check.svg'
                      : '/static/landing/05-planos/icon-x.svg'
                  }
                  alt={isIncluded ? 'Incluso' : 'Não incluso'}
                  width={22}
                  height={22}
                  className="size-5.5 shrink-0"
                />
                <span className="pt-1">
                  {label}
                  {hint && (
                    <small className="mt-1 block font-medium text-[#c3c3c3] text-xs leading-3.5">
                      {hint}
                    </small>
                  )}
                </span>

                {badge && (
                  <span
                    className={cn(
                      'absolute flex h-7 items-center justify-center rounded-[60px] border border-black font-semibold text-[11px] text-black tracking-[-0.11px]',
                      badgeClassName,
                    )}
                  >
                    {badge}
                  </span>
                )}
              </li>
            )
          })}
        </ul>

        {/* TODO: abrir o checkout do Stripe (link gerado pela API existente) */}
        <button
          type="button"
          className={cn(
            'absolute top-97.5 left-1/2 ml-[-162.5px] flex h-14.5 w-81.25 items-center gap-[8.6px] whitespace-nowrap rounded-[20px] pl-20.75 font-bold text-sm text-white tracking-[-0.14px] transition-[translate,filter] duration-300 hover:-translate-y-0.5 sm:left-7.75 sm:ml-0',
            isFeatured
              ? 'top-97 ml-[-164.5px] bg-brand-gradient hover:brightness-110 sm:left-7.25'
              : cn(
                  'bg-[#1f1f1f] hover:brightness-125',
                  DEPTH_SHADOW_CLASS_NAME,
                ),
          )}
        >
          <Image
            src="/static/landing/05-planos/icon-btn-check.svg"
            alt=""
            width={29}
            height={24}
            className="mt-[3.2px] h-[24.1px] w-[28.6px] shrink-0"
          />
          Testar grátis
        </button>
      </div>
    </article>
  )
}
