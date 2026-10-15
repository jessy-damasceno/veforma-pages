'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { useBoolean } from 'usehooks-ts'

import { ErrorCard } from '@/app/(connect)/_components/error-card'
import { Skeleton } from '@/components/ui/skeleton'
import { LINK_TOKEN_PARAM } from '@/constants/connection'
import { FEATURED_PLAN_SLUG } from '@/constants/plans'
import {
  useCreateConnectionCheckout,
  useFetchPlans,
} from '@/http/veforma-client-api'
import { errorHandler } from '@/utils/error-handler'

import { type Plan, PlanCard } from './plan-card'

export function PlansSection() {
  const linkToken = useSearchParams().get(LINK_TOKEN_PARAM)
  const { value: isRedirecting, setTrue: startRedirecting } = useBoolean(false)

  const { data, isPending, isError, error, isFetching, refetch } =
    useFetchPlans()

  const {
    mutate: createCheckout,
    isPending: isCreatingCheckout,
    variables,
  } = useCreateConnectionCheckout({
    mutation: {
      onSuccess: ({ checkoutUrl }) => {
        // Navegação de aba inteira para o Stripe Checkout.
        startRedirecting()
        window.location.assign(checkoutUrl)
      },
      onError: (mutationError) => {
        const { title, description } = errorHandler(mutationError)
        toast.error(title, { description })
      },
    },
  })

  const isCheckoutInProgress = isCreatingCheckout || isRedirecting

  const plans = useMemo(
    () =>
      [...(data?.plans ?? [])].sort((a, b) => a.priceInCents - b.priceInCents),
    [data],
  )

  const plansError = isError ? errorHandler(error) : null

  function handleSelectPlan(plan: Plan) {
    if (!linkToken) return

    createCheckout({ linkToken, data: { planSlug: plan.slug } })
  }

  return (
    <section
      id="planos"
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16"
    >
      <div className="text-center">
        <h2 className="font-bold text-3xl tracking-tight">
          Escolha o plano ideal para sua loja
        </h2>
        <p className="mt-2 text-muted-foreground">
          Assine com o cartão e comece a usar hoje.
        </p>
      </div>

      {isPending && (
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      )}

      {plansError && (
        <ErrorCard
          title={plansError.title}
          description={plansError.description}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      )}

      {!isPending && !isError && (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              featured={plan.slug === FEATURED_PLAN_SLUG}
              onSelect={handleSelectPlan}
              isSelecting={
                isCheckoutInProgress && variables?.data.planSlug === plan.slug
              }
              disabled={isCheckoutInProgress}
            />
          ))}
        </div>
      )}
    </section>
  )
}
