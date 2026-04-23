import axios from 'axios'
import { fetchFromRSS } from './rss-fetcher'
import type { RawNewsArticle } from '@/types/news'

async function fetchFromNewsAPI(): Promise<RawNewsArticle[]> {
  const queries = [
    'NIFTY SENSEX India stock market',
    'Indian economy RBI policy rate',
    'BSE NSE India earnings results',
  ]
  const results: RawNewsArticle[] = []

  for (const q of queries) {
    try {
      const res = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q,
          language: 'en',
          sortBy:   'publishedAt',
          pageSize: 20,
          apiKey:   process.env.NEWS_API_KEY,
        },
        timeout: 8000,
      })
      // NewsAPI includes urlToImage
      const articles = (res.data.articles ?? []).map((a: any) => ({
        ...a,
        imageUrl: a.urlToImage ?? null,
        author:   a.author     ?? null,
      }))
      results.push(...articles)
    } catch (err: any) {
      console.error(`[NewsAPI] "${q}" failed:`, err.message)
    }
  }
  return results
}

async function fetchFromGNews(): Promise<RawNewsArticle[]> {
  const queries = ['India stock market', 'NIFTY 50 stocks BSE']
  const results: RawNewsArticle[] = []

  for (const q of queries) {
    try {
      const res = await axios.get('https://gnews.io/api/v4/search', {
        params: {
          q, lang: 'en', country: 'in', max: 10,
          apikey: process.env.GNEWS_API_KEY,
        },
        timeout: 8000,
      })
      const articles = (res.data.articles ?? []).map((a: any) => ({
        title:       a.title,
        description: a.description,
        content:     a.content,
        url:         a.url,
        source:      { name: a.source?.name ?? 'GNews' },
        publishedAt: a.publishedAt,
        imageUrl:    a.image ?? null,
        author:      null,
      }))
      results.push(...articles)
    } catch (err: any) {
      console.error(`[GNews] "${q}" failed:`, err.message)
    }
  }
  return results
}

export async function fetchAllNews(): Promise<RawNewsArticle[]> {
  console.log('[Fetcher] Starting fetch from all sources...')

  const [newsApi, gNews, rss] = await Promise.allSettled([
    fetchFromNewsAPI(),
    fetchFromGNews(),
    fetchFromRSS(),
  ])

  const all: RawNewsArticle[] = []
  if (newsApi.status === 'fulfilled') { console.log(`[Fetcher] NewsAPI: ${newsApi.value.length}`); all.push(...newsApi.value) }
  if (gNews.status   === 'fulfilled') { console.log(`[Fetcher] GNews: ${gNews.value.length}`);     all.push(...gNews.value)   }
  if (rss.status     === 'fulfilled') { console.log(`[Fetcher] RSS: ${rss.value.length}`);         all.push(...rss.value)     }

  console.log(`[Fetcher] Total: ${all.length} articles`)
  return all
}