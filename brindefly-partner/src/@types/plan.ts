export type PlanFeatureKey =
  | 'integration'
  | 'models'
  | 'views'
  | 'metrics'
  | 'augmented-reality'
  | 'campaign-links'
  | 'print-type-preview'
  | 'priority-queue'

export interface Plan {
  name: string
  monthlyPrice: number
  monthlyViews: string
  includedFeatures: PlanFeatureKey[]
  isFeatured?: boolean
}
