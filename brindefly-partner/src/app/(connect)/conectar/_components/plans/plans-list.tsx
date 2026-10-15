'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { toast } from 'sonner'

import type { Plan } from '@/@types/plan'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { LINK_TOKEN_PARAM } from '@/constants/connection'
import { FEATURED_PLAN_SLUG } from '@/constants/plans'
import {
  useCreateConnectionCheckout,
  useFetchPlans,
} from '@/http/veforma-client-api'
import { errorHandler } from '@/utils/error-handler'

import { PlanCard } from './plan-card'

// Mesma grade dos cards: 3 colunas de até 382px no desktop, 1 coluna antes.
const GRID_CLASS_NAME =
  'mt-9 grid grid-cols-[minmax(0,420px)] justify-center gap-7 text-left sm:mt-12 xl:mt-19.75 xl:grid-cols-[repeat(3,minmax(0,382px))] xl:gap-7.5'

const SKELETON_KEYS = ['essencial', 'basico', 'profissional'] as const

export function PlansList() {
  const linkToken = useSearchParams().get(LINK_TOKEN_PARAM)

  const { data, isPending, isError, error, isFetching, refetch } =
    useFetchPlans()

  const {
    mutate: createCheckout,
    isPending: isCreatingCheckout,
    isSuccess: isCheckoutCreated,
    variables: checkoutVariables,
  } = useCreateConnectionCheckout({
    mutation: {
      onSuccess: ({ checkoutUrl }) => {
        // Aba inteira para o Stripe Checkout; a volta é pelo success_url.
        window.location.assign(checkoutUrl)
      },
      onError: (checkoutError) => {
        const { title, description } = errorHandler(checkoutError)
        toast.error(title, { description })
      },
    },
  })

  const plans = useMemo(
    () =>
      [...(data?.plans ?? [])].sort((a, b) => a.priceInCents - b.priceInCents),
    [data],
  )

  function handleSelectPlan(plan: Plan) {
    if (!linkToken) return

    createCheckout({ linkToken, data: { planSlug: plan.slug } })
  }

  // Depois do checkout criado a página navega: os botões não voltam a ficar
  // ativos no meio do caminho.
  const isLeavingToCheckout = isCreatingCheckout || isCheckoutCreated

  if (isPending) {
    return (
      <div className={GRID_CLASS_NAME} aria-busy="true">
        {SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="h-158.25 rounded-[30px]" />
        ))}
      </div>
    )
  }

  if (isError) {
    const { title, description } = errorHandler(error)

    return (
      <div className="mx-auto mt-9 flex max-w-110 flex-col items-center gap-2 sm:mt-12">
        <p className="font-semibold text-foreground text-lg">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
        <Button
          className="mt-3 h-11 rounded-[27px] px-6 font-bold"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          Tentar de novo
        </Button>
      </div>
    )
  }

  return (
    <div className={GRID_CLASS_NAME}>
      {plans.map((plan, index) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isFeatured={plan.slug === FEATURED_PLAN_SLUG}
          isSelecting={
            isLeavingToCheckout &&
            checkoutVariables?.data.planSlug === plan.slug
          }
          isDisabled={isLeavingToCheckout}
          onSelect={() => handleSelectPlan(plan)}
          data-scrub="up"
          data-scrub-seq={index}
        />
      ))}
    </div>
  )
}
