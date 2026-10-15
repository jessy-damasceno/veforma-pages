import type { GetConnectionRequestQueryResponse } from '@/http/veforma-client-api'

export type ConnectionRequest =
  GetConnectionRequestQueryResponse['connectionRequest']

export type ConnectionRequestStatus = ConnectionRequest['status']
