import { NIFTY50_STOCKS } from '@/constants/nifty50-stocks'
import type { NiftyStock } from '@/types/stock'

export interface MappedStock {
  stock:      NiftyStock
  matchScore: number   // how strongly this article relates to this stock
}

export function mapArticleToStocks(
  title:    string,
  entities: string[],
  category: string
): MappedStock[] {
  const text = [title, ...entities].join(' ').toLowerCase()
  const matches: MappedStock[] = []

  for (const stock of NIFTY50_STOCKS) {
    let matchScore = 0

    // Check each keyword against the full text
    for (const keyword of stock.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        // Direct entity match scores higher than title match
        const inEntity = entities.some(e =>
          e.toLowerCase().includes(keyword.toLowerCase())
        )
        matchScore += inEntity ? 3 : 1
      }
    }

    // Boost score if category is 'company' (more specific)
    if (category === 'company' && matchScore > 0) {
      matchScore *= 1.5
    }

    if (matchScore > 0) {
      matches.push({ stock, matchScore })
    }
  }

  // Sort by strongest match first
  return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5)
}