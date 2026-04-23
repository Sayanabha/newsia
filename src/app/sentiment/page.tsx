'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type Article = {
  id: string; title: string; url: string
  sentiment: string | null; sentiment_score: number | null
  importance: string | null; category: string | null
  impact_score: number | null; source_name: string | null
  published_at: string | null
}

export default function SentimentPage() {
  const [articles,  setArticles]  = useState<Article[]>([])
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all')

  useEffect(() => { loadArticles() }, [])

  async function loadArticles() {
    setLoading(true)
    try {
      const res  = await fetch('/api/news/list?limit=100')
      const data = await res.json()
      setArticles((data.articles ?? []).filter((a: Article) => a.sentiment !== null))
    } finally { setLoading(false) }
  }

  const positive  = articles.filter(a => a.sentiment === 'positive')
  const negative  = articles.filter(a => a.sentiment === 'negative')
  const neutral   = articles.filter(a => a.sentiment === 'neutral')
  const avgScore  = articles.length
    ? articles.reduce((s, a) => s + (a.sentiment_score ?? 0), 0) / articles.length : 0
  const moodPct   = Math.round(((avgScore + 1) / 2) * 100)

  const filtered =
    activeTab === 'positive' ? positive  :
    activeTab === 'negative' ? negative  :
    activeTab === 'neutral'  ? neutral   : articles

  const byCategory = ['economy', 'company', 'global', 'policy'].map(cat => ({
    cat,
    count: articles.filter(a => a.category === cat).length,
    pos:   articles.filter(a => a.category === cat && a.sentiment === 'positive').length,
    neg:   articles.filter(a => a.category === cat && a.sentiment === 'negative').length,
  }))

  const sentColor = (s: string | null) =>
    s === 'positive' ? '#00cc44' : s === 'negative' ? '#ff3333' : '#ffcc00'

  const MoodIcon = () =>
    avgScore > 0.1  ? <TrendingUp   size={18} color="#00cc44" /> :
    avgScore < -0.1 ? <TrendingDown size={18} color="#ff3333" /> :
                      <Minus        size={18} color="#ffcc00" />

  const tabs = [
    { key: 'all',      label: 'ALL',      count: articles.length },
    { key: 'positive', label: 'POSITIVE', count: positive.length },
    { key: 'negative', label: 'NEGATIVE', count: negative.length },
    { key: 'neutral',  label: 'NEUTRAL',  count: neutral.length  },
  ] as const

  return (
    <div style={{ padding: '16px', maxWidth: '100%', overflowX: 'hidden' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #1e1e1e', paddingBottom: '12px', marginBottom: '16px' }}>
        <h1 style={{ fontFamily: 'monospace', fontSize: 'clamp(14px, 4vw, 20px)', color: '#ff6600', margin: 0, fontWeight: 600, letterSpacing: '0.1em' }}>
          MARKET SENTIMENT
        </h1>
        <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888', margin: '4px 0 0' }}>
          AI-analyzed · {articles.length} articles
        </p>
      </div>

      {loading ? (
        <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>Loading...</p>
      ) : (
        <>
          {/* Mood meter card */}
          <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MoodIcon />
                <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#e8e8e8' }}>Market Mood Index</span>
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: '24px', fontWeight: 600, color: '#ff6600' }}>{moodPct}</span>
            </div>

            {/* Gradient bar */}
            <div style={{ position: 'relative', height: '10px', borderRadius: '99px', overflow: 'hidden', background: '#2a2a2a', marginBottom: '6px' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #ff3333, #ffcc00, #00cc44)', borderRadius: '99px' }} />
              <div style={{ position: 'absolute', top: 0, bottom: 0, width: '2px', backgroundColor: 'white', left: `${moodPct}%`, transform: 'translateX(-50%)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '10px', color: '#555', marginBottom: '16px' }}>
              <span>BEARISH</span><span>NEUTRAL</span><span>BULLISH</span>
            </div>

            {/* Counts — 3 cols always */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              {[
                { label: 'POSITIVE', count: positive.length, color: '#00cc44', pct: articles.length ? Math.round(positive.length / articles.length * 100) : 0 },
                { label: 'NEUTRAL',  count: neutral.length,  color: '#ffcc00', pct: articles.length ? Math.round(neutral.length  / articles.length * 100) : 0 },
                { label: 'NEGATIVE', count: negative.length, color: '#ff3333', pct: articles.length ? Math.round(negative.length / articles.length * 100) : 0 },
              ].map(({ label, count, color, pct }) => (
                <div key={label}>
                  <p style={{ fontFamily: 'monospace', fontSize: '22px', fontWeight: 600, color, margin: 0 }}>{count}</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#555', margin: '2px 0 0' }}>{label}</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '10px', color, margin: '2px 0 0' }}>{pct}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div style={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#ff6600', letterSpacing: '0.1em', margin: '0 0 12px' }}>
              SENTIMENT BY CATEGORY
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {byCategory.map(({ cat, count, pos, neg }) => {
                if (count === 0) return null
                const posW = (pos / count) * 100
                const negW = (neg / count) * 100
                const neuW = 100 - posW - negW
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '11px', marginBottom: '5px' }}>
                      <span style={{ color: '#e8e8e8', textTransform: 'uppercase' }}>{cat}</span>
                      <span style={{ color: '#555' }}>{count} articles</span>
                    </div>
                    <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', gap: '1px' }}>
                      <div style={{ backgroundColor: '#00cc44', width: `${posW}%` }} />
                      <div style={{ backgroundColor: '#ffcc00', width: `${neuW}%` }} />
                      <div style={{ backgroundColor: '#ff3333', width: `${negW}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tabs — scrollable row */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '6px 12px', fontFamily: 'monospace', fontSize: '11px',
                  cursor: 'pointer', borderRadius: '99px', flexShrink: 0,
                  border: `1px solid ${activeTab === key ? '#ff6600' : '#1e1e1e'}`,
                  backgroundColor: activeTab === key ? 'rgba(255,102,0,0.1)' : 'transparent',
                  color: activeTab === key ? '#ff6600' : '#555',
                  whiteSpace: 'nowrap',
                }}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Article list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.slice(0, 30).map(a => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '12px', backgroundColor: '#111', border: '1px solid #1e1e1e',
                  borderRadius: '8px', padding: '10px 12px', textDecoration: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span style={{
                    fontFamily: 'monospace', fontSize: '11px', fontWeight: 600,
                    color: sentColor(a.sentiment), flexShrink: 0,
                  }}>
                    {a.sentiment_score != null ? (a.sentiment_score >= 0 ? '+' : '') + a.sentiment_score.toFixed(2) : '—'}
                  </span>
                  <span style={{
                    fontFamily: 'monospace', fontSize: '11px', color: '#e8e8e8',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {a.title}
                  </span>
                </div>
                {a.category && (
                  <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#4488ff', flexShrink: 0 }}>
                    {a.category}
                  </span>
                )}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}