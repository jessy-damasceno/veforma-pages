import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ConnectionGate } from '@/app/(connect)/_components/connection-gate'

import { HeroSection } from './_components/hero-section'
import { LandingSkeleton } from './_components/landing-skeleton'
import { PlansSection } from './_components/plans-section'

export const metadata: Metadata = {
  title: 'Planos',
}

// useSearchParams dentro do gate exige Suspense na prerenderização.
export default function ConnectPage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <ConnectionGate fallback={<LandingSkeleton />}>
        <HeroSection />
        <PlansSection />
      </ConnectionGate>
    </Suspense>
  )
}
