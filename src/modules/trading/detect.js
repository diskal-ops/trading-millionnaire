import { PHRASES_SIGNAL, COUPS_DE_PRESSION } from './data.js'

/* Analyse temps réel d'un segment de transcription. */

const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g')
function norm(s) {
  return s.toLowerCase().normalize('NFD').replace(DIACRITICS, '')
}

// Classe un segment : 'rouge' | 'vert' | null
export function classifySignal(text) {
  const t = norm(text)
  const red = PHRASES_SIGNAL.rouge.some((p) => t.includes(norm(p)))
  const green = PHRASES_SIGNAL.vert.some((p) => t.includes(norm(p)))
  if (red && !green) return 'rouge'
  if (green && !red) return 'vert'
  if (red && green) return 'rouge' // le rouge prime (prudence)
  return null
}

// Détecte quel coup de pression (1,2,3) le segment évoque
export function detectCoupDePression(text) {
  const t = norm(text)
  for (const coup of COUPS_DE_PRESSION) {
    if (coup.triggers.some((trig) => t.includes(norm(trig)))) return coup
  }
  return null
}

// Mappe un coup de pression vers un pattern de sabotage pour le daily_log
export function coupToPattern(coupId) {
  return { 1: 'sortie_soulagement', 2: 'sortie_soulagement', 3: 'pousser_prix' }[coupId] || null
}
