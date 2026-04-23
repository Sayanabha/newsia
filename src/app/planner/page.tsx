'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import type { RiskProfile, AllocationResult } from '@/types/planner'

type PlanResult = {
  allocation:      AllocationResult
  recommendations: Record<string, string[]>
  marketSentiment: number
  input:           { monthlyBudget: number; riskProfile: string; marketSentiment: number }
}

const ASSET_META: Record<keyof AllocationResult, { label: string; color: string; emoji: string }> = {
  stocks:        { label: 'Direct Stocks',  color: '#00cc44', emoji: '📈' },
  mutualFunds:   { label: 'Mutual Funds',   color: '#4488ff', emoji: '🏦' },
  fixedDeposits: { label: 'Fixed Deposits', color: '#ffcc00', emoji: '🔒' },
  bonds:         { label: 'Bonds',          color: '#ff6600', emoji: '📄' },
  etfs:          { label: 'ETFs',           color: '#cc44ff', emoji: '⚡' },
  gold:          { label: 'Gold',           color: '#ffaa00', emoji: '🥇' },
}

function DonutChart({ allocation }: { allocation: AllocationResult }) {
  const keys   = Object.keys(allocation) as (keyof AllocationResult)[]
  const values = keys.map(k => allocation[k])
  const sum    = values.reduce((s, v) => s + v, 0)
  const r = 60, cx = 80, cy = 80, stroke = 24
  const circ = 2 * Math.PI * r
  let offset = 0
  const slices = keys.map((key, i) => {
    const pct  = values[i] / sum
    const dash = pct * circ
    const rot  = offset * 360
    offset    += pct
    return { key, dash, gap: circ - dash, rot, color: ASSET_META[key].color }
  })
  return (
    <svg viewBox="0 0 160 160" style={{ width: '140px', height: '140px', flexShrink: 0 }}>
      {slices.map(({ key, dash, gap, rot, color }) => (
        <circle key={key} cx={cx} cy={cy} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeDasharray={`${dash} ${gap}`}
          transform={`rotate(${rot - 90} ${cx} ${cy})`} />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#e8e8e8" fontSize="10" fontFamily="monospace">
        ₹{(sum / 1000).toFixed(1)}k
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#888" fontSize="8" fontFamily="monospace">
        /month
      </text>
    </svg>
  )
}

export default function PlannerPage() {
  const [budget,      setBudget]      = useState(13000)
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('moderate')
  const [result,      setResult]      = useState<PlanResult | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [message,     setMessage]     = useState('')

  async function calculate() {
    setLoading(true); setMessage('Calculating...')
    try {
      const res  = await fetch('/api/planner/allocate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyBudget: budget, riskProfile }),
      })
      const data = await res.json()
      setResult(data)
      setMessage(`Done · sentiment: ${data.marketSentiment.toFixed(3)}`)
    } catch { setMessage('Failed') }
    finally  { setLoading(false) }
  }

  const total = result ? Object.values(result.allocation).reduce((s, v) => s + v, 0) : 0

  const riskDesc = {
    conservative: 'Capital preservation · Low risk · FD & bond heavy',
    moderate:     'Balanced growth · Mix of equity & debt',
    aggressive:   'Maximum growth · Equity heavy · High risk',
  }

  return (
    <div style={{ padding: '16px', maxWidth: '100%', overflowX: 'hidden' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #1e1e1e', paddingBottom: '12px', marginBottom: '16px' }}>
        <h1 style={{ fontFamily: 'monospace', fontSize: 'clamp(14px, 4vw, 20px)', color: '#ff6600', margin: 0, fontWeight: 600, letterSpacing: '0.1em' }}>
          INVESTMENT PLANNER
        </h1>
        <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888', margin: '4px 0 0' }}>
          AI-adjusted · Based on live sentiment
        </p>
      </div>

      {/* Parameters card */}
      <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#ff6600', letterSpacing: '0.1em', margin: '0 0 16px' }}>
          PARAMETERS
        </p>

        {/* Budget — full width */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontFamily: 'monospace', fontSize: '11px', color: '#555', display: 'block', marginBottom: '8px' }}>
            MONTHLY BUDGET (₹)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontFamily: 'monospace', color: '#555' }}>₹</span>
            <input
              type="number" value={budget} min={1000} max={1000000} step={500}
              onChange={e => setBudget(Number(e.target.value))}
              style={{
                flex: 1, backgroundColor: '#2a2a2a', border: '1px solid #1e1e1e',
                borderRadius: '6px', padding: '8px 12px', fontFamily: 'monospace',
                fontSize: '14px', color: '#e8e8e8', outline: 'none',
              }}
            />
          </div>
          {/* Presets — scrollable row */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[5000, 10000, 13000, 25000, 50000].map(v => (
              <button key={v} onClick={() => setBudget(v)} style={{
                padding: '4px 12px', fontFamily: 'monospace', fontSize: '11px',
                cursor: 'pointer', borderRadius: '99px', flexShrink: 0,
                border: `1px solid ${budget === v ? '#ff6600' : '#1e1e1e'}`,
                backgroundColor: budget === v ? 'rgba(255,102,0,0.1)' : 'transparent',
                color: budget === v ? '#ff6600' : '#555',
              }}>
                {v >= 1000 ? `${v / 1000}k` : v}
              </button>
            ))}
          </div>
        </div>

        {/* Risk profile — full width stacked */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontFamily: 'monospace', fontSize: '11px', color: '#555', display: 'block', marginBottom: '8px' }}>
            RISK PROFILE
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(['conservative', 'moderate', 'aggressive'] as RiskProfile[]).map(p => (
              <button key={p} onClick={() => setRiskProfile(p)} style={{
                width: '100%', textAlign: 'left', padding: '10px 14px',
                fontFamily: 'monospace', fontSize: '12px', cursor: 'pointer', borderRadius: '6px',
                border: `1px solid ${riskProfile === p ? '#ff6600' : '#1e1e1e'}`,
                backgroundColor: riskProfile === p ? 'rgba(255,102,0,0.08)' : 'transparent',
                color: riskProfile === p ? '#ff6600' : '#888',
              }}>
                <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{p}</span>
                <span style={{ color: '#555', marginLeft: '8px', fontSize: '11px' }}>
                  {p === 'conservative' ? '· Low risk' : p === 'moderate' ? '· Balanced' : '· High risk'}
                </span>
              </button>
            ))}
          </div>
          <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555', margin: '8px 0 0', fontStyle: 'italic' }}>
            {riskDesc[riskProfile]}
          </p>
        </div>

        <button onClick={calculate} disabled={loading} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '12px', fontFamily: 'monospace', fontSize: '13px', cursor: 'pointer',
          border: '1px solid #ff6600', borderRadius: '8px',
          backgroundColor: loading ? 'rgba(255,102,0,0.1)' : 'transparent', color: '#ff6600',
        }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Calculating...' : 'Calculate Allocation'}
        </button>
      </div>

      {/* Status */}
      {message && (
        <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#555', marginBottom: '12px' }}>{message}</p>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Donut + bars */}
          <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#ff6600', letterSpacing: '0.1em', margin: '0 0 16px' }}>
              ALLOCATION BREAKDOWN
            </p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <DonutChart allocation={result.allocation} />
              <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(Object.keys(result.allocation) as (keyof AllocationResult)[]).map(key => {
                  const meta = ASSET_META[key]
                  const val  = result.allocation[key]
                  const pct  = total > 0 ? Math.round((val / total) * 100) : 0
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: '#e8e8e8' }}>{meta.emoji} {meta.label}</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span style={{ color: meta.color, fontWeight: 600 }}>₹{val.toLocaleString('en-IN')}</span>
                          <span style={{ color: '#555', width: '28px', textAlign: 'right' }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: '4px', backgroundColor: '#2a2a2a', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: meta.color, borderRadius: '2px' }} />
                      </div>
                    </div>
                  )
                })}
                <div style={{ paddingTop: '8px', borderTop: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '11px' }}>
                  <span style={{ color: '#555' }}>TOTAL</span>
                  <span style={{ color: '#ff6600', fontWeight: 600 }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment badge */}
          <div style={{
            padding: '10px 14px', borderRadius: '8px', marginBottom: '16px',
            border: `1px solid ${result.marketSentiment > 0.05 ? '#00cc44' : result.marketSentiment < -0.05 ? '#ff3333' : '#ffcc00'}`,
            fontFamily: 'monospace', fontSize: '11px',
            color: result.marketSentiment > 0.05 ? '#00cc44' : result.marketSentiment < -0.05 ? '#ff3333' : '#ffcc00',
          }}>
            {result.marketSentiment > 0.05
              ? `▲ Bullish market (${result.marketSentiment.toFixed(3)}) — shifted toward equities`
              : result.marketSentiment < -0.05
              ? `▼ Bearish market (${result.marketSentiment.toFixed(3)}) — shifted toward safe assets`
              : `● Neutral market (${result.marketSentiment.toFixed(3)}) — balanced allocation`}
          </div>

          {/* Recommendations — single col on mobile, 2 col on desktop */}
          <div style={{ marginBottom: '16px' }} className="recs-grid">
            <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#ff6600', letterSpacing: '0.1em', margin: '0 0 12px' }}>
              PRODUCT RECOMMENDATIONS · {result.input.riskProfile.toUpperCase()}
            </p>
            <div className="recs-inner" style={{ display: 'grid', gap: '10px' }}>
              {(Object.keys(result.recommendations) as (keyof AllocationResult)[]).map(key => {
                const meta  = ASSET_META[key]
                const recs  = result.recommendations[key] ?? []
                const amount = result.allocation[key]
                return (
                  <div key={key} style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: meta.color }}>
                        {meta.emoji} {meta.label}
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#555' }}>
                        ₹{amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {recs.map((rec, i) => (
                        <li key={i} style={{ fontFamily: 'monospace', fontSize: '10px', color: '#666', display: 'flex', gap: '6px' }}>
                          <span style={{ color: '#333' }}>·</span> {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '14px', marginBottom: '8px' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555', margin: 0, lineHeight: '1.6' }}>
              ⚠ <span style={{ color: '#ff6600' }}>Disclaimer:</span> AI-generated suggestions for educational purposes only. Not financial advice. Consult a SEBI-registered advisor before investing.
            </p>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
          .recs-inner { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 767px) {
          .recs-inner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}