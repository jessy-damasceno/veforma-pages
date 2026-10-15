import type { ResponseErrorConfig } from '@/http/api-client'

interface VeformaApiError {
  code: string
  title?: string
  message?: string
}

export interface HandledError {
  code: string
  title: string
  description: string
}

const NETWORK_ERROR: HandledError = {
  code: 'NETWORK/UNAVAILABLE',
  title: 'Não foi possível falar com a Veforma',
  description: 'Verifique sua conexão e tente de novo.',
}

// O servidor respondeu, mas sem title/message (ex.: erro padrão do Fastify).
const GENERIC_ERROR_TITLE = 'Algo deu errado'
const GENERIC_ERROR_DESCRIPTION = 'Tente de novo em instantes.'

export function errorHandler(error: unknown): HandledError {
  const data = (error as ResponseErrorConfig<VeformaApiError> | undefined)
    ?.response?.data

  if (data?.code) {
    return {
      code: data.code,
      title: data.title ?? GENERIC_ERROR_TITLE,
      description: data.message ?? GENERIC_ERROR_DESCRIPTION,
    }
  }

  return NETWORK_ERROR
}
