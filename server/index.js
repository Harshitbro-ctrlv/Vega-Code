import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Groq from 'groq-sdk'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = process.env.PORT || 3001
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors())
app.use(express.json({ limit: '100kb' }))

app.post('/api/explain', async (req, res) => {
  const { code, language = 'auto-detect', depth = 'balanced' } = req.body

  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: 'GROQ_API_KEY is not configured. Add it to your .env file.' })
  }
  if (!code?.trim()) return res.status(400).json({ error: 'Paste some code to explain.' })
  if (code.length > 30000) return res.status(413).json({ error: 'Code is too long. Keep it under 30,000 characters.' })

  const detail = {
    quick: 'Be concise. Focus on the purpose and the most important flow.',
    balanced: 'Give a practical explanation with useful detail but avoid unnecessary theory.',
    deep: 'Explain in depth, including control flow, important language features, complexity, edge cases, and risks.',
  }[depth] || 'Give a practical, balanced explanation.'

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert code reviewer and teacher. Explain code clearly for a developer. ${detail}\nReturn valid JSON only with this exact shape: {"title":"short descriptive title","summary":"2-4 sentence plain-English overview","language":"detected language","steps":[{"title":"short step name","explanation":"clear explanation","lines":"optional line reference"}],"concepts":[{"name":"concept","description":"one-sentence definition"}],"complexity":{"time":"e.g. O(n) or Not applicable","space":"e.g. O(1) or Not applicable","note":"brief reasoning"},"issues":[{"severity":"info|warning|danger","title":"short issue","description":"actionable detail"}]}. If there are no issues, return an empty issues array. Do not use markdown inside JSON strings.`,
        },
        { role: 'user', content: `Language hint: ${language}\n\nCode:\n${code}` },
      ],
    })

    const content = completion.choices[0]?.message?.content
    res.json(JSON.parse(content))
  } catch (error) {
    console.error(error)
    const message = error?.status === 401
      ? 'Your Groq API key is invalid.'
      : 'Groq could not explain this code right now. Please try again.'
    res.status(error?.status || 500).json({ error: message })
  }
})

app.use(express.static(path.join(__dirname, '../dist')))
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(port, () => console.log(`Trace API running on http://localhost:${port}`))
