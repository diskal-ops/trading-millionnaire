// ===========================================================
// Edge Function : gemini-proxy
// -----------------------------------------------------------
// ⚠️ DÉTIENT LA CLÉ GEMINI. Le frontend l'appelle, mais ne voit
// jamais la clé. Déploiement :
//   supabase secrets set GEMINI_KEY=...      (clé gemini-ziinga-prod)
//   supabase functions deploy gemini-proxy
//
// Sécurité : la fonction exige un JWT Supabase valide (verify_jwt
// activé par défaut). Le frontend appelle via supabase.functions.invoke.
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

  if (!GEMINI_KEY) {
    return json({ error: 'GEMINI_KEY non configurée (supabase secrets set GEMINI_KEY=...)' }, 500)
  }

  try {
    const { system, user, context } = await req.json()
    if (!user || typeof user !== 'string') return json({ error: 'champ "user" requis' }, 400)

    // Garde-fous : segments courts, réponses courtes (coaching live).
    const userText = user.slice(0, 1200)
    const ctx = context ? `\nContexte session: ${JSON.stringify(context).slice(0, 600)}` : ''

    const body = {
      systemInstruction: system
        ? { parts: [{ text: String(system).slice(0, 2000) }] }
        : undefined,
      contents: [{ role: 'user', parts: [{ text: userText + ctx }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 120 },
    }

    const res = await fetch(`${ENDPOINT(MODEL)}?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error('[gemini-proxy] upstream error', res.status, detail)
      return json({ error: 'gemini upstream error', status: res.status }, 502)
    }

    const data = await res.json()
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join(' ').trim() ?? ''

    return json({ text })
  } catch (e) {
    console.error('[gemini-proxy]', e)
    return json({ error: 'bad request' }, 400)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'content-type': 'application/json' },
  })
}
