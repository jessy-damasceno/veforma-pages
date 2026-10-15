'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { CONNECT_ROUTES } from '@/app/(connect)/_lib/route-for-status'

// A Veforma monta o connectionUrl na raiz (`/?linkToken=`): repassa a query
// inteira para a landing em vez de perdê-la no redirect.
export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(`${CONNECT_ROUTES.landing}${window.location.search}`)
  }, [router])

  return null
}
