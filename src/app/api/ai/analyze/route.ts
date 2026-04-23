import { NextRequest, NextResponse } from 'next/server'
import { createClient }    from '@/lib/supabase/server'
import { analyzeArticle }  from '@/lib/ai/analyzer'

export async function POST(req: NextRequest) {
  try {
    const body  = await req.json().catch(() => ({}))
    // How many articles to process per run (default 10, max 20)
    // Keep low to stay within free tier API limits
    const limit = Math.min(Number(body.limit ?? 10), 20)

    const supabase = await createClient()

    // Fetch unprocessed articles (no sentiment yet)
    const { data: articles, error } = await supabase
      .from('news_articles')
      .select('id, title, description')
      .is('sentiment', null)           // only unanalyzed ones
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: 'No unanalyzed articles found', processed: 0 })
    }

    console.log(`[API] Analyzing ${articles.length} articles...`)

    let processed = 0
    let failed    = 0

    for (const article of articles) {
      const analysis = await analyzeArticle(
        article.title,
        article.description ?? ''
      )

      if (!analysis) {
        failed++
        continue
      }

      // Save results back to Supabase
      const { error: updateError } = await supabase
        .from('news_articles')
        .update({
          sentiment:       analysis.sentiment,
          sentiment_score: analysis.sentiment_score,
          importance:      analysis.importance,
          category:        analysis.category,
          entities:        analysis.entities,
          impact_score:    analysis.impact_score,
          processed_at:    new Date().toISOString(),
        })
        .eq('id', article.id)

      if (updateError) {
        console.error('[API] Update error:', updateError)
        failed++
      } else {
        processed++
      }

      // Small delay to avoid hitting rate limits on free tier
      await new Promise(r => setTimeout(r, 500))
    }

    return NextResponse.json({
      message:   `Processed ${processed} articles, ${failed} failed`,
      processed,
      failed,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}