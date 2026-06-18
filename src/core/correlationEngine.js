/* ===========================================================
   Moteur de corrélations (transverse, cœur)
   -----------------------------------------------------------
   « Tout est lié. » Lit le daily_log de TOUS les modules et
   fait remonter des insights transverses.

   Chaque module déclare ses propres règles (reglesInsights).
   Le moteur les agrège ici + ajoute des règles cœur.

   Une règle = (window) => insight | null
   window = tableau de daily_log triés du plus récent au plus ancien :
     { date, sommeil_h, sport_fait, nutrition_ok,
       trading_resultat, etat_mental, patterns_detectes[] }
   insight = { id, severity: 'info'|'warn'|'fragile', titre, detail }
   =========================================================== */

import { getAllInsightRules } from './moduleRegistry.js'

// ---- Règles cœur (transverses, indépendantes des modules) ----
const coreRules = [
  // Sommeil court aujourd'hui -> terrain fragile
  function sommeilCourt(window) {
    const today = window[0]
    if (!today) return null
    if (today.sommeil_h != null && today.sommeil_h < 6) {
      return {
        id: 'core.sommeil_court',
        severity: 'fragile',
        titre: 'Terrain fragile',
        detail: `Nuit de ${today.sommeil_h}h. Sommeil court = jour fragile. Réduis la taille, observe plus, ne pousse pas.`,
      }
    }
    return null
  },

  // Corrélation : nuits courtes <-> sorties prématurées sur 7 jours
  function nuitsCourtesVsSorties(window) {
    const w = window.slice(0, 7)
    const nuitsCourtes = w.filter((d) => d.sommeil_h != null && d.sommeil_h < 6).length
    const sortiesPrematurees = w.filter((d) =>
      (d.patterns_detectes || []).includes('sortie_soulagement'),
    ).length
    if (nuitsCourtes >= 3 && sortiesPrematurees >= 2) {
      return {
        id: 'core.sommeil_sorties',
        severity: 'warn',
        titre: 'Une corrélation se dessine',
        detail: `${nuitsCourtes} nuits < 6h cette semaine, et ${sortiesPrematurees} sorties prématurées en trading. Ton terrain pilote ta discipline.`,
      }
    }
    return null
  },

  // Sport raté + nutrition KO le même jour
  function terrainPhysique(window) {
    const today = window[0]
    if (!today) return null
    if (today.sport_fait === false && today.nutrition_ok === false) {
      return {
        id: 'core.terrain_physique',
        severity: 'warn',
        titre: 'Énergie basse',
        detail: 'Sport raté + nutrition KO. Moins d\'énergie, plus de friction. Sois doux avec toi et avec tes proches aujourd\'hui.',
      }
    }
    return null
  },
]

export function runCorrelations(dailyLog = []) {
  // tri décroissant par date
  const window = [...dailyLog].sort((a, b) => (a.date < b.date ? 1 : -1))

  const moduleRules = getAllInsightRules() // [{ moduleId, rule }]
  const allRules = [
    ...coreRules.map((rule) => ({ moduleId: 'core', rule })),
    ...moduleRules,
  ]

  const insights = []
  for (const { moduleId, rule } of allRules) {
    try {
      const res = rule(window)
      if (res) insights.push({ moduleId, ...res })
    } catch (e) {
      console.error(`[correlations] règle ${moduleId} a échoué`, e)
    }
  }

  // les plus graves d'abord
  const order = { fragile: 0, warn: 1, info: 2 }
  return insights.sort((a, b) => order[a.severity] - order[b.severity])
}

// Le terrain du jour est-il fragile ?
export function isTerrainFragile(dailyLog = []) {
  return runCorrelations(dailyLog).some((i) => i.severity === 'fragile')
}
