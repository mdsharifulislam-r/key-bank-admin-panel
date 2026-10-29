export const PLAN_CYCLES = ['daily', 'weekly', 'monthly', 'yearly'] as const
export type PlanCycle = (typeof PLAN_CYCLES)[number]

export interface Plan {
  _id: string
  name: string
  description?: string
  price: number
  recurring: PlanCycle | string
  bufferTime?: number
  features?: string[]
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface PlanInput {
  name: string
  description: string
  price: number
  recurring: PlanCycle
  bufferTime: number
  features: string[]
}
