// ===========================================================
// Edge Function : kijun-gemini-proxy
// -----------------------------------------------------------
// Déployée DANS le projet Robiin, mais TOTALEMENT ISOLÉE :
// elle ne touche aucune table ni aucun trigger de Robiin.
// Elle DÉTIENT la clé Gemini ; le frontend KIJUN l'appelle,
// mais ne voit jamais la clé.
//
// Déploiement (sans toucher la DB de Robiin) :
//   supabase secrets set GEMINI_KEY=... --project-ref <robiin>
//   supabase functions deploy kijun-gemini-proxy --project-ref <robiin> --no-verify-jwt
//
// verify_jwt = false : KIJUN est mono-utilisateur (toi), sans
// flux d'auth. L'accès est protégé par la clé anon + l'URL.
// Quand tu sépares KIJUN dans son projet, on rebranche l'auth.
// ===========================================================
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const GEMINI_KEY = Deno.env.get('GEMINI_KEY')
const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-1.5-flash'
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (!GEMINI_KEY) return json({ error: 'GEMINI_KEY non configurée' }, 500)

  try {
    const { system, user, context } = await req.json()
    if (!user || typeof user !== 'string') return json({ error: 'champ "user" requis' }, 400)

    const userText = user.slice(0, 1200)
    const ctx = context ? `\nContexte session: ${JSON.stringify(context).slice(0, 600)}` : ''

    const body = {
      systemInstruction: system ? { parts: [{ text: String(system).slice(0, 2000) }] } : undefined,
      contents: [{ role: 'user', parts: [{ text: userText + ctx }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 120 },
    }

    const res = await fetch(`${ENDPOINT(MODEL)}?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error('[kijun-gemini-proxy] upstream', res.status, await res.text())
      return json({ error: 'gemini upstream error', status: res.status }, 502)
    }
    const data = await res.json()
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join(' ').trim() ?? ''
    return json({ text })
  } catch (e) {
    console.error('[kijun-gemini-proxy]', e)
    return json({ error: 'bad request' }, 400)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'content-type': 'application/json' } })
}
