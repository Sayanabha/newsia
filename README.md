# Newsia 🚀

> AI-powered Indian stock market intelligence. Reads the news so you don't have to. Then tells you what it thinks about your money, with the appropriate number of disclaimers.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)
![Gemini](https://img.shields.io/badge/Google-Gemini_AI-orange?style=flat-square&logo=google)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## What is Newsia?

Newsia is a full-stack web application that aggregates financial news from multiple Indian sources, runs it through AI to figure out what it means, maps it to NIFTY 50 stocks, and then suggests how you might want to allocate your monthly investment budget.

It is not a trading bot. It is not a financial advisor. It will not make you rich overnight. What it will do is give you a Bloomberg-terminal-style dashboard that makes you look extremely serious about your investments, even if you're just procrastinating on a Sunday afternoon.

The entire thing runs for free. Zero rupees. Nada. We made deliberate decisions at every layer to stay on free tiers, because paying for infrastructure when you're still figuring out if your idea is good is a trap that has claimed many promising projects.

---

## Screenshots

| Dashboard | News Feed | Stock Signals |
|-----------|-----------|---------------|
| Dark Bloomberg theme, live sentiment, sector heatmap | Image cards from 8+ Indian sources | BUY / WATCH / AVOID with confidence scores |

---

## Features

### News Aggregation
Pulls from 10+ sources simultaneously, deduplicates using URL hashing, and stores everything in Postgres. Sources include Economic Times, Moneycontrol, Mint, Business Standard, NDTV Profit (via RSS, no API key needed) plus NewsAPI and GNews as structured API sources.

### AI Processing Layer
Every article gets run through Google Gemini 1.5 Flash. The AI assigns a sentiment (positive / negative / neutral), an importance rating (high / medium / low), a category (economy / company / global / policy), extracts company and sector entities, and produces an impact score from 0 to 100. If Gemini is having a bad day, Groq with LLaMA 3 steps in as fallback. The prompt is carefully constructed so the output is always valid JSON, and the parser strips markdown code fences because AI models have a compulsive need to wrap everything in triple backticks even when you specifically ask them not to.

### Stock Mapping Engine
A keyword matching engine scans every article's title and extracted entities against a manually curated list of all 50 NIFTY 50 stocks, each tagged with sector and a list of aliases (so "RIL", "Jio", and "Mukesh Ambani" all point to RELIANCE). Match scores are weighted: a direct entity match counts more than a title mention. Only the top 5 matching stocks per article get signals.

### Signal Generation
Each article-to-stock mapping produces a signal: BUY, WATCH, or AVOID. Confidence is a composite of sentiment polarity, impact score, importance weight, and keyword match strength. Multiple signals per stock get aggregated into an overall signal with a breakdown bar showing the ratio of buy/watch/avoid signals. Importantly, this is labeled very clearly as an indicator, not a prediction. Markets are chaotic and anyone who tells you otherwise is selling something.

### Investment Planner
Takes your monthly budget (default ₹13,000) and your risk profile (conservative / moderate / aggressive) and produces an allocation across stocks, mutual funds, fixed deposits, bonds, ETFs, and gold. The allocation is dynamically adjusted based on live market sentiment from the database. Bullish sentiment shifts more toward equities. Bearish sentiment shifts toward safe assets. The math is transparent and rule-based, not a black box. Specific product recommendations are included for each category.

### Auto-Refresh
A cron pipeline (hourly on Vercel, toggleable manually in the sidebar) runs the full sequence: fetch news, AI analyze, generate signals, save sentiment snapshot. The sentiment snapshots build up over time into a timeline chart on the dashboard.

### Bloomberg Dark Theme
Because if you're staring at market data, it should at least look cool. The color palette is inspired by actual Bloomberg terminals: near-black background, orange accents, green for positive/buy, red for negative/avoid, yellow for neutral/watch. The font throughout is JetBrains Mono, which makes everything look like you know what you're doing.

---

## Tech Stack

### Why Next.js (and not a separate backend)?

The original plan was FastAPI for the backend. We ditched it. Here's why: when you're a solo developer or a small team, context switching between two codebases, two deployment pipelines, and two sets of environment variables is death by a thousand paper cuts. Next.js App Router gives you React on the frontend and API routes on the backend in the same project, the same repo, and the same deployment. The API routes run as serverless functions on Vercel. One `npm run dev` and everything is running. This was the right call.

### Why TypeScript?

Because JavaScript will let you pass a string where you expect a number and then spend three hours wondering why your impact score is "5050" instead of 100. TypeScript catches these things at compile time. The slightly longer time to write types pays back immediately in debugging time saved. Every entity in Newsia has a proper type: `NewsArticle`, `StockSignal`, `PlannerInput`, `AllocationResult`. When you add a new field to the database, TypeScript immediately tells you every place in the app that needs to handle it.

### Why Supabase?

Supabase is PostgreSQL with a nice dashboard, a JavaScript SDK, Row Level Security, and a generous free tier (500MB database, 2GB bandwidth per month). We could have used Firebase, but Postgres is relational and our data is relational. Articles have signals. Signals reference articles. Snapshots track sentiment over time. Trying to do this in a document store like Firestore would have meant either deeply nested documents or a lot of manual join logic in application code. Postgres just handles it. Also, Supabase's table editor is genuinely useful for inspecting data during development without needing to run SQL every time.

### Why Gemini 1.5 Flash?

Because it's free (within rate limits), it's fast, and it's genuinely good at structured extraction tasks. The "Flash" model is specifically designed for high-throughput, lower-latency tasks, which is exactly what we need when processing batches of articles. We're not asking it to write poetry or reason about philosophy. We're asking it to read a news headline and fill in a JSON form. Flash handles this extremely well.

The prompt engineering here deserves a mention. The key insight is asking the model to respond with "ONLY a valid JSON object, no markdown, no explanation, no code blocks." And then parsing defensively anyway, stripping code fences in case the model gets creative. Trust but verify.

### Why Groq as fallback?

Groq runs inference on custom silicon (LPUs) that is genuinely extremely fast. Their free tier with LLaMA 3 8B is a solid backup for when Gemini rate limits kick in. The fallback chain is: try Gemini, if it throws or returns unparseable output, try Groq. If both fail, the article stays unanalyzed and gets picked up in the next cron run. Nothing is lost, everything is retried.

### Why RSS for Indian sources?

Because most Indian financial news sites (Economic Times, Moneycontrol, Mint, Business Standard) don't have free developer APIs, but they all publish RSS feeds. RSS is a 25-year-old protocol that still works perfectly. We parse the XML manually with regex rather than adding an RSS parsing library, because the feeds are simple enough and adding a dependency for 30 lines of regex is overkill. Images are extracted from `<media:content>`, `<media:thumbnail>`, and `<enclosure>` tags, with fallback to category-specific Unsplash photos if the feed doesn't include an image.

### Why Tailwind v4?

Because `create-next-app` installed it automatically, and fighting the installer is a bad use of time. Tailwind v4 is a significant departure from v3: instead of `tailwind.config.ts`, all custom tokens are defined in CSS using `@theme {}`. This means `--color-bloomberg-orange: #ff6600` in CSS generates `text-bloomberg-orange`, `bg-bloomberg-orange`, `border-bloomberg-orange` etc. automatically. Once you understand this, it's actually cleaner than the v3 approach.

### Why inline styles for some components?

During development, we hit a case where Tailwind's utility classes weren't applying to dynamically-rendered components (specifically the news grid). This was a Tailwind v4 content scanning issue. The pragmatic fix was to use inline styles for layout-critical properties where we needed guarantees, and Tailwind for everything else. The news page in particular uses inline styles for the grid because `display: grid` and `gridTemplateColumns` need to work regardless of how Tailwind's JIT compiler feels about it on a given day.

### Why no auth?

For an MVP running locally, auth adds complexity without adding value. The Supabase service role key (used server-side for writes) is in `.env.local` and never exposed to the browser. Public read policies on the Supabase tables mean the dashboard can load data without any credentials. If you want to add auth (so only you can trigger analysis), Supabase Auth takes about an hour to add and is documented in the "What's Next" section.

### Why a manual cron pipeline and not a background worker?

Because background workers (PM2, BullMQ, dedicated cron services) require a server that's always running. Vercel's free tier is serverless, meaning functions spin up on request and shut down when done. Vercel's built-in cron jobs (defined in `vercel.json`) hit your API route on a schedule, which is exactly what we need. For local development, there's a toggle in the sidebar that calls the same pipeline route on an hourly interval using `setInterval`. Same code path, different trigger mechanism.

---

## Project Structure

```
newsia/
├── src/
│   ├── app/                    # Next.js App Router pages + API routes
│   │   ├── page.tsx            # Dashboard
│   │   ├── news/page.tsx       # News feed with image cards
│   │   ├── sentiment/page.tsx  # Sentiment analysis view
│   │   ├── stocks/page.tsx     # Stock signals
│   │   ├── planner/page.tsx    # Investment planner
│   │   └── api/
│   │       ├── news/
│   │       │   ├── fetch/      # Pull from all sources + store
│   │       │   └── list/       # Query articles with filters
│   │       ├── ai/
│   │       │   └── analyze/    # Gemini/Groq analysis pipeline
│   │       ├── stocks/
│   │       │   └── signals/    # Generate + fetch stock signals
│   │       ├── sentiment/
│   │       │   └── snapshot/   # Save + fetch sentiment history
│   │       ├── planner/
│   │       │   └── allocate/   # Investment allocation engine
│   │       └── cron/
│   │           └── pipeline/   # Full auto-refresh pipeline
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx     # Desktop sidebar + mobile bottom tabs
│   │   │   └── AutoRefresh.tsx # Hourly pipeline toggle widget
│   │   └── dashboard/
│   │       ├── SentimentChart.tsx  # Recharts area chart
│   │       ├── SectorHeatmap.tsx   # Color-coded sector grid
│   │       └── TopMovers.tsx       # Buy/avoid leaders
│   ├── lib/
│   │   ├── supabase/           # Browser + server Supabase clients
│   │   ├── ai/                 # Gemini, Groq wrappers + unified analyzer
│   │   ├── news/               # Fetcher (NewsAPI, GNews, RSS) + deduplicator
│   │   ├── stocks/             # NIFTY mapper + signal scorer
│   │   └── planner/            # Allocation engine + recommendations
│   ├── types/                  # TypeScript interfaces for everything
│   └── constants/
│       └── nifty50-stocks.ts   # Full NIFTY 50 with sectors + keywords
├── vercel.json                 # Cron schedule definition
└── .env.local                  # Your secrets (never committed)
```

---

## Getting Started

### Prerequisites

- Node.js 18+ ([nodejs.org](https://nodejs.org))
- A Supabase account ([supabase.com](https://supabase.com)) -- free
- A Google AI Studio account for Gemini ([aistudio.google.com](https://aistudio.google.com)) -- free
- A Groq account ([console.groq.com](https://console.groq.com)) -- free
- A NewsAPI account ([newsapi.org](https://newsapi.org)) -- free tier
- A GNews account ([gnews.io](https://gnews.io)) -- free tier

### Installation

```bash
git clone https://github.com/Sayanabha/newsia.git
cd newsia
npm install
```

### Environment Setup

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# News APIs
NEWS_API_KEY=your_newsapi_key
GNEWS_API_KEY=your_gnews_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=any_random_string_you_choose
```

### Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Articles
CREATE TABLE news_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT UNIQUE NOT NULL,
  url_hash TEXT UNIQUE,
  source_name TEXT,
  image_url TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  sentiment_score NUMERIC(4,3),
  importance TEXT CHECK (importance IN ('high', 'medium', 'low')),
  category TEXT CHECK (category IN ('economy', 'company', 'global', 'policy')),
  entities TEXT[],
  impact_score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Signals
CREATE TABLE stock_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES news_articles(id),
  stock_symbol TEXT NOT NULL,
  signal TEXT CHECK (signal IN ('buy', 'watch', 'avoid')),
  confidence NUMERIC(4,3),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT stock_signals_article_stock_unique UNIQUE (article_id, stock_symbol)
);

-- Sentiment snapshots
CREATE TABLE sentiment_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  avg_score NUMERIC(5,3),
  positive INTEGER,
  negative INTEGER,
  neutral INTEGER,
  total INTEGER,
  top_category TEXT
);

-- RLS
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read news"      ON news_articles       FOR SELECT USING (true);
CREATE POLICY "Allow inserts"         ON news_articles       FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read signals"   ON stock_signals       FOR SELECT USING (true);
CREATE POLICY "Allow inserts signals" ON stock_signals       FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read snapshots" ON sentiment_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow insert snapshots"ON sentiment_snapshots FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_news_published  ON news_articles (published_at DESC);
CREATE INDEX idx_news_sentiment  ON news_articles (sentiment);
CREATE INDEX idx_news_importance ON news_articles (importance);
CREATE INDEX idx_signals_symbol  ON stock_signals (stock_symbol);
CREATE INDEX idx_snapshots_time  ON sentiment_snapshots (captured_at DESC);
```

### Run It

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Using Newsia

The workflow is sequential:

1. **News page** -- click "Fetch" to pull from all sources
2. **News page** -- click "Run AI" to analyze articles (10 at a time, ~30s)
3. **Stocks page** -- click "Generate Signals" to map articles to NIFTY 50
4. **Planner page** -- set your budget and risk profile, click Calculate
5. **Dashboard** -- everything updates live

Repeat steps 1-3 periodically, or enable the Auto-Refresh toggle in the sidebar to run the full pipeline hourly automatically.

---

## API Reference

All routes live under `/api/`.

| Method | Route | What it does |
|--------|-------|-------------|
| POST | `/api/news/fetch` | Fetch from all sources, deduplicate, store |
| GET | `/api/news/list` | Query articles. Params: `limit`, `importance`, `sentiment`, `category` |
| POST | `/api/ai/analyze` | Analyze unprocessed articles. Body: `{ limit: number }` |
| GET | `/api/stocks/signals` | Aggregated signals per stock. Param: `symbol` |
| POST | `/api/stocks/signals` | Generate signals from analyzed articles. Body: `{ limit: number }` |
| POST | `/api/sentiment/snapshot` | Save current sentiment snapshot |
| GET | `/api/sentiment/snapshot` | Fetch snapshot history for charts |
| POST | `/api/planner/allocate` | Calculate allocation. Body: `{ monthlyBudget, riskProfile }` |
| GET | `/api/cron/pipeline` | Run full pipeline (fetch + analyze + signals + snapshot) |

---

## Design Decisions Worth Calling Out

**URL hashing for deduplication.** Rather than querying the database before every insert to check if an article exists, we compute a hash of the URL client-side and use Supabase's `upsert` with `ignoreDuplicates: true`. One round trip instead of two.

**Service role key for writes.** The Supabase `anon` key is for browser clients and is subject to RLS. Server-side API routes use the `service_role` key, which bypasses RLS entirely. This is correct and secure because the key is never exposed to the browser (it's only in server-side environment variables).

**Batch analysis with delays.** When analyzing articles, we process them one at a time with a 500ms delay between each. This looks slow on the surface but it's intentional: Gemini's free tier has rate limits, and hammering 50 parallel requests is a reliable way to get a 429. Slow and steady gets all the articles processed.

**Keyword matching over embeddings.** A fancier approach to stock mapping would use vector embeddings and semantic search. We used keyword matching because it's deterministic, debuggable, and works without any additional API calls or vector database. When "Jio" appears in an article, it should match RELIANCE. That's not a hard problem. Save the embeddings for when you actually need them.

**`clamp()` for responsive typography.** Instead of defining separate font sizes for mobile and desktop breakpoints, headings use `font-size: clamp(14px, 4vw, 20px)`. This means the font size scales smoothly with viewport width between 14px (minimum) and 20px (maximum). One line instead of two media queries.

**Bottom tab bar on mobile instead of hamburger.** Hamburger menus require two taps to navigate: one to open the menu, one to select the page. A bottom tab bar requires one tap. On mobile, where Newsia is frequently used to quickly check signals, one tap matters. The pattern is also familiar to any smartphone user.

---

## Deployment

### Vercel (Frontend + API Routes)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Add all environment variables from `.env.local` in the Vercel dashboard under Settings > Environment Variables. Make sure `NEXT_PUBLIC_APP_URL` is set to your production URL (e.g. `https://newsia.vercel.app`).

The `vercel.json` file configures the hourly cron job:

```json
{
  "crons": [
    {
      "path": "/api/cron/pipeline",
      "schedule": "0 * * * *"
    }
  ]
}
```

Vercel free tier includes 2 cron jobs. This uses 1.

### Environment Variables on Vercel

Set the same 8 variables from your `.env.local`. The cron route validates requests in production using the `CRON_SECRET` header, so set that to anything random and keep it consistent.

---

## Limitations (Honest ones)

**Free tier rate limits are real.** NewsAPI free tier only returns articles from the last 24 hours and allows 100 requests/day. GNews free tier gives 100 requests/day. Gemini free tier has per-minute token limits. The app handles all of these gracefully (with fallbacks and batch processing), but if you're running this heavily, you'll hit limits.

**RSS feeds change.** News websites occasionally restructure their RSS feeds or add authentication. If a source stops returning articles, check the terminal logs for the specific error.

**Stock signals are indicators, not predictions.** This cannot be overstated. The signal engine is a heuristic based on news sentiment. It does not have access to order books, options data, institutional flows, or any of the other information that actually moves markets in the short term. Use it to get informed, not to YOLO your savings.

**The AI can be wrong.** Language models occasionally misclassify articles, especially sarcasm, opinion pieces, and articles with ambiguous headlines. The impact score is a model estimate, not a ground truth. The system is most reliable for clear, factual financial news.

---

## What's Next

Things that would make Newsia meaningfully better, in rough order of impact:

- **Supabase Auth** so only you can trigger analysis (30 min to add)
- **Real-time price data** via NSE India's unofficial API or Yahoo Finance to show actual stock prices alongside signals
- **Notification system** via email or Telegram when a high-impact article drops
- **Watchlist** so you can track specific stocks and get personalized signal feeds
- **Portfolio tracker** to map your actual holdings against signals
- **Historical backtesting** to see if the signals would have been useful in the past (spoiler: probably mixed, because markets)
- **More AI models** -- Claude via Anthropic API would be a strong addition to the rotation

---

## Contributing

PRs welcome. If you're adding a new news source, add it to `src/lib/news/rss-fetcher.ts` and test that the RSS parser correctly extracts titles, descriptions, and images. If you're adding a new NIFTY 50 stock (they do get swapped out occasionally), update `src/constants/nifty50-stocks.ts` with symbol, name, sector, and keywords.

Please don't add paid APIs or services without making them optional with clear fallbacks. The zero-cost constraint is a feature, not a limitation.

---

## License

MIT. Do whatever you want with it. If you make money with it, consider buying your financial advisor a coffee. They went to school for this.

---

## Disclaimer

Newsia is a personal project built for educational purposes. It is not SEBI registered. It is not a financial advisor. It is not responsible for any investment decisions you make. The stock signals, sentiment scores, and allocation suggestions are AI-generated indicators based on publicly available news data. Past news sentiment has no guaranteed relationship to future stock performance. Please consult a qualified financial advisor before making investment decisions.

If you read all of that and still put your life savings into a stock because an app told you to, that is on you.

---

Built with curiosity, caffeine, and an unreasonable fondness for monospace fonts.

**[newsia.vercel.app](https://newsia.vercel.app)** -- live demo coming soon