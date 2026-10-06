// Supabase Edge Function: reads a word or short phrase aloud in Buddy's voice (Gemini TTS),
// so flashcards sound like the calls. Returns a WAV file. Same login rules as live-token.
// Deploy: npx supabase functions deploy speak --no-verify-jwt

const TTS_MODEL = 'gemini-3.8-flash-tts'
const BUDDY_VOICE = 'Sulafat' // same as src/lib/live/model.ts
const MAX_CHARS = 200
const TRIAL_MINUTES = 30

const ALLOWED_ORIGINS = [
  'https://buddy.barboragustafsson.com',
  'https://localhost:5180',
  'http://localhost:5180',
  'https://192.168.1.79:5180',
]

function cors(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors(origin), 'Content-Type': 'application/json' } })

  if (req.method === 'OPTIONS') return new Response(null, { headers: cors(origin) })
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405)
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return json({ error: 'Forbidden' }, 403)

  const auth = req.headers.get('authorization') ?? ''
  if (!auth.startsWith('Bearer ')) return json({ error: 'Please log in' }, 401)
  const userRes = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/user`, {
    headers: { apikey: Deno.env.get('SUPABASE_ANON_KEY') ?? '', Authorization: auth },
  })
  if (!userRes.ok) return json({ error: 'Please log in' }, 401)
  const user = await userRes.json()
  if (user.is_anonymous && Date.now() - Date.parse(user.created_at) > TRIAL_MINUTES * 60_000) {
    return json({ error: 'Please log in' }, 401)
  }

  const { text } = await req.json().catch(() => ({ text: '' }))
  const clean = String(text ?? '').trim().slice(0, MAX_CHARS)
  if (!clean) return json({ error: 'Nothing to say' }, 400)

  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) return json({ error: 'Server is missing the Gemini API key' }, 500)

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      // Only the text: the TTS model reads instructions aloud if you add any.
      contents: [{ parts: [{ text: clean }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: BUDDY_VOICE } } },
      },
    }),
  })
  const data = await res.json().catch(() => null)
  const audio = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData
  if (!res.ok || !audio?.data) {
    console.error('tts failed', res.status)
    return json({ error: 'Could not make audio' }, 502)
  }
  const bytes = Uint8Array.from(atob(audio.data), (c) => c.charCodeAt(0))
  return new Response(bytes, {
    headers: { ...cors(origin), 'Content-Type': audio.mimeType || 'audio/wav', 'Cache-Control': 'private, max-age=2592000' },
  })
})
