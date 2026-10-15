import { LoaderCircleIcon } from 'lucide-react'
import Image from 'next/image'
import type { ComponentProps } from 'react'

import type { Plan } from '@/@types/plan'
import { PLAN_FEATURES, type PlanFeature } from '@/constants/plans'
import { cn } from '@/utils/cn'
import { formatCompactLimit, formatCurrencyFromCents } from '@/utils/formatters'

const DEPTH_SHADOW_CLASS_NAME =
  'shadow-[0_87.56px_83.83px_-37.26px_rgba(22,39,82,.5),inset_1.86px_2.79px_1.86px_rgba(255,255,255,.1),inset_0_-2.79px_1.86px_rgba(52,127,252,.1)]'

// Posição da pílula em px do Figma: na linha com nota ela desce e encolhe.
const BADGE_CLASS_NAME = '-top-px right-4.5 w-21.75 sm:right-14'
const BADGE_WITH_NOTE_CLASS_NAME = 'top-1.75 right-12 w-16 sm:right-22.25'

type PlanLimitKey = Extract<PlanFeature, { kind: 'limit' }>['limit']

// O layout só tem espaço para o selo nas linhas curtas ("Modelos disponíveis"
// e "Views por mês"). Nos outros limites a quantidade vai para a nota.
const BADGE_LIMITS: readonly PlanLimitKey[] = ['monthlyViews']

interface FeatureState {
  isIncluded: boolean
  badge: string | null
  note?: string
}

// Regras de constants/plans.ts: em `limits`, 0 = não incluso e null =
// ilimitado; em `availability`, texto vira o selo à direita. A nota explica o
// que vem incluso, então some no item riscado.
function getFeatureState(feature: PlanFeature, plan: Plan): FeatureState {
  if (feature.kind === 'flag') {
    const availability = feature.availability[plan.slug]
    const isIncluded = availability !== false

    return {
      isIncluded,
      badge: typeof availability === 'string' ? availability : null,
      note: isIncluded ? feature.note : undefined,
    }
  }

  const value = plan.limits[feature.limit]

  if (value === 0) return { isIncluded: false, badge: null }

  if (BADGE_LIMITS.includes(feature.limit)) {
    return {
      isIncluded: true,
      badge: formatCompactLimit(value),
      note: feature.note,
    }
  }

  // Ex.: "5 pedidos de modelos incluídos". Ilimitado fica implícito no check.
  const note =
    value !== null && feature.note
      ? `${formatCompactLimit(value)} ${feature.note}`
      : feature.note

  return { isIncluded: true, badge: null, note }
}

interface PlanCardProps extends ComponentProps<'article'> {
  plan: Plan
  isFeatured: boolean
  isSelecting: boolean
  isDisabled: boolean
  onSelect: () => void
}

// Card de preço: cabeçalho 382x158 (preço) + corpo 382x475 (itens + botão),
// com tudo posicionado em px do Figma. O plano em destaque ganha o gradiente
// da marca e borda azul.
export function PlanCard({
  plan,
  isFeatured,
  isSelecting,
  isDisabled,
  onSelect,
  className,
  ...props
}: PlanCardProps) {
  const { name, priceInCents, trialDays } = plan

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
          {formatCurrencyFromCents(priceInCents)}
          <span className="relative top-1 font-normal text-sm tracking-[-0.14px]">
            /mês
          </span>
        </p>
        {trialDays > 0 && (
          <p className="absolute top-26.5 left-6 whitespace-nowrap text-sm leading-7.25 tracking-[-0.14px] sm:left-7.75">
            Teste grátis por {trialDays} dias
          </p>
        )}
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
          {PLAN_FEATURES.map((feature) => {
            const { isIncluded, badge, note } = getFeatureState(feature, plan)

            return (
              <li
                key={feature.label}
                className={cn(
                  'relative mb-4.5 flex min-h-5.5 items-start gap-2 font-medium text-[13.5px] leading-3.5 sm:text-sm',
                  note && 'min-h-9',
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
                  {feature.label}
                  {note && (
                    <small className="mt-1 block font-medium text-[#c3c3c3] text-xs leading-3.5">
                      {note}
                    </small>
                  )}
                </span>

                {badge && (
                  <span
                    className={cn(
                      'absolute flex h-7 items-center justify-center rounded-[60px] border border-black font-semibold text-[11px] text-black tracking-[-0.11px]',
                      note ? BADGE_WITH_NOTE_CLASS_NAME : BADGE_CLASS_NAME,
                    )}
                  >
                    {badge}
                  </span>
                )}
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          disabled={isDisabled}
          aria-busy={isSelecting}
          onClick={onSelect}
          className={cn(
            'absolute top-97.5 left-1/2 ml-[-162.5px] flex h-14.5 w-81.25 items-center gap-[8.6px] whitespace-nowrap rounded-[20px] pl-20.75 font-bold text-sm text-white tracking-[-0.14px] transition-[translate,filter,opacity] duration-300 enabled:hover:-translate-y-0.5 disabled:opacity-70 sm:left-7.75 sm:ml-0',
            isFeatured
              ? 'top-97 ml-[-164.5px] bg-brand-gradient enabled:hover:brightness-110 sm:left-7.25'
              : cn(
                  'bg-[#1f1f1f] enabled:hover:brightness-125',
                  DEPTH_SHADOW_CLASS_NAME,
                ),
          )}
        >
          {isSelecting ? (
            <LoaderCircleIcon
              aria-hidden="true"
              className="h-[24.1px] w-[28.6px] shrink-0 animate-spin"
            />
          ) : (
            <Image
              src="/static/landing/05-planos/icon-btn-check.svg"
              alt=""
              width={29}
              height={24}
              className="mt-[3.2px] h-[24.1px] w-[28.6px] shrink-0"
            />
          )}
          Testar grátis
        </button>
      </div>
    </article>
  )
}
