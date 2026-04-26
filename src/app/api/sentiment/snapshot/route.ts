import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    const { data: articles } = await supabase
      .from('news_articles')
      .select('sentiment, sentiment_score, category')
      .not('sentiment', 'is', null)
      .order('published_at', { ascending: false })
      .limit(50)

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: 'No analyzed articles yet' })
    }

    const positive    = articles.filter(a => a.sentiment === 'positive').length
    const negative    = articles.filter(a => a.sentiment === 'negative').length
    const neutral     = articles.filter(a => a.sentiment === 'neutral').length
    const avgScore    = articles.reduce((s, a) => s + (a.sentiment_score ?? 0), 0) / articles.length

    const catCounts   = articles.reduce((acc: Record<string, number>, a) => {
      if (a.category) acc[a.category] = (acc[a.category] ?? 0) + 1
      return acc
    }, {})
    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'economy'

    const { error } = await supabase
      .from('sentiment_snapshots')
      .insert({
        avg_score:    Math.round(avgScore * 1000) / 1000,
        positive,
        negative,
        neutral,
        total:        articles.length,
        top_category: topCategory,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ saved: true, avgScore, positive, negative, neutral })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('sentiment_snapshots')
      .select('*')
      .order('captured_at', { ascending: true })
      .limit(48)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ snapshots: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}