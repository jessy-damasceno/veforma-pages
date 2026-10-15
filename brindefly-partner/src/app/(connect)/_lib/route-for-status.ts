import type { ConnectionRequestStatus } from '@/@types/connection'
import { LINK_TOKEN_PARAM } from '@/constants/connection'

export const CONNECT_ROUTES = {
  landing: '/conectar',
  activation: '/conectar/ativacao',
} as const

export type ConnectRoute = (typeof CONNECT_ROUTES)[keyof typeof CONNECT_ROUTES]

/** Única regra de roteamento do fluxo: PENDING fica na landing, o resto vai para a ativação. */
export const routeForStatus = (
  status: ConnectionRequestStatus,
): ConnectRoute =>
  status === 'PENDING' ? CONNECT_ROUTES.landing : CONNECT_ROUTES.activation

export const withLinkToken = (route: ConnectRoute, linkToken: string): string =>
  `${route}?${LINK_TOKEN_PARAM}=${encodeURIComponent(linkToken)}`
