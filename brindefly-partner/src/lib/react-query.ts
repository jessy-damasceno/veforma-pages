import { QueryClient } from '@tanstack/react-query'

// Um QueryClient por sessão do navegador (criado dentro do QueryProvider).
export const makeQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
      },
    },
  })
