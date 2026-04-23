'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Brain, LayoutGrid, List, SlidersHorizontal, X, ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { NewsArticle } from '@/types/news'
import { formatDistanceToNow } from 'date-fns'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80'

const CATEGORY_IMAGES: Record<string, string> = {
  economy: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
  company: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80',
  global:  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&q=80',
  policy:  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&q=80',
}

function NewsCard({ article, view }: { article: NewsArticle; view: 'grid' | 'list' }) {
  const [imgSrc, setImgSrc] = useState(
    article.image_url || CATEGORY_IMAGES[article.category ?? ''] || FALLBACK_IMAGE
  )

  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : null

  const sentimentColor =
    article.sentiment === 'positive' ? '#00cc44' :
    article.sentiment === 'negative' ? '#ff3333' : '#ffcc00'

  const SentIcon =
    article.sentiment === 'positive' ? TrendingUp :
    article.sentiment === 'negative' ? TrendingDown : Minus

  const importanceColor =
    article.importance === 'high'   ? '#ff6600' :
    article.importance === 'medium' ? '#ffcc00' : '#888888'

  if (view === 'list') {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          gap: '12px',
          backgroundColor: '#111111',
          border: '1px solid #1e1e1e',
          borderRadius: '8px',
          padding: '12px',
          textDecoration: 'none',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#ff6600')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}
      >
        {/* Thumbnail */}
        <div style={{
          width: '88px',
          height: '88px',
          flexShrink: 0,
          borderRadius: '6px',
          overflow: 'hidden',
          backgroundColor: '#2a2a2a',
        }}>
          <img
            src={imgSrc}
            alt=""
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <p style={{
            fontFamily: 'monospace', fontSize: '12px', color: '#e8e8e8',
            margin: 0, display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5',
          }}>
            {article.title}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {article.importance && (
              <span style={{ fontFamily: 'monospace', fontSize: '10px', color: importanceColor }}>
                ● {article.importance.toUpperCase()}
              </span>
            )}
            {article.sentiment && (
              <span style={{ fontFamily: 'monospace', fontSize: '10px', color: sentimentColor, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <SentIcon size={9} /> {article.sentiment}
              </span>
            )}
            {article.source_name && (
              <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#888' }}>
                {article.source_name}
              </span>
            )}
            {timeAgo && (
              <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#888', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={9} /> {timeAgo}
              </span>
            )}
          </div>
        </div>
      </a>
    )
  }

  // ── Grid card ──
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#111111',
        border: '1px solid #1e1e1e',
        borderRadius: '8px',
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'border-color 0.2s, transform 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#ff6600'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#1e1e1e'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* ── Image — fixed height, never grows ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '180px',
        flexShrink: 0,
        backgroundColor: '#2a2a2a',
        overflow: 'hidden',
      }}>
        <img
          src={imgSrc}
          alt=""
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Dark gradient over image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)',
        }} />

        {/* Top badges */}
        <div style={{
          position: 'absolute', top: '8px', left: '8px', right: '8px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {article.importance && (
            <span style={{
              fontFamily: 'monospace', fontSize: '10px',
              color: importanceColor, border: `1px solid ${importanceColor}`,
              borderRadius: '99px', padding: '2px 8px',
              backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            }}>
              {article.importance.toUpperCase()}
            </span>
          )}
          {article.impact_score != null && (
            <span style={{
              fontFamily: 'monospace', fontSize: '10px', color: '#ff6600',
              border: '1px solid rgba(255,102,0,0.5)', borderRadius: '99px',
              padding: '2px 8px', backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}>
              {article.impact_score} pts
            </span>
          )}
        </div>

        {/* Source bottom-left */}
        <div style={{ position: 'absolute', bottom: '8px', left: '8px' }}>
          <span style={{
            fontFamily: 'monospace', fontSize: '10px', color: '#aaa',
            backgroundColor: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px',
          }}>
            {article.source_name ?? 'Unknown'}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{
          fontFamily: 'monospace', fontSize: '12px', color: '#e8e8e8',
          margin: 0, lineHeight: '1.6',
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.title}
        </p>

        {/* Impact bar */}
        {article.impact_score != null && (
          <div style={{ height: '2px', backgroundColor: '#2a2a2a', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              width: `${article.impact_score}%`,
              backgroundColor:
                article.impact_score > 70 ? '#ff3333' :
                article.impact_score > 40 ? '#ffcc00' : '#00cc44',
            }} />
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 'auto', paddingTop: '8px',
          borderTop: '1px solid #1e1e1e',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {article.sentiment && (
              <span style={{ fontFamily: 'monospace', fontSize: '10px', color: sentimentColor, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <SentIcon size={10} /> {article.sentiment}
              </span>
            )}
            {article.category && (
              <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#4488ff' }}>
                {article.category}
              </span>
            )}
          </div>
          {timeAgo && (
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#888', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={9} /> {timeAgo}
            </span>
          )}
        </div>
      </div>
    </a>
  )
}

// ── Filters ──────────────────────────────────────────────────────────────────
const FILTER_OPTIONS = {
  importance: ['all', 'high', 'medium', 'low'],
  sentiment:  ['all', 'positive', 'negative', 'neutral'],
  category:   ['all', 'economy', 'company', 'global', 'policy'],
}

export default function NewsPage() {
  const [articles,  setArticles]  = useState<NewsArticle[]>([])
  const [loading,   setLoading]   = useState(false)
  const [fetching,  setFetching]  = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [message,   setMessage]   = useState('')
  const [view,      setView]      = useState<'grid' | 'list'>('grid')
  const [showFilter,setShowFilter]= useState(false)
  const [filters,   setFilters]   = useState({ importance: 'all', sentiment: 'all', category: 'all' })

  useEffect(() => { loadArticles() }, [])

  async function loadArticles(f = filters) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '60' })
      if (f.importance !== 'all') params.set('importance', f.importance)
      if (f.sentiment  !== 'all') params.set('sentiment',  f.sentiment)
      if (f.category   !== 'all') params.set('category',   f.category)
      const res  = await fetch(`/api/news/list?${params}`)
      const data = await res.json()
      setArticles(data.articles ?? [])
      setMessage(`${data.count ?? 0} articles`)
    } catch { setMessage('Failed to load') }
    finally  { setLoading(false) }
  }

  function applyFilter(key: string, val: string) {
    const next = { ...filters, [key]: val }
    setFilters(next)
    loadArticles(next)
  }

  async function fetchFreshNews() {
    setFetching(true); setMessage('Fetching from all sources...')
    try {
      const res  = await fetch('/api/news/fetch', { method: 'POST' })
      const data = await res.json()
      setMessage(data.message); await loadArticles()
    } catch { setMessage('Fetch failed') }
    finally  { setFetching(false) }
  }

  async function analyzeNews() {
    setAnalyzing(true); setMessage('AI analyzing... (~30s)')
    try {
      const res  = await fetch('/api/ai/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 10 }),
      })
      const data = await res.json()
      setMessage(data.message); await loadArticles()
    } catch { setMessage('Analysis failed') }
    finally  { setAnalyzing(false) }
  }

  const activeCount = Object.values(filters).filter(v => v !== 'all').length

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a' }}>

      {/* ── Sticky header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        backgroundColor: '#0a0a0a', borderBottom: '1px solid #1e1e1e',
      }}>
        <div style={{
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
        }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: 'monospace', fontSize: '16px', color: '#ff6600', margin: 0, fontWeight: 600, letterSpacing: '0.1em' }}>
              NEWS FEED
            </h1>
            <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888', margin: 0 }}>
              {message || 'Economic Times · Mint · Moneycontrol · Business Standard'}
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {/* View toggle */}
            <div style={{ display: 'flex', border: '1px solid #1e1e1e', borderRadius: '6px', overflow: 'hidden' }}>
              {(['grid', 'list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: '6px 8px', border: 'none', cursor: 'pointer',
                  backgroundColor: view === v ? '#2a2a2a' : 'transparent',
                  color: view === v ? '#ff6600' : '#888',
                }}>
                  {v === 'grid' ? <LayoutGrid size={13} /> : <List size={13} />}
                </button>
              ))}
            </div>

            {/* Filter */}
            <button onClick={() => setShowFilter(p => !p)} style={{
              position: 'relative', display: 'flex', alignItems: 'center', gap: '4px',
              padding: '6px 10px', fontFamily: 'monospace', fontSize: '11px', cursor: 'pointer',
              border: `1px solid ${showFilter || activeCount > 0 ? '#ff6600' : '#1e1e1e'}`,
              borderRadius: '6px', backgroundColor: 'transparent',
              color: showFilter || activeCount > 0 ? '#ff6600' : '#888',
            }}>
              <SlidersHorizontal size={12} /> Filter
              {activeCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  backgroundColor: '#ff6600', color: '#000',
                  fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold',
                }}>
                  {activeCount}
                </span>
              )}
            </button>

            {/* Fetch */}
            <button onClick={fetchFreshNews} disabled={fetching} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '6px 10px', fontFamily: 'monospace', fontSize: '11px', cursor: 'pointer',
              border: '1px solid #1e1e1e', borderRadius: '6px',
              backgroundColor: 'transparent', color: '#888',
            }}>
              <RefreshCw size={12} style={{ animation: fetching ? 'spin 1s linear infinite' : 'none' }} />
              {fetching ? 'Fetching...' : 'Fetch'}
            </button>

            {/* AI */}
            <button onClick={analyzeNews} disabled={analyzing} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '6px 10px', fontFamily: 'monospace', fontSize: '11px', cursor: 'pointer',
              border: '1px solid #ff6600', borderRadius: '6px',
              backgroundColor: 'transparent', color: '#ff6600',
            }}>
              <Brain size={12} />
              {analyzing ? 'Analyzing...' : 'Run AI'}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #1e1e1e', backgroundColor: '#111' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#ff6600' }}>FILTERS</span>
              <button onClick={() => setShowFilter(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={14} />
              </button>
            </div>
            {(Object.entries(FILTER_OPTIONS) as [string, string[]][]).map(([key, opts]) => (
              <div key={key} style={{ marginBottom: '12px' }}>
                <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#888', margin: '0 0 6px', textTransform: 'uppercase' }}>{key}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {opts.map(opt => {
                    const active = filters[key as keyof typeof filters] === opt
                    return (
                      <button key={opt} onClick={() => applyFilter(key, opt)} style={{
                        padding: '4px 10px', fontFamily: 'monospace', fontSize: '10px',
                        cursor: 'pointer', borderRadius: '99px',
                        border: `1px solid ${active ? '#ff6600' : '#1e1e1e'}`,
                        backgroundColor: active ? 'rgba(255,102,0,0.15)' : 'transparent',
                        color: active ? '#ff6600' : '#888',
                      }}>
                        {opt.toUpperCase()}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            {activeCount > 0 && (
              <button onClick={() => {
                const reset = { importance: 'all', sentiment: 'all', category: 'all' }
                setFilters(reset); loadArticles(reset)
              }} style={{ fontFamily: 'monospace', fontSize: '10px', color: '#ff3333', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      <div style={{ padding: '16px' }}>
        {loading && articles.length === 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>Loading...</p>
          </div>
        )}

        {!loading && articles.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '13px', color: '#888' }}>No articles yet — click Fetch</p>
          </div>
        )}

        {articles.length > 0 && (
          <div style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: view === 'list'
              ? '1fr'
              : 'repeat(auto-fill, minmax(260px, 1fr))',
          }}>
            {articles.map(article => (
              <NewsCard key={article.id} article={article} view={view} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}