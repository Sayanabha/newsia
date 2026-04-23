import { analyzeWithGemini } from './gemini'
import { analyzeWithGroq }   from './groq'

export interface ArticleAnalysis {
  sentiment:       'positive' | 'negative' | 'neutral'
  sentiment_score: number      // -1.0 to 1.0
  importance:      'high' | 'medium' | 'low'
  category:        'economy' | 'company' | 'global' | 'policy'
  entities:        string[]    // company/sector names found
  impact_score:    number      // 0 to 100
  reasoning:       string      // why this score
}

// The prompt we send to the AI
function buildPrompt(title: string, description: string): string {
  return `You are a financial analyst specializing in Indian stock markets (NIFTY 50, SENSEX).

Analyze this news article and respond with ONLY a valid JSON object — no markdown, no explanation, no code blocks.

Article title: "${title}"
Article description: "${description}"

Respond with exactly this JSON structure:
{
  "sentiment": "positive" | "negative" | "neutral",
  "sentiment_score": <number from -1.0 to 1.0>,
  "importance": "high" | "medium" | "low",
  "category": "economy" | "company" | "global" | "policy",
  "entities": [<list of company names, sectors, or indices mentioned>],
  "impact_score": <number from 0 to 100>,
  "reasoning": "<one sentence explaining the score>"
}

Scoring guide:
- importance "high": RBI decisions, major earnings, market crashes, policy changes
- importance "medium": sector news, mid-cap moves, economic indicators  
- importance "low": minor news, opinion pieces, international news with low India impact
- impact_score 80-100: major market-moving event
- impact_score 50-79: moderate impact on specific sectors
- impact_score 0-49: low or indirect impact`
}

// Safely parse the AI response — handles messy output
function parseAnalysis(raw: string): ArticleAnalysis | null {
  try {
    // Strip markdown code blocks if AI includes them despite instructions
    const cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    // Validate required fields exist
    if (!parsed.sentiment || !parsed.importance || !parsed.category) {
      return null
    }

    return {
      sentiment:       parsed.sentiment,
      sentiment_score: Number(parsed.sentiment_score ?? 0),
      importance:      parsed.importance,
      category:        parsed.category,
      entities:        Array.isArray(parsed.entities) ? parsed.entities : [],
      impact_score:    Number(parsed.impact_score ?? 0),
      reasoning:       parsed.reasoning ?? '',
    }
  } catch {
    return null
  }
}

// Try Gemini first, fall back to Groq if it fails
export async function analyzeArticle(
  title: string,
  description: string
): Promise<ArticleAnalysis | null> {
  const prompt = buildPrompt(title, description ?? '')

  // Try Gemini first
  try {
    const raw    = await analyzeWithGemini(prompt)
    const result = parseAnalysis(raw)
    if (result) {
      console.log(`[AI] Gemini analyzed: "${title.slice(0, 50)}..."`)
      return result
    }
  } catch (err: any) {
    console.warn('[AI] Gemini failed, trying Groq...', err.message)
  }

  // Fall back to Groq
  try {
    const raw    = await analyzeWithGroq(prompt)
    const result = parseAnalysis(raw)
    if (result) {
      console.log(`[AI] Groq analyzed: "${title.slice(0, 50)}..."`)
      return result
    }
  } catch (err: any) {
    console.warn('[AI] Groq also failed:', err.message)
  }

  return null
}