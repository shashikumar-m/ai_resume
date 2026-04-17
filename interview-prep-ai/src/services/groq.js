const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

function getKey() {
  return import.meta.env.VITE_GROQ_API_KEY
}

export async function groqChat(prompt, onChunk) {
  const key = getKey()
  if (!key || key === 'your_groq_api_key_here') {
    throw new Error('Groq API key not set. Add VITE_GROQ_API_KEY to your .env file.')
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      max_tokens: 512,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Groq error: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const lines = decoder.decode(value).split('\n')
    for (const line of lines) {
      const trimmed = line.replace(/^data: /, '').trim()
      if (!trimmed || trimmed === '[DONE]') continue
      try {
        const json = JSON.parse(trimmed)
        const chunk = json.choices?.[0]?.delta?.content
        if (chunk) {
          full += chunk
          onChunk?.(chunk, full)
        }
      } catch {}
    }
  }

  return full
}

export async function checkGroq() {
  const key = getKey()
  return !!(key && key !== 'your_groq_api_key_here')
}
