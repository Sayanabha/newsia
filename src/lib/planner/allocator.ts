import type { PlannerInput, AllocationResult } from '@/types/planner'

// Base allocation % per risk profile
const BASE_ALLOCATIONS = {
  conservative: {
    stocks:       0.10,
    mutualFunds:  0.25,
    fixedDeposits:0.35,
    bonds:        0.20,
    etfs:         0.05,
    gold:         0.05,
  },
  moderate: {
    stocks:       0.25,
    mutualFunds:  0.30,
    fixedDeposits:0.20,
    bonds:        0.10,
    etfs:         0.10,
    gold:         0.05,
  },
  aggressive: {
    stocks:       0.45,
    mutualFunds:  0.25,
    fixedDeposits:0.05,
    bonds:        0.05,
    etfs:         0.15,
    gold:         0.05,
  },
}

// Sentiment adjusts allocation dynamically
// Bullish market → shift more toward stocks/ETFs
// Bearish market → shift more toward FD/bonds/gold
function applyMarketSentiment(
  base: typeof BASE_ALLOCATIONS.moderate,
  sentiment: number  // -1 to 1
): typeof BASE_ALLOCATIONS.moderate {
  const adj = Math.max(-0.3, Math.min(0.3, sentiment)) // clamp

  return {
    stocks:        Math.max(0.05, base.stocks        + adj * 0.10),
    mutualFunds:   Math.max(0.05, base.mutualFunds   + adj * 0.05),
    fixedDeposits: Math.max(0.05, base.fixedDeposits - adj * 0.08),
    bonds:         Math.max(0.02, base.bonds         - adj * 0.05),
    etfs:          Math.max(0.02, base.etfs          + adj * 0.05),
    gold:          Math.max(0.02, base.gold          - adj * 0.02),
  }
}

function normalize(alloc: Record<string, number>): Record<string, number> {
  const total = Object.values(alloc).reduce((s, v) => s + v, 0)
  const out: Record<string, number> = {}
  for (const key in alloc) {
    out[key] = alloc[key] / total
  }
  return out
}

export function calculateAllocation(input: PlannerInput): AllocationResult {
  const base    = BASE_ALLOCATIONS[input.riskProfile]
  const adjusted = applyMarketSentiment(base, input.marketSentiment)
  const normalized = normalize(adjusted)
  const budget  = input.monthlyBudget

  return {
    stocks:        Math.round(normalized.stocks        * budget),
    mutualFunds:   Math.round(normalized.mutualFunds   * budget),
    fixedDeposits: Math.round(normalized.fixedDeposits * budget),
    bonds:         Math.round(normalized.bonds         * budget),
    etfs:          Math.round(normalized.etfs          * budget),
    gold:          Math.round(normalized.gold          * budget),
  }
}

// Specific product recommendations per category
export function getRecommendations(
  riskProfile: string,
  allocation: AllocationResult
) {
  const recs = {
    conservative: {
      stocks:        ['TCS', 'HDFC Bank', 'Infosys — blue-chip, low volatility'],
      mutualFunds:   ['SBI Bluechip Fund', 'HDFC Balanced Advantage Fund'],
      fixedDeposits: ['SBI FD (6.8% p.a.)', 'HDFC Bank FD (7.0% p.a.)'],
      bonds:         ['RBI Savings Bonds (8.05%)', 'SGB (Sovereign Gold Bonds)'],
      etfs:          ['Nifty 50 ETF (UTI)', 'BHARAT Bond ETF'],
      gold:          ['Digital Gold (PhonePe/GPay)', 'SGB via Zerodha'],
    },
    moderate: {
      stocks:        ['Reliance', 'ICICI Bank', 'L&T — growth + stability mix'],
      mutualFunds:   ['Mirae Asset Large Cap', 'Axis Midcap Fund'],
      fixedDeposits: ['Post Office TD (7.5%)', 'Bajaj Finance FD (8.05%)'],
      bonds:         ['Corporate Bonds via Zerodha', 'NHAI Bonds'],
      etfs:          ['Nifty Next 50 ETF', 'Motilal Oswal Nasdaq 100 ETF'],
      gold:          ['SGB — best tax-efficient option', 'Gold ETF via Groww'],
    },
    aggressive: {
      stocks:        ['Tata Motors', 'Adani Enterprises', 'HDFC Life — high growth'],
      mutualFunds:   ['Quant Small Cap Fund', 'Nippon India Small Cap'],
      fixedDeposits: ['Minimum — only for emergency buffer'],
      bonds:         ['Skip or minimal allocation'],
      etfs:          ['Nifty Midcap 150 ETF', 'Motilal Oswal Nasdaq 100 ETF'],
      gold:          ['5% hedge via SGB'],
    },
  }

  return recs[riskProfile as keyof typeof recs] ?? recs.moderate
}