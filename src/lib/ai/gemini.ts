import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function analyzeWithGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',   // free tier model
    generationConfig: {
      temperature:     0.1,       // low = consistent, deterministic output
      maxOutputTokens: 512,
    },
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
}