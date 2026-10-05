// Supabase Edge Function: swaps the secret Gemini key for a short-lived Live API token.
// The key lives in Supabase secrets (GEMINI_API_KEY), never in the app, GitHub or Hostinger.
// Deploy: npx supabase functions deploy live-token --no-verify-jwt   (we check the login below)

const LIVE_MODEL = 'gemini-3.8-live' // same as src/lib/live/model.ts
const TOKEN_LIFETIME_MINUTES = 45 // longest walk (30 min) + quiz
const TRIAL_MINUTES = 30 // trial (anonymous) accounts: enough for the level call

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
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors(origin), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })

  if (req.method === 'OPTIONS') return new Response(null, { headers: cors(origin) })
  if (req.method !== 'POST') return json({ error: 'Use POST' }, 405)
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return json({ error: 'Forbidden' }, 403)

  // Who is asking? Ask Supabase Auth about the bearer token.
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

  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) return json({ error: 'Server is missing the Gemini API key' }, 500)

  const now = Date.now()
  const expiresAt = now + TOKEN_LIFETIME_MINUTES * 60_000
  const res = await fetch('https://generativelanguage.googleapis.com/v1alpha/auth_tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      expireTime: new Date(expiresAt).toISOString(),
      newSessionExpireTime: new Date(now + 60_000).toISOString(),
      uses: 1, // one call; resuming the session doesn't count as a use
      // Lock only these, so the app can send its own system prompt and tools.
      bidiGenerateContentSetup: { model: `models/${LIVE_MODEL}`, generationConfig: { responseModalities: ['AUDIO'] } },
      fieldMask: 'model,generationConfig.responseModalities',
    }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.name) {
    console.error('auth_tokens failed', res.status)
    return json({ error: 'Could not create a token' }, 502)
  }
  return json({ token: data.name, model: LIVE_MODEL, expiresAt })
})
