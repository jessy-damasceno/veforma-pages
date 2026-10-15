import { useEffect } from 'react'

// Páginas restauradas do back-forward cache voltam com o estado React congelado
// (ex.: botão "Assinar" travado em loading após Voltar do Stripe). Recarregar
// refaz a consulta de status e roteia de novo.
export function useReloadOnBfcacheRestore() {
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload()
    }

    window.addEventListener('pageshow', handlePageShow)

    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])
}
