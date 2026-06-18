import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

// hasSupabase : un client est disponible (utilisé UNIQUEMENT pour la fonction
// Gemini kijun-gemini-proxy hébergée dans Robiin).
export const hasSupabase = Boolean(url && anon && !url.includes('YOUR-PROJECT'))

// cloudData : faut-il SYNCHRONISER les données dans Supabase ?
// OFF par défaut : KIJUN garde ses données en LOCAL (localStorage), et ne
// touche AUCUNE table de Robiin. On l'activera le jour où KIJUN aura son
// propre projet dédié. Mettre VITE_KIJUN_CLOUD_DATA=true pour l'activer.
export const cloudData = import.meta.env.VITE_KIJUN_CLOUD_DATA === 'true'

// Pas de persistSession : on n'utilise pas l'auth de Robiin (fonction sans JWT).
export const supabase = hasSupabase
  ? createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })
  : null

if (!hasSupabase) {
  console.info('[kijun] Supabase non configuré — coach Gemini en repli local. Remplis .env pour activer le proxy.')
}
