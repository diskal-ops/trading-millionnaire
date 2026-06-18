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
  // Reformulation tirée du livre (peur = incertitude ; falaise → parcours ; montagne sous le nuage)
  reframe:
    "Ce n'est pas un saut dans le vide. Augmenter la mise n'est pas une décision définitive : que je gagne ou perde, le parcours continue. Sous le nuage, il y a une montagne solide — mon avantage prouvé. Je ne pousse pas, je ferme et j'ancre.",
  explication:
    "Chaque palier retiré sous 24h remonte le thermostat d'un cran. Ne jamais sauter de marche.",
}

// --- ESCALIER DE MANIFESTATION (données réelles, +10%/jour) ---
// marche -> palier (retrait éventuel en €)
export const ESCALIER = {
  balanceDepart: 230, // jour 1 de la feuille "Book1 manifestation" (et non 711)
  croissanceJour: 0.1, // +10% / jour
  // marche = numéro de jour ouvrable (colonne "Niveau" de la feuille).
  // retrait = ponction sur la balance (gros achats). Les petits achats
  // (Jean, Hoodie, Poêle, Jordan) sont payés par la Cagnotte, sans retrait.
  paliers: [
    { marche: 5, label: 'Jean' },
    { marche: 8, label: 'Hoodie' },
    { marche: 12, label: 'Poêle inox 28cm' },
    { marche: 18, label: 'Pouf', retrait: 120 },
    { marche: 22, label: 'Jordan Horizon' },
    { marche: 26, label: '3 chaises', retrait: 150 },
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
    { marche: 177, label: 'Appartement', retrait: 600000 },
    { marche: 179, label: '20 MILLIONS 🎯' },
    { marche: 183, label: 'Maison', retrait: 2500000 },
  ],
  objectifFinal: { marche: 179, montant: 20000000 },
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
    "Je gagne en respectant mon setup. La discipline et la constance sont les clés de mon succès. J'ai foi en mon trading et en Dieu qui m'a donné ce talent.",
}

// --- Affirmations / ancrages ---
export const ANCRAGES = [
  'Le retest est normal. Mon SL est mon seul juge.',
  'Je lis la structure sur M5. Je ferme sur M1.',
  'Ce ne sont que des chiffres. Je reste léger.',
  "J'ai fait ma journée. Je ferme MT4 et TradingView.",
]

// ===========================================================
// MENTAL HAND HISTORY (Jared Tendler, "Le Jeu Mental du Trading")
// L'outil central de correction de la racine. 5 étapes.
// ===========================================================
export const MHH_STEPS = [
  { key: 'probleme', q: 'Quel est le problème ?' },
  { key: 'pourquoi', q: 'Pourquoi le problème existe-t-il ?' },
  { key: 'errone', q: "Qu'est-ce qui est erroné dans cette pensée ?" },
  { key: 'correction', q: 'Quelle est la correction ?' },
  { key: 'logique', q: 'Quelle logique confirme cette correction ?' },
]

// Corrections suggérées par pattern (pré-remplissage de l'étape "correction")
export const MHH_CORRECTIONS = {
  sortie_soulagement:
    "Sortie par soulagement, pas par signal. Le retest est normal après franchissement Tenkan/Kijun. Mon SL/TP est le seul juge. Je laisse courir, le parcours continue.",
  pousser_prix:
    "Ambition maîtrisée : je sais quand pousser mon avantage et quand m'arrêter. Je lis la structure sur M5, pas l'argent. Pousser le prix est une illusion de contrôle.",
  insatisfaction_gain:
    "Le succès n'est pas 'normal', il mérite reconnaissance. La boucle se ferme par l'ancrage du palier, pas par le chiffre suivant.",
  glissement_objectif:
    "Mon objectif est fixé par le plan (+10%), pas par l'émotion. 'Revenir à zéro' est un signal de tilt, pas un objectif.",
  thermostat:
    "Peu importe la mise, chaque trade exerce mon avantage. Augmenter n'est pas une décision définitive : que je gagne ou perde, le parcours continue.",
}

// --- Valoriser ses accomplissements (Tendler p.78) — ferme la boucle ---
export const SUCCESS_QUESTIONS = [
  'Pourquoi cet accomplissement est-il précieux ?',
  "Qu'est-ce qui le rendait difficile à atteindre ?",
  'Comment as-tu réussi — quels efforts, et qu\'as-tu appris ?',
]

// --- Balance cible pour une marche donnée (jour n) ---
export function balancePourMarche(n, depart = ESCALIER.balanceDepart) {
  return depart * Math.pow(1 + ESCALIER.croissanceJour, n)
}

// ===========================================================
// CALCUL DU LOT (le tableau d'Ernesto, approximatif, lecture instantanée)
// lot = mise (€) / distance (points). Ex. : 70 € / 35 pts → lot 2.0
// Pas de détail broker : c'est volontairement simple.
// ===========================================================
export const LOT_DISTANCES = [10, 15, 20, 25, 30, 40, 50, 70] // points
export const LOT_MISES = [20, 40, 60, 80, 120] // €
