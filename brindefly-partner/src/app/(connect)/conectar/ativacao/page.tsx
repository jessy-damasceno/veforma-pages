import type { Metadata } from 'next'
import { Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

import { ActivationProgress } from './_components/activation-progress'

export const metadata: Metadata = {
  title: 'Ativando sua assinatura',
}

export default function ActivationPage() {
  return (
    <div className="grid flex-1 place-items-center px-6 py-12">
      <Suspense fallback={<Skeleton className="h-[28rem] w-full max-w-lg" />}>
        <ActivationProgress />
      </Suspense>
    </div>
  )
}
