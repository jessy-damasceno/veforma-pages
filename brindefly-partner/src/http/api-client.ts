import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'

import { env } from '@/config/env'

export type RequestConfig<TData = unknown> = {
  timeout?: number
  baseURL?: string
  url?: string
  method?: 'GET' | 'PUT' | 'PATCH' | 'POST' | 'DELETE' | 'OPTIONS' | 'HEAD'
  params?: unknown
  data?: TData | FormData
  responseType?:
    | 'arraybuffer'
    | 'blob'
    | 'document'
    | 'json'
    | 'text'
    | 'stream'
  signal?: AbortSignal
  validateStatus?: (status: number) => boolean
  headers?: AxiosRequestConfig['headers']
  paramsSerializer?: AxiosRequestConfig['paramsSerializer']
}

export type ResponseConfig<TData = unknown> = {
  data: TData
  status: number
  statusText: string
  headers: AxiosResponse['headers']
}

export type ResponseErrorConfig<TError = unknown> = AxiosError<TError>

export type Client = <TResponseData, _TError = unknown, TRequestData = unknown>(
  config: RequestConfig<TRequestData>,
) => Promise<ResponseConfig<TResponseData>>

const defaultConfig: Partial<RequestConfig> = {
  baseURL: env.NEXT_PUBLIC_VEFORMA_CLIENT_API_URL,
  timeout: 15_000,
  paramsSerializer: {
    indexes: null,
  },
}

export const api = axios.create(defaultConfig)

export const client = async <
  TResponseData,
  _TError = unknown,
  TRequestData = unknown,
>(
  config: RequestConfig<TRequestData>,
): Promise<ResponseConfig<TResponseData>> => {
  return api.request<TResponseData, ResponseConfig<TResponseData>>({
    ...config,
    headers: {
      ...defaultConfig.headers,
      ...config.headers,
    },
  })
}

export default client
