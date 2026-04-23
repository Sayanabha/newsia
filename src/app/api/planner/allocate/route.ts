import { NextRequest, NextResponse } from 'next/server'
import { createClient }         from '@/lib/supabase/server'
import { calculateAllocation, getRecommendations } from '@/lib/planner/allocator'
import type { PlannerInput }    from '@/types/planner'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const input: PlannerInput = {
      monthlyBudget:   Number(body.monthlyBudget   ?? 13000),
      riskProfile:     body.riskProfile             ?? 'moderate',
      marketSentiment: Number(body.marketSentiment  ?? 0),
    }

    // Fetch live sentiment from DB if not provided
    if (!body.marketSentiment) {
      try {
        const supabase = await createClient()
        const { data } = await supabase
          .from('news_articles')
          .select('sentiment_score')
          .not('sentiment_score', 'is', null)
          .order('published_at', { ascending: false })
          .limit(20)

        if (data && data.length > 0) {
          const avg = data.reduce((s, a) => s + (a.sentiment_score ?? 0), 0) / data.length
          input.marketSentiment = avg
        }
      } catch {
        // silently use 0 if DB unavailable
      }
    }

    const allocation     = calculateAllocation(input)
    const recommendations = getRecommendations(input.riskProfile, allocation)

    return NextResponse.json({
      allocation,
      recommendations,
      marketSentiment: input.marketSentiment,
      input,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}