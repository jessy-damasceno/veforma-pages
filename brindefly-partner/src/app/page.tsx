import { redirect } from 'next/navigation'

import { CONNECT_ROUTES } from '@/app/(connect)/_lib/route-for-status'

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// A Veforma monta o connectionUrl na raiz (`/?linkToken=`): repassa a query
// inteira para a landing em vez de perdê-la no redirect.
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(await searchParams)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) params.append(key, item)
    }
  }

  const query = params.toString()

  redirect(
    query ? `${CONNECT_ROUTES.landing}?${query}` : CONNECT_ROUTES.landing,
  )
}
