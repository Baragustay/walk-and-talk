// Creates a short-lived Gemini Live token so the browser never sees the real API key.
// Netlify runs this at /.netlify/functions/live-token. In `npm run dev`, vite.config.ts serves it.
import { GoogleGenAI, Modality } from '@google/genai'
import { LIVE_API_VERSION, LIVE_MODEL, TOKEN_LIFETIME_MINUTES } from '../../src/lib/live/model'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

/** Asks Supabase whether the bearer token belongs to a real user. True when Supabase isn't set up. */
async function isLoggedIn(req: Request): Promise<boolean> {
  const url = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) return true
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return false
  const res = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey, Authorization: auth } })
  return res.ok
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405)

  // Only our own pages may ask. (Not bulletproof: non-browser clients can fake Origin.)
  const origin = req.headers.get('origin')
  if (origin && new URL(origin).host !== new URL(req.url).host) return json({ error: 'Forbidden' }, 403)

  // With accounts set up, only logged-in users (including trial accounts) get tokens.
  if (!(await isLoggedIn(req))) return json({ error: 'Please log in' }, 401)

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return json({ error: 'Server is missing GEMINI_API_KEY' }, 500)

  try {
    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: LIVE_API_VERSION } })
    const now = Date.now()
    const token = await ai.authTokens.create({
      config: {
        uses: 1, // one call; reconnecting with session resumption doesn't count as a use
        expireTime: new Date(now + TOKEN_LIFETIME_MINUTES * 60_000).toISOString(),
        newSessionExpireTime: new Date(now + 60_000).toISOString(),
        // Lock only these fields, so the app can still send its own system prompt and tools.
        liveConnectConstraints: { model: LIVE_MODEL, config: { responseModalities: [Modality.AUDIO] } },
        lockAdditionalFields: [],
      },
    })
    return json({ token: token.name, model: LIVE_MODEL, expiresAt: now + TOKEN_LIFETIME_MINUTES * 60_000 })
  } catch (err) {
    console.error('live-token failed', err)
    return json({ error: 'Could not create a token' }, 502)
  }
}
