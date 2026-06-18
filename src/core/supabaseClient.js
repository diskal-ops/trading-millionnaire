import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

// L'app fonctionne en mode "local/démo" tant que Supabase n'est pas branché.
export const hasSupabase = Boolean(url && anon && !url.includes('YOUR-PROJECT'))

export const supabase = hasSupabase
  ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } })
  : null

if (!hasSupabase) {
  console.info('[kijun] Supabase non configuré — mode local (localStorage). Remplis .env pour activer la mémoire longue.')
}
