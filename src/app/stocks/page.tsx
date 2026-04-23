'use client'

import { useState } from 'react'
import { BarChart2, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { NIFTY50_STOCKS } from '@/constants/nifty50-stocks'

type AggregatedStock = {
  symbol: string; overallSignal: 'buy' | 'watch' | 'avoid'
  confidence: number; buyCount: number; watchCount: number
  avoidCount: number; totalSignals: number; latestReason: string
  recentSignals: any[]
}

export default function StocksPage() {
  const [stocks,        setStocks]        = useState<AggregatedStock[]>([])
  const [loading,       setLoading]       = useState(false)
  const [generating,    setGenerating]    = useState(false)
  const [message,       setMessage]       = useState('')
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [filterSignal,  setFilterSignal]  = useState<string>('all')

  async function loadSignals() {
    setLoading(true)
    try {
      const res  = await fetch('/api/stocks/signals')
      const data = await res.json()
      setStocks(data.stocks ?? [])
      setMessage(`${data.total} stocks with signals`)
    } catch { setMessage('Failed to load') }
    finally  { setLoading(false) }
  }

  async function generateSignals() {
    setGenerating(true); setMessage('Generating signals...')
    try {
      const res  = await fetch('/api/stocks/signals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 30 }),
      })
      const data = await res.json()
      setMessage(data.message); await loadSignals()
    } catch { setMessage('Failed') }
    finally  { setGenerating(false) }
  }

  const sigColor = (s: string) =>
    s === 'buy' ? '#00cc44' : s === 'avoid' ? '#ff3333' : '#ffcc00'

  const SigIcon = ({ s }: { s: string }) =>
    s === 'buy'   ? <TrendingUp   size={13} /> :
    s === 'avoid' ? <TrendingDown size={13} /> : <Minus size={13} />

  const getInfo = (sym: string) => NIFTY50_STOCKS.find(s => s.symbol === sym)

  const counts = {
    buy:   stocks.filter(s => s.overallSignal === 'buy').length,
    watch: stocks.filter(s => s.overallSignal === 'watch').length,
    avoid: stocks.filter(s => s.overallSignal === 'avoid').length,
  }

  const filtered = filterSignal === 'all' ? stocks : stocks.filter(s => s.overallSignal === filterSignal)

  return (
    <div style={{ padding: '16px', maxWidth: '100%', overflowX: 'hidden' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #1e1e1e', paddingBottom: '12px', marginBottom: '16px' }}>
        <h1 style={{ fontFamily: 'monospace', fontSize: 'clamp(14px, 4vw, 20px)', color: '#ff6600', margin: 0, fontWeight: 600, letterSpacing: '0.1em' }}>
          STOCK SIGNALS
        </h1>
        <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888', margin: '4px 0 0' }}>
          NIFTY 50 · Not financial advice
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={loadSignals} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', fontFamily: 'monospace', fontSize: '12px',
          border: '1px solid #1e1e1e', borderRadius: '6px',
          backgroundColor: 'transparent', color: '#888', cursor: 'pointer',
        }}>
          <BarChart2 size={12} /> {loading ? 'Loading...' : 'Load Signals'}
        </button>
        <button onClick={generateSignals} disabled={generating} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', fontFamily: 'monospace', fontSize: '12px',
          border: '1px solid #ff6600', borderRadius: '6px',
          backgroundColor: 'transparent', color: '#ff6600', cursor: 'pointer',
        }}>
          <Zap size={12} /> {generating ? 'Generating...' : 'Generate Signals'}
        </button>
      </div>

      {/* Summary — 3 cols always */}
      {stocks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {[
            { label: 'BUY',   count: counts.buy,   color: '#00cc44' },
            { label: 'WATCH', count: counts.watch, color: '#ffcc00' },
            { label: 'AVOID', count: counts.avoid, color: '#ff3333' },
          ].map(({ label, count, color }) => (
            <div key={label} style={{
              backgroundColor: '#111', border: `1px solid ${color}33`,
              borderRadius: '8px', padding: '12px', textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'monospace', fontSize: '24px', fontWeight: 600, color, margin: 0 }}>{count}</p>
              <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555', margin: '4px 0 0' }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs — scrollable */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
        {['all', 'buy', 'watch', 'avoid'].map(f => (
          <button key={f} onClick={() => setFilterSignal(f)} style={{
            padding: '6px 12px', fontFamily: 'monospace', fontSize: '11px',
            cursor: 'pointer', borderRadius: '99px', flexShrink: 0,
            border: `1px solid ${filterSignal === f ? sigColor(f === 'all' ? 'watch' : f) : '#1e1e1e'}`,
            backgroundColor: filterSignal === f ? `${sigColor(f === 'all' ? 'watch' : f)}15` : 'transparent',
            color: filterSignal === f ? sigColor(f === 'all' ? 'watch' : f) : '#555',
          }}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Status */}
      {message && (
        <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#555', marginBottom: '12px' }}>
          {message}
        </p>
      )}

      {/* Empty */}
      {stocks.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 16px' }}>
          <BarChart2 size={28} color="#333" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#555' }}>
            No signals yet. Run AI Analysis first, then Generate Signals.
          </p>
        </div>
      )}

      {/* Stock cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map(stock => {
          const info     = getInfo(stock.symbol)
          const color    = sigColor(stock.overallSignal)
          const isOpen   = selectedStock === stock.symbol
          const total    = stock.totalSignals

          return (
            <div
              key={stock.symbol}
              onClick={() => setSelectedStock(isOpen ? null : stock.symbol)}
              style={{
                backgroundColor: '#111',
                border: `1px solid ${isOpen ? color : '#1e1e1e'}`,
                borderRadius: '8px', cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ padding: '12px' }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    {/* Signal badge */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '4px 8px', borderRadius: '6px',
                      border: `1px solid ${color}`, color, flexShrink: 0,
                    }}>
                      <SigIcon s={stock.overallSignal} />
                      <span style={{ fontFamily: 'monospace', fontSize: '10px', fontWeight: 600 }}>
                        {stock.overallSignal.toUpperCase()}
                      </span>
                    </div>
                    {/* Symbol + name */}
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#e8e8e8', fontWeight: 600 }}>
                        {stock.symbol}
                      </span>
                      {info && (
                        <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {info.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: confidence */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 600, color, margin: 0 }}>
                      {Math.round(stock.confidence * 100)}%
                    </p>
                    <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555', margin: 0 }}>
                      {info?.sector ?? ''}
                    </p>
                  </div>
                </div>

                {/* Signal bar */}
                {total > 0 && (
                  <div style={{ display: 'flex', height: '3px', borderRadius: '2px', overflow: 'hidden', marginTop: '10px', gap: '1px' }}>
                    {stock.buyCount   > 0 && <div style={{ backgroundColor: '#00cc44', width: `${(stock.buyCount   / total) * 100}%` }} />}
                    {stock.watchCount > 0 && <div style={{ backgroundColor: '#ffcc00', width: `${(stock.watchCount / total) * 100}%` }} />}
                    {stock.avoidCount > 0 && <div style={{ backgroundColor: '#ff3333', width: `${(stock.avoidCount / total) * 100}%` }} />}
                  </div>
                )}
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop: '1px solid #1e1e1e', padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', fontFamily: 'monospace', fontSize: '11px', marginBottom: '10px' }}>
                    <span style={{ color: '#00cc44' }}>▲ {stock.buyCount} buy</span>
                    <span style={{ color: '#ffcc00' }}>● {stock.watchCount} watch</span>
                    <span style={{ color: '#ff3333' }}>▼ {stock.avoidCount} avoid</span>
                  </div>
                  {stock.recentSignals.slice(0, 2).map((sig: any, i: number) => (
                    <div key={i} style={{ backgroundColor: '#1a1a1a', borderRadius: '6px', padding: '10px', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '10px', color: sigColor(sig.signal), fontWeight: 600 }}>
                          {sig.signal.toUpperCase()}
                        </span>
                        <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555' }}>
                          {Math.round(sig.confidence * 100)}% conf.
                        </span>
                      </div>
                      {sig.news_articles && (
                        <a href={sig.news_articles.url} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ fontFamily: 'monospace', fontSize: '10px', color: '#888', textDecoration: 'none', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {sig.news_articles.title}
                        </a>
                      )}
                    </div>
                  ))}
                  <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#444', margin: 0, fontStyle: 'italic' }}>
                    ⚠ Not guaranteed predictions
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}