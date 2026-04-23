import axios from 'axios'
import type { RawNewsArticle } from '@/types/news'

// Parse RSS XML manually — no extra library needed
function parseRSS(xml: string, sourceName: string): RawNewsArticle[] {
  const articles: RawNewsArticle[] = []

  // Extract all <item> blocks
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
  let itemMatch

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const item = itemMatch[1]

    const get = (tag: string) => {
      const match = item.match(
        new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i')
      )
      return (match?.[1] ?? match?.[2] ?? '').trim()
    }

    // Try multiple image locations in RSS
    const imageUrl =
      (item.match(/url="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/))?.[1] ??
      (item.match(/<media:content[^>]+url="([^"]+)"/i))?.[1]       ??
      (item.match(/<media:thumbnail[^>]+url="([^"]+)"/i))?.[1]      ??
      (item.match(/<enclosure[^>]+url="([^"]+)"/i))?.[1]            ??
      null

    const title       = get('title')
    const link        = get('link')
    const description = get('description')
      .replace(/<[^>]+>/g, '')   // strip HTML tags from description
      .slice(0, 300)
    const pubDate     = get('pubDate')
    const author      = get('author') || get('dc:creator')

    if (title && link) {
      articles.push({
        title,
        description: description || null,
        content:     null,
        url:         link,
        source:      { name: sourceName },
        publishedAt: pubDate
          ? new Date(pubDate).toISOString()
          : new Date().toISOString(),
        imageUrl:    imageUrl ?? null,
        author:      author   || null,
      } as any)
    }
  }

  return articles
}

// Indian financial RSS feeds — all free
const RSS_FEEDS = [
  {
    url:    'https://economictimes.indiatimes.com/markets/rss.cms',
    source: 'Economic Times Markets',
  },
  {
    url:    'https://economictimes.indiatimes.com/industry/rss.cms',
    source: 'Economic Times Industry',
  },
  {
    url:    'https://www.moneycontrol.com/rss/latestnews.xml',
    source: 'Moneycontrol',
  },
  {
    url:    'https://www.livemint.com/rss/markets',
    source: 'Mint Markets',
  },
  {
    url:    'https://www.livemint.com/rss/companies',
    source: 'Mint Companies',
  },
  {
    url:    'https://feeds.feedburner.com/ndtvprofit-latest',
    source: 'NDTV Profit',
  },
  {
    url:    'https://www.business-standard.com/rss/markets-106.rss',
    source: 'Business Standard Markets',
  },
  {
    url:    'https://www.business-standard.com/rss/economy-policy-102.rss',
    source: 'Business Standard Economy',
  },
]

export async function fetchFromRSS(): Promise<RawNewsArticle[]> {
  const results: RawNewsArticle[] = []

  const fetches = RSS_FEEDS.map(async ({ url, source }) => {
    try {
      const res = await axios.get(url, {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Newsia/1.0)',
          'Accept':     'application/rss+xml, application/xml, text/xml',
        },
        responseType: 'text',
      })
      const articles = parseRSS(res.data, source)
      console.log(`[RSS] ${source}: ${articles.length} articles`)
      return articles
    } catch (err: any) {
      console.warn(`[RSS] ${source} failed:`, err.message)
      return []
    }
  })

  const settled = await Promise.allSettled(fetches)
  for (const r of settled) {
    if (r.status === 'fulfilled') results.push(...r.value)
  }

  console.log(`[RSS] Total: ${results.length} articles`)
  return results
}