/* ===========================================================
   Gamification — calme, alignée sur l'identité "observateur
   discipliné". On récompense le PROCESSUS (boucle tenue),
   jamais le gain. Une journée gagnée même avec une perte
   compte autant. Pas d'arousal : or sobre, pas de rouge.
   -----------------------------------------------------------
   XP = somme de points de processus.
   Rang = palier d'XP (noms thématiques Kijun).
   Trophées = jalons binaires (prédicats sur le state).
   =========================================================== */

import { computeStreak, bestStreak } from './discipline.js'
import { marcheDepuisBalance, ESCALIER } from '../modules/trading/data.js'

// Points par action de processus
export const XP = {
  jourTenu: 10, // journée discipline gagnée (même avec perte)
  sessionClose: 5, // session menée jusqu'à CLÔTURE
  rituel: 3, // rituel matin ou soir rempli
  mhh: 8, // Mental Hand History complété
  succes: 5, // accomplissement valorisé
  palier: 20, // palier d'escalier atteint
}

export function computeXP(s) {
  const won = Object.values(s.discipline || {}).filter((v) => v === 'won').length
  const sessionsClose = (s.sessions || []).filter((x) => x.state_final === 'CLOTURE').length
  const rituels = (s.dailyLog || []).filter((d) => d.etat_mental).length
  const mhh = (s.mhhEntries || []).length
  const succes = (s.successJournal || []).length
  const paliers = ESCALIER.paliers.filter((p) => p.marche <= marcheDepuisBalance(s.balance)).length

  return (
    won * XP.jourTenu +
    sessionsClose * XP.sessionClose +
    rituels * XP.rituel +
    mhh * XP.mhh +
    succes * XP.succes +
    paliers * XP.palier
  )
}

// Rangs de l'observateur (thématiques, FR — termes de marque Kijun)
export const RANKS = [
  { min: 0, nom: 'Graine' },
  { min: 60, nom: 'Observateur' },
  { min: 160, nom: 'Observateur discipliné' },
  { min: 360, nom: 'Calme sous pression' },
  { min: 700, nom: 'Maître du M5' },
  { min: 1200, nom: 'Architecte de sa réalité' },
  { min: 2200, nom: 'Kijun' },
]

export function rankFor(xp) {
  let cur = RANKS[0]
  let next = null
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].min) {
      cur = RANKS[i]
      next = RANKS[i + 1] || null
    }
  }
  const span = next ? next.min - cur.min : 1
  const into = next ? xp - cur.min : 1
  return { rank: cur, next, progress: next ? Math.min(1, into / span) : 1 }
}

// Trophées — jalons binaires (icône sobre, jamais agressif)
export const BADGES = [
  { id: 'first_session', icon: '🎙', label: 'Première session', desc: 'Une boucle menée jusqu\'à la clôture.', earned: (s) => (s.sessions || []).some((x) => x.state_final === 'CLOTURE') },
  { id: 'streak3', icon: '🔥', label: 'Série de 3', desc: '3 journées tenues d\'affilée.', earned: (s) => computeStreak(s.discipline) >= 3 },
  { id: 'streak7', icon: '🔥', label: 'Semaine pleine', desc: '7 journées tenues d\'affilée.', earned: (s) => computeStreak(s.discipline) >= 7 },
  { id: 'streak30', icon: '🏔', label: 'Mois discipliné', desc: '30 journées tenues d\'affilée.', earned: (s) => bestStreak(s.discipline) >= 30 },
  { id: 'streak100', icon: '💎', label: 'Centurion calme', desc: '100 journées tenues.', earned: (s) => bestStreak(s.discipline) >= 100 },
  { id: 'first_mhh', icon: '🧭', label: 'Racine trouvée', desc: 'Premier Mental Hand History.', earned: (s) => (s.mhhEntries || []).length >= 1 },
  { id: 'first_success', icon: '🌟', label: 'Boucle fermée', desc: 'Premier succès valorisé.', earned: (s) => (s.successJournal || []).length >= 1 },
  { id: 'first_palier', icon: '↗', label: 'Premier palier', desc: 'Un palier d\'escalier atteint.', earned: (s) => marcheDepuisBalance(s.balance) >= ESCALIER.paliers[0].marche },
  { id: 'loss_held', icon: '🛡', label: 'Tenu dans la perte', desc: 'Journée gagnée malgré une perte : le process avant le résultat.', earned: (s) => (s.dailyLog || []).some((d) => Number(d.trading_resultat) < 0 && s.discipline?.[d.date] === 'won') },
]

export function earnedBadges(s) {
  return BADGES.map((b) => ({ ...b, isEarned: safe(() => b.earned(s)) }))
}

function safe(fn) {
  try { return Boolean(fn()) } catch { return false }
}
