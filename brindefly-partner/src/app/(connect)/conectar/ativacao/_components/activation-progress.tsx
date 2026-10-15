'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useBoolean } from 'usehooks-ts'

import { ErrorCard } from '@/app/(connect)/_components/error-card'
import { InvalidLink } from '@/app/(connect)/_components/invalid-link'
import {
  CONNECT_ROUTES,
  withLinkToken,
} from '@/app/(connect)/_lib/route-for-status'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CHECKOUT_CONFIRMATION_GRACE_MS,
  CONNECTION_POLLING_FAILURES_BEFORE_WARNING,
  LINK_TOKEN_PARAM,
} from '@/constants/connection'
import { useConnectionRequest } from '@/hooks/use-connection-request'
import { useReloadOnBfcacheRestore } from '@/hooks/use-reload-on-bfcache-restore'
import {
  useCompleteConnectionRequest,
  useRetryConnectionRequest,
} from '@/http/veforma-client-api'
import { errorHandler } from '@/utils/error-handler'

import { countStepsDone } from '../_lib/activation-steps'
import { ActivationCard } from './activation-card'
import { ActivationCompleted } from './activation-completed'
import { ActivationFailed } from './activation-failed'

export function ActivationProgress() {
  const linkToken = useSearchParams().get(LINK_TOKEN_PARAM)

  useReloadOnBfcacheRestore()

  const hasRequestedComplete = useRef(false)
  const { value: isCheckoutSlow, setTrue: markCheckoutSlow } = useBoolean(false)

  const {
    mutate: complete,
    data: completeData,
    isError: isCompleteError,
    error: completeError,
    isPending: isCompleting,
  } = useCompleteConnectionRequest({
    mutation: {
      onError: () => {
        hasRequestedComplete.current = false
      },
    },
  })

  const callbackUrl = completeData?.callbackUrl ?? null

  const { mutate: retry, isPending: isRetrying } = useRetryConnectionRequest({
    mutation: {
      onSuccess: () => refetch(),
      onError: (mutationError) => {
        const { title, description } = errorHandler(mutationError)
        toast.error(title, { description })
      },
    },
  })

  const {
    connectionRequest,
    isPending,
    isError,
    error,
    isNotFound,
    isFetching,
    fetchStatus,
    refetch,
    consecutiveFailures,
  } = useConnectionRequest(linkToken, {
    poll: !isCompleting && callbackUrl === null,
  })

  const status = connectionRequest?.status

  // PENDING aqui quase sempre é a Stripe ainda não ter avisado a Veforma (o
  // cancel_url volta para a landing). Continua consultando; depois da carência
  // mostra a saída para os planos sem tirar o brindeiro da tela.
  useEffect(() => {
    if (status !== 'PENDING') return

    const timer = setTimeout(markCheckoutSlow, CHECKOUT_CONFIRMATION_GRACE_MS)

    return () => clearTimeout(timer)
  }, [status, markCheckoutSlow])

  // Produtos sincronizados: concluir uma única vez.
  useEffect(() => {
    if (status !== 'PRODUCTS_SYNCED' || !linkToken) return
    if (hasRequestedComplete.current) return

    hasRequestedComplete.current = true
    complete({ linkToken })
  }, [status, linkToken, complete])

  function handleRetryComplete() {
    if (!linkToken) return

    hasRequestedComplete.current = true
    complete({ linkToken })
  }

  if (!linkToken) return <InvalidLink />

  const isFinishing = isCompleting || callbackUrl !== null

  if (isFinishing) {
    return (
      <ActivationCard
        doneCount={countStepsDone('PRODUCTS_SYNCED', callbackUrl !== null)}
        callbackUrl={callbackUrl}
        isReconnecting={false}
      />
    )
  }

  if (isNotFound) return <InvalidLink />

  if (isPending) return <Skeleton className="h-[28rem] w-full max-w-lg" />

  if (!connectionRequest) {
    const { title, description } = errorHandler(error)

    return (
      <ErrorCard
        title={title}
        description={description}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    )
  }

  if (status === 'FAILED') {
    return (
      <ActivationFailed
        reason={connectionRequest.failureReason}
        onRetry={() => retry({ linkToken })}
        isRetrying={isRetrying}
      />
    )
  }

  if (status === 'COMPLETED') {
    return <ActivationCompleted />
  }

  if (isCompleteError) {
    const { title, description } = errorHandler(completeError)

    return (
      <ErrorCard
        title={title}
        description={description}
        onRetry={handleRetryComplete}
      />
    )
  }

  if (!status) return <Skeleton className="h-[28rem] w-full max-w-lg" />

  const isAwaitingCheckout = status === 'PENDING'
  const isReconnecting =
    fetchStatus === 'paused' ||
    (isError &&
      consecutiveFailures >= CONNECTION_POLLING_FAILURES_BEFORE_WARNING)

  return (
    <ActivationCard
      doneCount={countStepsDone(status, callbackUrl !== null)}
      callbackUrl={callbackUrl}
      isReconnecting={isReconnecting}
      isAwaitingCheckout={isAwaitingCheckout}
      footer={
        isAwaitingCheckout &&
        isCheckoutSlow && (
          <p
            role="status"
            className="mt-4 text-center text-muted-foreground text-xs"
          >
            Está demorando mais que o normal. Se você não concluiu o checkout,{' '}
            <Link
              href={withLinkToken(CONNECT_ROUTES.landing, linkToken)}
              className="underline underline-offset-4"
            >
              volte para os planos
            </Link>
            .
          </p>
        )
      }
    />
  )
}
