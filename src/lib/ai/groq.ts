import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function analyzeWithGroq(prompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model:       'llama3-8b-8192',  // free tier model
    temperature: 0.1,
    max_tokens:  512,
    messages: [
      {
        role:    'user',
        content: prompt,
      },
    ],
  })

  return completion.choices[0]?.message?.content ?? ''
}