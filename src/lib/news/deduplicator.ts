import type { RawNewsArticle } from '@/types/news'

// Simple hash — turns a URL into a short unique string
function hashUrl(url: string): string {
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // convert to 32-bit int
  }
  return Math.abs(hash).toString(36)
}

// Removes duplicate articles by URL
export function deduplicateArticles(
  articles: RawNewsArticle[]
): { article: RawNewsArticle; urlHash: string }[] {
  const seen = new Set<string>()
  const result: { article: RawNewsArticle; urlHash: string }[] = []

  for (const article of articles) {
    if (!article.url || !article.title) continue  // skip broken articles

    const hash = hashUrl(article.url)

    if (seen.has(hash)) continue  // already have this one
    seen.add(hash)

    result.push({ article, urlHash: hash })
  }

  console.log(`[Dedup] ${articles.length} → ${result.length} unique articles`)
  return result
}