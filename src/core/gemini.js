/* ===========================================================
   Client Gemini — CÔTÉ FRONTEND
   -----------------------------------------------------------
   ⚠️ La clé Gemini n'est JAMAIS ici. Ce module appelle
   UNIQUEMENT l'Edge Function Supabase `gemini-proxy`, qui
   détient la clé via `supabase secrets set GEMINI_KEY=...`.
   La clé ne touche jamais le navigateur.
   =========================================================== */

import { supabase, hasSupabase } from './supabaseClient.js'

const FN = import.meta.env.VITE_GEMINI_PROXY_FN || 'gemini-proxy'

/**
 * Demande une réponse de coaching courte au proxy Gemini.
 * @param {object} args
 * @param {string} args.system   - consigne système (rôle du coach)
 * @param {string} args.user     - segment de transcription / question
 * @param {object} [args.context]- contexte session (état, coup de pression, etc.)
 * @returns {Promise<string>} texte du coach
 */
export async function coachReply({ system, user, context }) {
  if (!hasSupabase || !supabase) {
    // Mode local : repli déterministe pour développer sans backend.
    return localFallback(user, context)
  }
  try {
    const { data, error } = await supabase.functions.invoke(FN, {
      body: { system, user, context },
    })
    if (error) throw error
    return data?.text?.trim() || localFallback(user, context)
  } catch (e) {
    console.error('[gemini] proxy indisponible, repli local', e)
    return localFallback(user, context)
  }
}

// Repli minimal hors-ligne — garde l'app utile sans backend.
function localFallback(user, context) {
  const pressure = context?.coupDePression
  if (pressure?.rappel) return pressure.rappel
  return 'Respire 3 fois. Reviens au M5. Ton SL est ton seul juge — ne touche à rien.'
}
