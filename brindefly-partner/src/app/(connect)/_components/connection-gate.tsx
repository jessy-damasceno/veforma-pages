'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'

import { ErrorCard } from '@/app/(connect)/_components/error-card'
import { InvalidLink } from '@/app/(connect)/_components/invalid-link'
import {
  CONNECT_ROUTES,
  routeForStatus,
  withLinkToken,
} from '@/app/(connect)/_lib/route-for-status'
import { LINK_TOKEN_PARAM } from '@/constants/connection'
import { useConnectionRequest } from '@/hooks/use-connection-request'
import { useReloadOnBfcacheRestore } from '@/hooks/use-reload-on-bfcache-restore'
import { errorHandler } from '@/utils/error-handler'

interface ConnectionGateProps {
  children: ReactNode
  /** Mostrado enquanto consulta o status ou enquanto redireciona. */
  fallback: ReactNode
}

// Só deixa a landing aparecer com o pedido PENDING. Qualquer outro status vai
// para a ativação; sem token ou 404 mostra "link inválido" sem redirecionar.
export function ConnectionGate({ children, fallback }: ConnectionGateProps) {
  useReloadOnBfcacheRestore()

  const router = useRouter()
  const linkToken = useSearchParams().get(LINK_TOKEN_PARAM)

  const {
    connectionRequest,
    isPending,
    isError,
    error,
    isNotFound,
    isFetching,
    refetch,
  } = useConnectionRequest(linkToken)

  const status = connectionRequest?.status
  const targetRoute = status ? routeForStatus(status) : null
  const shouldRedirect =
    targetRoute !== null && targetRoute !== CONNECT_ROUTES.landing

  useEffect(() => {
    if (shouldRedirect && targetRoute && linkToken) {
      router.replace(withLinkToken(targetRoute, linkToken))
    }
  }, [shouldRedirect, targetRoute, linkToken, router])

  if (!linkToken || isNotFound) return <InvalidLink />

  if (isPending || shouldRedirect) return <>{fallback}</>

  if (isError && !connectionRequest) {
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

  return <>{children}</>
}
