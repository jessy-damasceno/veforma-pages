import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ConnectionGate } from '@/app/(connect)/_components/connection-gate'

import { Landing } from './_components/landing'
import { LandingSkeleton } from './_components/landing-skeleton'

export const metadata: Metadata = {
  title: { absolute: 'Veforma 3D + Brindefly' },
  description:
    'A Veforma adiciona um visualizador 3D à sua loja Brindefly para o cliente escolher cores, tipos de impressão e aplicar a própria logo no produto.',
}

// useSearchParams dentro do gate exige Suspense na prerenderização.
export default function ConnectPage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <ConnectionGate fallback={<LandingSkeleton />}>
        <Landing />
      </ConnectionGate>
    </Suspense>
  )
}
