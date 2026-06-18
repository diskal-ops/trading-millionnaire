/* ===========================================================
   Session de trading = machine à états.
   ATTENTE_SETUP → SETUP_CONFIRME → POSITION_PRISE → GESTION → CLOTURE
   Transition par bouton OU par la voix ("j'ai pris le trade").
   =========================================================== */

export const STATES = {
  ATTENTE_SETUP: 'ATTENTE_SETUP',
  SETUP_CONFIRME: 'SETUP_CONFIRME',
  POSITION_PRISE: 'POSITION_PRISE',
  GESTION: 'GESTION',
  CLOTURE: 'CLOTURE',
}

export const ORDER = [
  STATES.ATTENTE_SETUP,
  STATES.SETUP_CONFIRME,
  STATES.POSITION_PRISE,
  STATES.GESTION,
  STATES.CLOTURE,
]

// Messages déclenchés à l'entrée d'un état
export const STATE_MESSAGES = {
  [STATES.ATTENTE_SETUP]:
    'Es-tu sûr de ton setup ? 3 EMA + Kijun + BOS + FVG + RSI ?',
  [STATES.SETUP_CONFIRME]:
    'Setup validé. Attends le franchissement Tenkan/Kijun M1. Tu observes, tu ne forces rien.',
  [STATES.POSITION_PRISE]:
    'Tu viens d\'entrer. Le coup de pression va arriver. Reste calme, observe le M5, ne touche à rien tant que le SL n\'est pas touché.',
  [STATES.GESTION]:
    'Gestion. Tenkan borde le prix, RSI dans le sens. Tu laisses courir jusqu\'au TP.',
  [STATES.CLOTURE]:
    'Tu as fait ta journée. Ferme MT4 et TradingView. Ancre le palier.',
}

export function nextState(current) {
  const i = ORDER.indexOf(current)
  return i < ORDER.length - 1 ? ORDER[i + 1] : current
}

// Détection de transition par la voix
export function voiceTransition(current, text) {
  const t = text.toLowerCase()
  if (current === STATES.ATTENTE_SETUP && /(setup.*(validé|valide|ok)|c'est bon|confirmé)/.test(t))
    return STATES.SETUP_CONFIRME
  if (/(j'ai pris|je suis (dedans|entré|rentré)|position prise|j'entre)/.test(t))
    return STATES.POSITION_PRISE
  if (/(j'ai fait ma journée|je ferme|je clôture|terminé pour aujourd'hui)/.test(t))
    return STATES.CLOTURE
  return null
}
