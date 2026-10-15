import type { FetchPlans200 } from '@/http/veforma-client-api'

export type Plan = FetchPlans200['plans'][number]
