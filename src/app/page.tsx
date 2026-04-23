'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Newspaper, Brain, BarChart2, RefreshCw } from 'lucide-react'
import { SentimentChart } from '@/components/dashboard/SentimentChart'
import { SectorHeatmap }  from '@/components/dashboard/SectorHeatmap'
import { TopMovers }      from '@/components/dashboard/TopMovers'

type Snapshot = {
  captured_at: string
  avg_score:   number
  positive:    number
  negative:    number
  neutral:     number
  total:       number
}

type StockSignal = {
  symbol:        string
  overallSignal: 'buy' | 'watch' | 'avoid'
  confidence:    number
  totalSignals:  number
  latestReason:  string
}

export default function DashboardPage() {
  const [snapshots,  setSnapshots]  = useState<Snapshot[]>([])
  const [stocks,     setStocks]     = useState<StockSignal[]>([])
  const [articles,   setArticles]   = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  async function loadAll() {
    setLoading(true)
    try {
      const [newsRes, signalsRes, snapshotsRes] = await Promise.all([
        fetch('/api/news/list?limit=100'),
        fetch('/api/stocks/signals'),
        fetch('/api/sentiment/snapshot'),
      ])
      const [newsData, signalsData, snapshotsData] = await Promise.all([
        newsRes.json(),
        signalsRes.json(),
        snapshotsRes.json(),
      ])
      setStocks(signalsData.stocks      ?? [])
      setSnapshots(snapshotsData.snapshots ?? [])
      setArticles(newsData.articles     ?? [])
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const analyzed     = articles.filter(a => a.sentiment !== null)
  const avgSentiment = analyzed.length
    ? analyzed.reduce((s: number, a: any) => s + (a.sentiment_score ?? 0), 0) / analyzed.length
    : 0
  const today     = new Date().toDateString()
  const todayProc = analyzed.filter((a: any) =>
    a.processed_at && new Date(a.processed_at).toDateString() === today
  ).length

  const moodInfo =
    avgSentiment >  0.1 ? { label: 'BULLISH', color: '#00cc44', Icon: TrendingUp   } :
    avgSentiment < -0.1 ? { label: 'BEARISH', color: '#ff3333', Icon: TrendingDown } :
                          { label: 'NEUTRAL',  color: '#ffcc00', Icon: Minus        }

  const statCards = [
    { label: 'FETCHED',  value: articles.length,                                           color: '#e8e8e8', icon: <Newspaper    size={11} /> },
    { label: 'ANALYZED', value: todayProc,                                                 color: '#4488ff', icon: <Brain        size={11} /> },
    { label: 'IMPACT',   value: articles.filter((a:any) => a.importance === 'high').length,color: '#ff6600', icon: <BarChart2    size={11} /> },
    { label: 'BUY',      value: stocks.filter(s => s.overallSignal === 'buy').length,      color: '#00cc44', icon: <TrendingUp   size={11} /> },
    { label: 'AVOID',    value: stocks.filter(s => s.overallSignal === 'avoid').length,    color: '#ff3333', icon: <TrendingDown size={11} /> },
  ]

  return (
    <div style={{ padding: '16px', maxWidth: '100%', overflowX: 'hidden' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #1e1e1e', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <h1 style={{ fontFamily: 'monospace', fontSize: 'clamp(14px, 4vw, 20px)', color: '#ff6600', margin: 0, fontWeight: 600, letterSpacing: '0.1em' }}>
              MARKET DASHBOARD
            </h1>
            <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888', margin: '4px 0 0' }}>
              NIFTY 50 · SENSEX · AI-powered
            </p>
          </div>
          <button onClick={loadAll} disabled={loading} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '6px 10px', fontFamily: 'monospace', fontSize: '11px',
            border: '1px solid #1e1e1e', borderRadius: '6px',
            backgroundColor: 'transparent', color: '#888', cursor: 'pointer', flexShrink: 0,
          }}>
            <RefreshCw size={11} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {lastUpdate ? lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Refresh'}
          </button>
        </div>

        {/* Mood */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
          <moodInfo.Icon size={14} color={moodInfo.color} />
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: moodInfo.color }}>
            {moodInfo.label}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#555' }}>
            · score {avgSentiment >= 0 ? '+' : ''}{avgSentiment.toFixed(3)}
          </span>
        </div>
      </div>

      {/* Stat cards — 2 rows of 3 then 2 on mobile, single row on desktop */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        marginBottom: '16px',
      }}
        className="stat-grid"
      >
        {statCards.map(({ label, value, color, icon }) => (
          <div key={label} style={{
            backgroundColor: '#111',
            border: '1px solid #1e1e1e',
            borderRadius: '8px',
            padding: '10px 8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#555', marginBottom: '6px' }}>
              {icon}
              <span style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.05em' }}>{label}</span>
            </div>
            <p style={{ fontFamily: 'monospace', fontSize: 'clamp(18px, 4vw, 26px)', fontWeight: 600, color, margin: 0 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Sentiment chart */}
      <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#ff6600', letterSpacing: '0.1em', margin: '0 0 4px' }}>
          SENTIMENT TIMELINE
        </p>
        <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555', margin: '0 0 12px' }}>
          {snapshots.length} data points · hourly
        </p>
        <SentimentChart snapshots={snapshots} />
      </div>

      {/* Heatmap + Movers — stack on mobile, side by side on desktop */}
      <div className="two-col-grid" style={{ display: 'grid', gap: '16px', marginBottom: '16px' }}>
        <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#ff6600', letterSpacing: '0.1em', margin: '0 0 4px' }}>
            SECTOR HEATMAP
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555', margin: '0 0 12px' }}>
            Signal strength by sector
          </p>
          <SectorHeatmap stocks={stocks} />
        </div>

        <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#ff6600', letterSpacing: '0.1em', margin: '0 0 4px' }}>
            TOP MOVERS
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555', margin: '0 0 12px' }}>
            Highest-confidence signals
          </p>
          <TopMovers stocks={stocks} />
        </div>
      </div>

      {/* Workflow — scrollable row on mobile */}
      <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#ff6600', letterSpacing: '0.1em', margin: '0 0 16px' }}>
          PIPELINE WORKFLOW
        </p>
        <div style={{ display: 'flex', overflowX: 'auto', gap: '0', paddingBottom: '4px' }}>
          {[
            { step: '01', label: 'Fetch News',     page: '/news',    desc: 'Pull from APIs'   },
            { step: '02', label: 'AI Analysis',    page: '/news',    desc: 'Gemini analyzes'  },
            { step: '03', label: 'Stock Signals',  page: '/stocks',  desc: 'Map to NIFTY 50'  },
            { step: '04', label: 'Plan ₹',         page: '/planner', desc: 'Allocate budget'  },
          ].map(({ step, label, page, desc }, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <a href={page} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '88px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: '1px solid #ff6600', color: '#ff6600',
                  fontFamily: 'monospace', fontSize: '11px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '6px',
                }}>
                  {step}
                </div>
                <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#e8e8e8', margin: 0, textAlign: 'center' }}>{label}</p>
                <p style={{ fontFamily: 'monospace', fontSize: '9px', color: '#555', margin: '2px 0 0', textAlign: 'center' }}>{desc}</p>
              </a>
              {i < 3 && <div style={{ width: '16px', height: '1px', borderTop: '1px dashed #1e1e1e', flexShrink: 0, marginBottom: '20px' }} />}
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#444', marginBottom: '8px' }}>
        ⚠ AI-generated insights only. Not financial advice.
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Mobile: 3+2 grid for stats, single col for two-col */
        @media (max-width: 767px) {
          .stat-grid    { grid-template-columns: repeat(3, 1fr) !important; }
          .two-col-grid { grid-template-columns: 1fr !important; }
        }

        /* Desktop: 5 col stats, 2 col sections */
        @media (min-width: 768px) {
          .stat-grid    { grid-template-columns: repeat(5, 1fr) !important; }
          .two-col-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}