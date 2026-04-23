import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit      = Math.min(Number(searchParams.get('limit')  ?? 50), 100)
    const importance = searchParams.get('importance')  // high | medium | low
    const sentiment  = searchParams.get('sentiment')   // positive | negative | neutral
    const category   = searchParams.get('category')    // economy | company | global | policy

    const supabase = await createClient()

    let query = supabase
      .from('news_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (importance) query = query.eq('importance', importance)
    if (sentiment)  query = query.eq('sentiment',  sentiment)
    if (category)   query = query.eq('category',   category)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ articles: data ?? [], count: data?.length ?? 0 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}