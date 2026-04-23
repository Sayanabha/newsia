import { NextRequest, NextResponse } from 'next/server'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const baseUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const results: Record<string, any> = {}
  const startTime = Date.now()

  console.log('[CRON] Pipeline starting...')

  // Step 1 — Fetch
  try {
    const res = await fetch(`${baseUrl}/api/news/fetch`, { method: 'POST' })
    results.fetch = await res.json()
  } catch (err: any) { results.fetch = { error: err.message } }

  // Step 2 — Analyze
  if (!results.fetch?.error) {
    try {
      const res = await fetch(`${baseUrl}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 15 }),
      })
      results.analyze = await res.json()
    } catch (err: any) { results.analyze = { error: err.message } }
  }

  // Step 3 — Signals
  if (!results.analyze?.error) {
    try {
      const res = await fetch(`${baseUrl}/api/stocks/signals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 30 }),
      })
      results.signals = await res.json()
    } catch (err: any) { results.signals = { error: err.message } }
  }

  // Step 4 — Save sentiment snapshot  ← NEW
  try {
    const res = await fetch(`${baseUrl}/api/sentiment/snapshot`, { method: 'POST' })
    results.snapshot = await res.json()
    console.log('[CRON] Snapshot saved:', results.snapshot)
  } catch (err: any) { results.snapshot = { error: err.message } }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`[CRON] Pipeline complete in ${elapsed}s`)

  return NextResponse.json({
    success: true,
    elapsed: `${elapsed}s`,
    ranAt:   new Date().toISOString(),
    results,
  })
}