import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchAllNews } from '@/lib/news/fetcher'
import { deduplicateArticles } from '@/lib/news/deduplicator'

export async function POST() {
  try {
    console.log('[API] /api/news/fetch called')

    // 1. Fetch from all sources
    const rawArticles = await fetchAllNews()

    // 2. Deduplicate
    const unique = deduplicateArticles(rawArticles)

    if (unique.length === 0) {
      return NextResponse.json({ message: 'No new articles', inserted: 0 })
    }

    // 3. Shape for Supabase insert
    const rows = unique.map(({ article, urlHash }) => ({
      title:       article.title,
      description: article.description ?? null,
      content:     article.content ?? null,
      url:         article.url,
      url_hash:    urlHash,
      source_name: article.source?.name ?? null,
      published_at: article.publishedAt ?? null,
    }))

    // 4. Insert — ignore duplicates already in DB (upsert on url_hash)
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('news_articles')
      .upsert(rows, { onConflict: 'url_hash', ignoreDuplicates: true })
      .select('id')

    if (error) {
      console.error('[API] Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const inserted = data?.length ?? 0
    console.log(`[API] Inserted ${inserted} new articles`)

    return NextResponse.json({
      message: `Fetched ${rawArticles.length}, unique ${unique.length}, inserted ${inserted}`,
      inserted,
    })
  } catch (err: any) {
    console.error('[API] Unexpected error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}