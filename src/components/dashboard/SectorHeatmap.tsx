'use client'

import { NIFTY50_STOCKS } from '@/constants/nifty50-stocks'

type StockSignal = {
  symbol:        string
  overallSignal: 'buy' | 'watch' | 'avoid'
  confidence:    number
  totalSignals:  number
}

type Props = { stocks: StockSignal[] }

export function SectorHeatmap({ stocks }: Props) {
  const sectors = [...new Set(NIFTY50_STOCKS.map(s => s.sector))]

  const getSectorScore = (sector: string) => {
    const sectorStocks = NIFTY50_STOCKS
      .filter(s => s.sector === sector)
      .map(s => stocks.find(sig => sig.symbol === s.symbol))
      .filter(Boolean) as StockSignal[]

    if (sectorStocks.length === 0) return { score: 0, label: 'NO DATA', count: 0 }

    const score = sectorStocks.reduce((sum, s) => {
      const val = s.overallSignal === 'buy' ? 1 : s.overallSignal === 'avoid' ? -1 : 0
      return sum + val * s.confidence
    }, 0) / sectorStocks.length

    const label =
      score >  0.3 ? 'BULLISH' :
      score < -0.3 ? 'BEARISH' : 'NEUTRAL'

    return { score, label, count: sectorStocks.length }
  }

  const cellColor = (score: number) => {
    if (score >  0.5) return { bg: 'bg-bloomberg-green',  opacity: 'opacity-90' }
    if (score >  0.2) return { bg: 'bg-bloomberg-green',  opacity: 'opacity-50' }
    if (score < -0.5) return { bg: 'bg-bloomberg-red',    opacity: 'opacity-90' }
    if (score < -0.2) return { bg: 'bg-bloomberg-red',    opacity: 'opacity-50' }
    return               { bg: 'bg-bloomberg-yellow', opacity: 'opacity-30' }
  }

  const textColor = (score: number) =>
    score >  0.2 ? 'text-bloomberg-green'  :
    score < -0.2 ? 'text-bloomberg-red'    : 'text-bloomberg-yellow'

  if (stocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-bloomberg-dim font-mono text-xs">
        No signals yet · Generate signals on the Stocks page
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {sectors.map(sector => {
        const { score, label, count } = getSectorScore(sector)
        const { bg, opacity }         = cellColor(score)

        return (
          <div
            key={sector}
            className={`relative rounded border border-bloomberg-border p-3 overflow-hidden cursor-default`}
          >
            {/* Background heat fill */}
            <div className={`absolute inset-0 ${bg} ${opacity} rounded`} />

            {/* Content */}
            <div className="relative z-10">
              <p className="font-mono text-xs text-bloomberg-text font-semibold truncate">
                {sector}
              </p>
              <p className={`font-mono text-xs font-semibold mt-1 ${textColor(score)}`}>
                {label}
              </p>
              <p className="font-mono text-xs text-bloomberg-dim mt-0.5">
                {count} signal{count !== 1 ? 's' : ''}
              </p>
              {count > 0 && (
                <p className="font-mono text-xs text-bloomberg-dim">
                  {score >= 0 ? '+' : ''}{score.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}