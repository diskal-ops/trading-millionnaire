/* ===========================================================
   MODULE TRADING — données EXACTES (ne rien inventer)
   Profil : Ernesto — "Millionnaire Strategy", GER40 & Nasdaq.
   =========================================================== */

// --- Setup de référence ---
export const SETUP = {
  buy: '3 EMA alignées + prix au-dessus Kijun H1 reportée M1 + 3 confirmations (BOS, FVG/Imbalance, Divergence RSI). Entrée au franchissement Tenkan/Kijun M1. SL au dernier plus-bas. TP = (entrée→SL) × 2.',
  objectif: '+10% / jour',
  lecture: 'M5 pour lire (calme). M1 UNIQUEMENT pour l\'entrée.',
}

// --- Les 5 patterns de sabotage (8 sessions dictaphone) ---
export const SABOTAGES = [
  { id: 'sortie_soulagement', titre: 'Sortie-soulagement', desc: 'Ferme pour stopper la tension, pas au signal.' },
  { id: 'insatisfaction_gain', titre: 'Insatisfaction post-gain', desc: 'La récompense ne "ferme" pas la boucle.' },
  { id: 'glissement_objectif', titre: "Glissement d'objectif", desc: 'Sous pression, "+10%" devient "revenir à zéro".' },
  { id: 'pousser_prix', titre: '"Pousser le prix"', desc: 'Illusion de contrôle → annonce les mauvaises décisions.' },
  { id: 'sensibilite_terrain', titre: 'Sensibilité au terrain', desc: 'Sommeil court / sport raté / perturbation = jour fragile et friction avec les proches.' },
]

// --- Les 3 COUPS DE PRESSION (cœur du module, mots exacts) ---
export const COUPS_DE_PRESSION = [
  {
    id: 1,
    declencheur: 'Le prix revient tester mon niveau de départ',
    note: 'son défaut n°1',
    rappel:
      "Le retest est NORMAL après franchissement Tenkan/Kijun (reprise de liquidité). Ton SL est ton seul juge, pas le retest. Regarde M5, ferme M1.",
    // mots qui le déclenchent dans la transcription
    triggers: ['revient', 'retest', 'teste mon niveau', 'niveau de départ', 'revenir à zéro', 'retourne'],
  },
  {
    id: 2,
    declencheur: "J'ai envie d'enlever avant le TP",
    note: 'peur du retournement',
    rappel:
      'Sortie par soulagement, pas par signal. Tenkan + RSI bordent le prix. Laisse courir.',
    triggers: ['enlever', "j'enlève", 'je retire', 'avant le tp', 'fermer', 'ça retourne', 'retournement'],
  },
  {
    id: 3,
    declencheur: 'Je perds le fil / je veux pousser',
    note: 'perte de contrôle',
    rappel:
      'Checklist : RSI dans le sens ? Tenkan borde le prix ? Sur M5 ? Respire 3 fois.',
    triggers: ['perds le fil', 'je pousse', 'pousser', 'je veux y aller', "envie d'y aller", 'rattraper'],
  },
]

// --- Phrases-signal (détection live) ---
export const PHRASES_SIGNAL = {
  rouge: [
    'cœur qui bat', 'coeur qui bat', 'stress', 'pression', "envie d'y aller", 'revenir à zéro',
    'rattraper', 'je pousse', 'ça vibre', 'ça m\'excite', 'excité', 'insatisfait',
    "j'enlève", 'je retire', 'j\'enleve',
  ],
  vert: [
    "j'observe", "j'attends", 'patience', "je m'abandonne", 'calme', 'léger', 'leger',
    "j'ai fait ma journée", 'je ferme', 'rsi', 'tenkan', 'm5', 'setup', 'validé', 'valide', 'tp',
  ],
}

// --- Note "lot à 2" (montants qui bougent vite) ---
export const LOT_WARNING =
  "Lot à 2 : les chiffres bougent plus vite → plus de stress. Ne regarde pas trop les montants pendant le trade. Lis la structure, pas l'argent.";

// --- THERMOSTAT INTERNE DE L'ARGENT ---
export const THERMOSTAT = {
  comfortZone: 480,
  previousHigh: 820, // ancien plus-haut (rouge)
  alerte:
    "Tu es en territoire inconnu pour ton thermostat. C'est ICI que l'inconscient veut te ramener en arrière. Ne pousse pas. Ferme la journée. Ancre le palier en achetant ce qui est prévu.",
  explication:
    "Chaque palier retiré sous 24h remonte le thermostat d'un cran. Ne jamais sauter de marche.",
}

// --- ESCALIER DE MANIFESTATION (données réelles, +10%/jour) ---
// marche -> palier (retrait éventuel en €)
export const ESCALIER = {
  balanceDepart: 711,
  croissanceJour: 0.1, // +10% / jour
  paliers: [
    { marche: 5, label: 'Jean' },
    { marche: 8, label: 'Hoodie' },
    { marche: 12, label: 'Poêle inox 28cm' },
    { marche: 18, label: 'Pouf', retrait: 120 },
    { marche: 22, label: 'Jordan Horizon' },
    { marche: 26, label: '3 chaises' },
    { marche: 31, label: 'Lit fille', retrait: 350 },
    { marche: 37, label: 'Bureau assis-debout', retrait: 450 },
    { marche: 42, label: 'PS5', retrait: 550 },
    { marche: 46, label: 'Frigo', retrait: 600 },
    { marche: 51, label: 'Écran Dell 49"', retrait: 1000 },
    { marche: 54, label: 'Lit 160×200', retrait: 1000 },
    { marche: 60, label: 'Voyage Angola', retrait: 2000 },
    { marche: 68, label: 'Thaïlande', retrait: 5000 },
    { marche: 78, label: '10000€ parents', retrait: 15000 },
    { marche: 98, label: 'Panamera', retrait: 100000 },
    { marche: 108, label: 'Création entreprise', retrait: 100000 },
    { marche: 139, label: '20 MILLIONS' },
    { marche: 177, label: 'Appartement', retrait: 600000 },
    { marche: 183, label: 'Maison', retrait: 2500000 },
  ],
  objectifFinal: { marche: 139, montant: 20000000 },
}

// Marche actuelle estimée à partir de la balance (départ * 1.1^n)
export function marcheDepuisBalance(balance, depart = ESCALIER.balanceDepart) {
  if (!balance || balance <= 0) return 0
  const n = Math.log(balance / depart) / Math.log(1 + ESCALIER.croissanceJour)
  return Math.max(0, Math.round(n))
}

export function prochainPalier(marche) {
  return ESCALIER.paliers.find((p) => p.marche > marche) || ESCALIER.paliers.at(-1)
}

// --- RITUELS ---
export const RITUEL_MATIN = {
  croyance: "Le trading est simple, je n'ai rien à maîtriser, je dois juste attendre.",
  identite:
    "Je ne suis pas quelqu'un qui gagne, je suis un observateur discipliné. Je crée ma réalité et ce ne sont que des chiffres. Je me dissocie de la personne que je suis.",
}

// --- Affirmations / ancrages ---
export const ANCRAGES = [
  'Le retest est normal. Mon SL est mon seul juge.',
  'Je lis la structure sur M5. Je ferme sur M1.',
  'Ce ne sont que des chiffres. Je reste léger.',
  "J'ai fait ma journée. Je ferme MT4 et TradingView.",
]
