/* ===========================================================
   Discipline / course de fond
   -----------------------------------------------------------
   La constance ne se mesure PAS en gains, mais en jours tenus.
   Une journée est "gagnée" si la boucle de discipline est
   respectée (setup non forcé, pas de sortie-soulagement,
   journée fermée) — même à +0%.

   Les jours sans trade ne cassent pas la série (repos permis) :
   on ne compte que les jours explicitement marqués.
   =========================================================== */

// Série en cours : jours 'won' consécutifs depuis le plus récent.
export function computeStreak(map = {}) {
  const dates = Object.keys(map).sort().reverse()
  let streak = 0
  for (const d of dates) {
    if (map[d] === 'won') streak++
    else break
  }
  return streak
}

// Meilleure série historique.
export function bestStreak(map = {}) {
  const dates = Object.keys(map).sort()
  let best = 0
  let cur = 0
  for (const d of dates) {
    if (map[d] === 'won') {
      cur++
      best = Math.max(best, cur)
    } else {
      cur = 0
    }
  }
  return best
}

// N derniers jours calendaires avec leur statut ('won'|'lost'|null).
export function recentDays(map = {}, n = 14) {
  const out = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    out.push({ date: iso, status: map[iso] || null, weekday: d.getDay() })
  }
  return out
}
