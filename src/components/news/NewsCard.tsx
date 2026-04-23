import { ExternalLink, Clock, User, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { NewsArticle } from '@/types/news'
import { formatDistanceToNow } from 'date-fns'

type Props = {
  article:  NewsArticle
  view?:    'grid' | 'list'
}

const FALLBACK_IMAGES: Record<string, string> = {
  economy:  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
  company:  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80',
  global:   'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&q=80',
  policy:   'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&q=80',
  default:  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80',
}

export function NewsCard({ article, view = 'grid' }: Props) {
  const imageUrl   = article.image_url
    ?? FALLBACK_IMAGES[article.category ?? 'default']
    ?? FALLBACK_IMAGES.default

  const timeAgo = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
    : null

  const sentimentConfig = {
    positive: { color: 'text-bloomberg-green',  bg: 'bg-bloomberg-green',  icon: TrendingUp,   label: 'Positive' },
    negative: { color: 'text-bloomberg-red',    bg: 'bg-bloomberg-red',    icon: TrendingDown, label: 'Negative' },
    neutral:  { color: 'text-bloomberg-yellow', bg: 'bg-bloomberg-yellow', icon: Minus,        label: 'Neutral'  },
  }

  const importanceConfig = {
    high:   { border: 'border-bloomberg-orange', text: 'text-bloomberg-orange', dot: 'bg-bloomberg-orange' },
    medium: { border: 'border-bloomberg-yellow', text: 'text-bloomberg-yellow', dot: 'bg-bloomberg-yellow' },
    low:    { border: 'border-bloomberg-dim',    text: 'text-bloomberg-dim',    dot: 'bg-bloomberg-dim'    },
  }

  const sentiment  = article.sentiment  ? sentimentConfig[article.sentiment]   : null
  const importance = article.importance ? importanceConfig[article.importance] : null
  const SentIcon   = sentiment?.icon ?? Minus

  if (view === 'list') {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-3 bg-bloomberg-surface border border-bloomberg-border rounded-lg p-3 hover:border-bloomberg-orange transition-all duration-200 active:scale-[0.99]"
      >
        {/* Thumbnail */}
        <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded overflow-hidden bg-bloomberg-muted">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGES.default
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className="font-mono text-xs text-bloomberg-text group-hover:text-bloomberg-orange transition-colors line-clamp-2 leading-relaxed">
              {article.title}
            </p>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {importance && (
              <span className={`flex items-center gap-1 text-xs font-mono ${importance.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${importance.dot}`} />
                {article.importance?.toUpperCase()}
              </span>
            )}
            {sentiment && (
              <span className={`flex items-center gap-1 text-xs font-mono ${sentiment.color}`}>
                <SentIcon size={10} />
                {sentiment.label}
              </span>
            )}
            {article.category && (
              <span className="text-xs font-mono text-bloomberg-blue">
                {article.category}
              </span>
            )}
            {timeAgo && (
              <span className="text-xs font-mono text-bloomberg-dim flex items-center gap-1">
                <Clock size={9} />
                {timeAgo}
              </span>
            )}
          </div>
        </div>
      </a>
    )
  }

  // Grid card (default)
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-bloomberg-surface border border-bloomberg-border rounded-lg overflow-hidden hover:border-bloomberg-orange transition-all duration-200 active:scale-[0.98]"
    >
      {/* Image */}
      <div className="relative h-40 sm:h-44 bg-bloomberg-muted overflow-hidden">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGES.default
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bloomberg-bg via-transparent to-transparent opacity-80" />

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          {importance && (
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full border backdrop-blur-sm bg-bloomberg-bg/60 ${importance.border} ${importance.text}`}>
              {article.importance?.toUpperCase()}
            </span>
          )}
          {article.impact_score != null && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-bloomberg-bg/70 backdrop-blur-sm text-bloomberg-orange border border-bloomberg-orange/50">
              {article.impact_score} impact
            </span>
          )}
        </div>

        {/* Bottom left: source */}
        <div className="absolute bottom-2 left-2">
          <span className="text-xs font-mono text-bloomberg-dim bg-bloomberg-bg/70 backdrop-blur-sm px-2 py-0.5 rounded">
            {article.source_name ?? 'Unknown'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <p className="font-mono text-xs text-bloomberg-text group-hover:text-bloomberg-orange transition-colors line-clamp-3 leading-relaxed">
          {article.title}
        </p>

        {article.description && (
          <p className="font-mono text-xs text-bloomberg-dim line-clamp-2 leading-relaxed">
            {article.description}
          </p>
        )}

        {/* Impact bar */}
        {article.impact_score != null && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-0.5 bg-bloomberg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  article.impact_score > 70 ? 'bg-bloomberg-red' :
                  article.impact_score > 40 ? 'bg-bloomberg-yellow' :
                  'bg-bloomberg-green'
                }`}
                style={{ width: `${article.impact_score}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-1 border-t border-bloomberg-border">
          <div className="flex items-center gap-2">
            {sentiment && (
              <span className={`flex items-center gap-1 text-xs font-mono ${sentiment.color}`}>
                <SentIcon size={10} />
                {sentiment.label}
              </span>
            )}
            {article.category && (
              <span className="text-xs font-mono text-bloomberg-blue">
                {article.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-bloomberg-dim">
            {timeAgo && (
              <span className="text-xs font-mono flex items-center gap-1">
                <Clock size={9} />
                {timeAgo}
              </span>
            )}
            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </a>
  )
}