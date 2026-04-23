export type Sentiment = 'positive' | 'negative' | 'neutral'
export type Importance = 'high' | 'medium' | 'low'
export type Category = 'economy' | 'company' | 'global' | 'policy'
export type Signal = 'buy' | 'watch' | 'avoid'

export interface NewsArticle {
  id:              string
  title:           string
  description:     string | null
  content:         string | null
  url:             string
  source_name:     string | null
  source_url:      string | null
  image_url:       string | null
  author:          string | null
  fetch_source:    string | null
  published_at:    string | null
  url_hash:        string | null
  sentiment:       Sentiment | null
  sentiment_score: number | null
  importance:      Importance | null
  category:        Category | null
  entities:        string[] | null
  impact_score:    number | null
  created_at:      string
  processed_at:    string | null
}

export interface StockSignal {
  id:           string
  article_id:   string
  stock_symbol: string
  signal:       Signal
  confidence:   number
  reason:       string | null
  created_at:   string
}

export interface RawNewsArticle {
  title:       string
  description: string | null
  content:     string | null
  url:         string
  source:      { name: string }
  publishedAt: string
  imageUrl?:   string | null
  author?:     string | null
}