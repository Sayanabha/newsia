export type RiskProfile = 'conservative' | 'moderate' | 'aggressive'

export interface AllocationResult {
  stocks: number        // ₹ amount
  mutualFunds: number
  fixedDeposits: number
  bonds: number
  etfs: number
  gold: number
}

export interface PlannerInput {
  monthlyBudget: number   // default 13000
  riskProfile: RiskProfile
  marketSentiment: number // -1 to 1, from AI analysis
}