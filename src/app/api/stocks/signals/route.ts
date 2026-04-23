import { NextRequest, NextResponse } from 'next/server'
import { createClient }      from '@/lib/supabase/server'
import { mapArticleToStocks } from '@/lib/stocks/mapper'
import { generateSignal }     from '@/lib/stocks/scorer'

export async function POST(req: NextRequest) {
  try {
    const body  = await req.json().catch(() => ({}))
    const limit = Math.min(Number(body.limit ?? 20), 50)

    const supabase = await createClient()

    // Get analyzed articles that haven't been mapped to stocks yet
    const { data: articles, error } = await supabase
      .from('news_articles')
      .select('id, title, sentiment, sentiment_score, importance, impact_score, category, entities')
      .not('sentiment', 'is', null)       // must be AI-analyzed
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({
        message: 'No analyzed articles found. Run AI analysis first.',
        signals: 0,
      })
    }

    let totalSignals = 0

    for (const article of articles) {
      // Map article → matching stocks
      const mappedStocks = mapArticleToStocks(
        article.title,
        article.entities ?? [],
        article.category ?? ''
      )

      if (mappedStocks.length === 0) continue

      // Generate a signal for each matched stock
      const signalRows = mappedStocks.map(({ stock, matchScore }) => {
        const scored = generateSignal(
          article.sentiment,
          article.sentiment_score ?? 0,
          article.importance      ?? 'low',
          article.impact_score    ?? 0,
          matchScore,
          article.title
        )

        return {
          article_id:   article.id,
          stock_symbol: stock.symbol,
          signal:       scored.signal,
          confidence:   scored.confidence,
          reason:       scored.reason,
        }
      })

      // Upsert signals (avoid duplicates per article+stock combo)
      const { error: insertError } = await supabase
        .from('stock_signals')
        .upsert(signalRows, {
          onConflict:       'article_id,stock_symbol',
          ignoreDuplicates: true,
        })

      if (insertError) {
        console.error('[Signals] Insert error:', insertError)
      } else {
        totalSignals += signalRows.length
        console.log(`[Signals] ${signalRows.length} signals for: "${article.title.slice(0, 50)}"`)
      }
    }

    return NextResponse.json({
      message: `Generated ${totalSignals} stock signals from ${articles.length} articles`,
      signals: totalSignals,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET — fetch aggregated signals per stock
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get('symbol')

    let query = supabase
      .from('stock_signals')
      .select(`
        stock_symbol,
        signal,
        confidence,
        reason,
        created_at,
        news_articles (
          title,
          url,
          published_at,
          sentiment,
          impact_score
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (symbol) query = query.eq('stock_symbol', symbol)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Aggregate: for each stock, compute overall signal
    const stockMap = new Map<string, {
      symbol:      string
      buyCount:    number
      watchCount:  number
      avoidCount:  number
      avgConf:     number
      signals:     any[]
      latestReason:string
    }>()

    for (const row of (data ?? [])) {
      const sym = row.stock_symbol
      if (!stockMap.has(sym)) {
        stockMap.set(sym, {
          symbol: sym, buyCount: 0, watchCount: 0,
          avoidCount: 0, avgConf: 0, signals: [], latestReason: '',
        })
      }
      const entry = stockMap.get(sym)!
      if (row.signal === 'buy')   entry.buyCount++
      if (row.signal === 'watch') entry.watchCount++
      if (row.signal === 'avoid') entry.avoidCount++
      entry.avgConf += row.confidence
      entry.signals.push(row)
      if (!entry.latestReason) entry.latestReason = row.reason ?? ''
    }

    // Compute final signal per stock
    const aggregated = Array.from(stockMap.values()).map(s => {
      const total       = s.buyCount + s.watchCount + s.avoidCount
      const overallSignal =
        s.buyCount > s.avoidCount && s.buyCount > s.watchCount ? 'buy'   :
        s.avoidCount > s.buyCount && s.avoidCount > s.watchCount ? 'avoid' : 'watch'

      return {
        symbol:         s.symbol,
        overallSignal,
        confidence:     Math.round((s.avgConf / total) * 100) / 100,
        buyCount:       s.buyCount,
        watchCount:     s.watchCount,
        avoidCount:     s.avoidCount,
        totalSignals:   total,
        latestReason:   s.latestReason,
        recentSignals:  s.signals.slice(0, 3),
      }
    })

    // Sort: buy first, then watch, then avoid
    const order = { buy: 0, watch: 1, avoid: 2 }
    aggregated.sort((a, b) =>
      order[a.overallSignal as keyof typeof order] -
      order[b.overallSignal as keyof typeof order]
    )

    return NextResponse.json({ stocks: aggregated, total: aggregated.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}