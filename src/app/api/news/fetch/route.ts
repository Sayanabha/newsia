import { NextResponse } from 'next/server'
import { createClient }        from '@/lib/supabase/server'
import { fetchAllNews }        from '@/lib/news/fetcher'
import { deduplicateArticles } from '@/lib/news/deduplicator'

export async function POST() {
  try {
    const rawArticles = await fetchAllNews()
    const unique      = deduplicateArticles(rawArticles)

    if (unique.length === 0) {
      return NextResponse.json({ message: 'No new articles', inserted: 0 })
    }

    const rows = unique.map(({ article, urlHash }) => ({
      title:        article.title,
      description:  article.description  ?? null,
      content:      article.content      ?? null,
      url:          article.url,
      url_hash:     urlHash,
      source_name:  article.source?.name ?? null,
      published_at: article.publishedAt  ?? null,
      image_url:    (article as any).imageUrl ?? null,   // ← new
      author:       (article as any).author   ?? null,   // ← new
    }))

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('news_articles')
      .upsert(rows, { onConflict: 'url_hash', ignoreDuplicates: true })
      .select('id')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message:  `Fetched ${rawArticles.length}, unique ${unique.length}, inserted ${data?.length ?? 0}`,
      inserted: data?.length ?? 0,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}