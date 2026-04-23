export interface NiftyStock {
  symbol: string        // e.g. "RELIANCE"
  name: string          // e.g. "Reliance Industries"
  sector: string        // e.g. "Energy"
  keywords: string[]    // for news matching: ["reliance", "ril", "mukesh ambani"]
}

export interface StockWithSignal extends NiftyStock {
  latestSignal: 'buy' | 'watch' | 'avoid' | null
  confidence: number | null
  reason: string | null
  relatedArticles: number
}