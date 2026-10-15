import { Check, LoaderCircle, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PLAN_FEATURES } from '@/constants/plans'
import type { FetchPlans200 } from '@/http/veforma-client-api'
import { cn } from '@/utils/cn'
import { formatCurrencyFromCents, formatLimit } from '@/utils/formatters'

export type Plan = FetchPlans200['plans'][number]

interface PlanCardProps {
  plan: Plan
  featured: boolean
  onSelect: (plan: Plan) => void
  isSelecting: boolean
  disabled: boolean
}

export function PlanCard({
  plan,
  featured,
  onSelect,
  isSelecting,
  disabled,
}: PlanCardProps) {
  return (
    <Card className={cn('flex flex-col', featured && 'border-foreground')}>
      <CardContent className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{plan.name}</h3>
            {featured && (
              <span className="rounded-full bg-primary px-2 py-0.5 font-medium text-[11px] text-primary-foreground">
                Mais escolhido
              </span>
            )}
          </div>
          {plan.description && (
            <p className="mt-1 text-muted-foreground text-sm">
              {plan.description}
            </p>
          )}
        </div>

        <div>
          <p className="font-bold text-3xl tracking-tight">
            {formatCurrencyFromCents(plan.priceInCents)}
            <span className="font-normal text-base text-muted-foreground">
              /mês
            </span>
          </p>
          {plan.trialDays > 0 && (
            <p className="mt-1 text-muted-foreground text-sm">
              {plan.trialDays} dias grátis. Nada é cobrado agora.
            </p>
          )}
        </div>

        <ul className="flex flex-col gap-2.5 text-sm">
          {PLAN_FEATURES.map((feature) => {
            // limit: 0 = não incluso, null = ilimitado, n = selo com o número
            const value =
              feature.kind === 'limit'
                ? plan.limits[feature.limit] === 0
                  ? false
                  : formatLimit(plan.limits[feature.limit])
                : feature.availability[plan.slug]

            if (value === false) {
              return (
                <li
                  key={feature.label}
                  className="flex items-start gap-2.5 text-muted-foreground"
                >
                  <X className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span className="line-through">{feature.label}</span>
                  <span className="sr-only">(não incluso)</span>
                </li>
              )
            }

            return (
              <li key={feature.label} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p>{feature.label}</p>
                    {typeof value === 'string' && (
                      <span className="ml-auto shrink-0 rounded-md border bg-secondary px-2 py-0.5 font-medium text-xs">
                        {value}
                      </span>
                    )}
                  </div>
                  {feature.note && (
                    <p className="mt-0.5 text-muted-foreground text-xs">
                      {feature.note}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        <Button
          size="lg"
          className="mt-auto w-full"
          variant={featured ? 'default' : 'outline'}
          onClick={() => onSelect(plan)}
          disabled={disabled}
        >
          {isSelecting && <LoaderCircle className="animate-spin" aria-hidden />}
          Assinar {plan.name}
        </Button>
      </CardContent>
    </Card>
  )
}
