import { useRef } from 'react'

import {
  CONNECTION_POLLING_INTERVAL_MS,
  POLLED_STATUSES,
} from '@/constants/connection'
import { useGetConnectionRequest } from '@/http/veforma-client-api'

interface UseConnectionRequestOptions {
  /** Consulta a cada 2 s enquanto o status estiver em PENDING ou em andamento. */
  poll?: boolean
}

export function useConnectionRequest(
  linkToken: string | null,
  { poll = false }: UseConnectionRequestOptions = {},
) {
  const query = useGetConnectionRequest(linkToken ?? undefined, {
    query: {
      staleTime: 0,
      refetchIntervalInBackground: true,
      refetchInterval: (current) => {
        if (!poll) return false

        const status = current.state.data?.connectionRequest.status

        return status && POLLED_STATUSES.includes(status)
          ? CONNECTION_POLLING_INTERVAL_MS
          : false
      },
    },
  })

  // Falhas seguidas desde a última resposta boa (para o aviso "tentando reconectar").
  const lastSuccessRef = useRef({ dataUpdatedAt: 0, errorUpdateCount: 0 })

  if (query.dataUpdatedAt !== lastSuccessRef.current.dataUpdatedAt) {
    lastSuccessRef.current = {
      dataUpdatedAt: query.dataUpdatedAt,
      errorUpdateCount: query.errorUpdateCount,
    }
  }

  const consecutiveFailures =
    query.errorUpdateCount - lastSuccessRef.current.errorUpdateCount

  return {
    ...query,
    connectionRequest: query.data?.connectionRequest ?? null,
    isNotFound: query.error?.response?.status === 404,
    consecutiveFailures,
  }
}
