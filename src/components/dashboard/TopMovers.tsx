'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { NIFTY50_STOCKS }           from '@/constants/nifty50-stocks'

type StockSignal = {
  symbol:        string
  overallSignal: 'buy' | 'watch' | 'avoid'
  confidence:    number
  totalSignals:  number
  latestReason:  string
}

type Props = { stocks: StockSignal[] }

export function TopMovers({ stocks }: Props) {
  const topBuys  = stocks
    .filter(s => s.overallSignal === 'buy')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 4)

  const topAvoid = stocks
    .filter(s => s.overallSignal === 'avoid')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 4)

  const getInfo = (sym: string) => NIFTY50_STOCKS.find(s => s.symbol === sym)

  const Row = ({ stock, type }: { stock: StockSignal; type: 'buy' | 'avoid' }) => {
    const info  = getInfo(stock.symbol)
    const color = type === 'buy' ? 'text-bloomberg-green' : 'text-bloomberg-red'
    const Icon  = type === 'buy' ? TrendingUp             : TrendingDown

    return (
      <div className="flex items-center justify-between py-2 border-b border-bloomberg-border last:border-0">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={12} className={color} />
          <div className="min-w-0">
            <span className={`font-mono text-xs font-semibold ${color}`}>
              {stock.symbol}
            </span>
            {info && (
              <span className="font-mono text-xs text-bloomberg-dim ml-2 truncate">
                {info.sector}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className={`font-mono text-xs font-semibold ${color}`}>
              {Math.round(stock.confidence * 100)}%
            </p>
            <p className="font-mono text-xs text-bloomberg-dim">conf.</p>
          </div>
        </div>
      </div>
    )
  }

  if (stocks.length === 0) {
    return (
      <div className="text-center py-8 text-bloomberg-dim font-mono text-xs">
        Generate signals on the Stocks page first
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <p className="font-mono text-xs text-bloomberg-green tracking-wider mb-3">
          ▲ TOP BUY SIGNALS
        </p>
        {topBuys.length > 0
          ? topBuys.map(s => <Row key={s.symbol} stock={s} type="buy" />)
          : <p className="font-mono text-xs text-bloomberg-dim">No buy signals</p>}
      </div>
      <div>
        <p className="font-mono text-xs text-bloomberg-red tracking-wider mb-3">
          ▼ TOP AVOID SIGNALS
        </p>
        {topAvoid.length > 0
          ? topAvoid.map(s => <Row key={s.symbol} stock={s} type="avoid" />)
          : <p className="font-mono text-xs text-bloomberg-dim">No avoid signals</p>}
      </div>
    </div>
  )
}