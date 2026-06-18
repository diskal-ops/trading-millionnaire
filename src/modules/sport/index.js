import React from 'react'

/* ===========================================================
   MODULE SPORT — squelette enfichable (à étoffer plus tard)
   Même contrat d'interface que TRADING.
   Prévu : exercices / charges / progression + RECADRAGE RÉALISTE
   (un homme de 50 ans qui vise 350kg au deadlift est recadré).
   Nutrition liée.
   =========================================================== */

function SportPlaceholder() {
  return React.createElement(
    'div',
    { className: 'stack' },
    React.createElement('h2', null, '🏋️ Sport'),
    React.createElement(
      'p',
      { className: 'muted' },
      'Module enregistré, à étoffer. Suivra : exercices, charges, progression, recadrage réaliste, lien nutrition.',
    ),
  )
}

const sportModule = {
  id: 'sport',
  nom: { fr: 'Sport', en: 'Fitness', pt: 'Desporto', es: 'Deporte', de: 'Sport' },
  icon: '🏋️',
  enabled: true,
  routes: [{ path: '/sport', element: React.createElement(SportPlaceholder) }],
  schemaDonnees: {
    contributesToDailyLog: ['sport_fait', 'nutrition_ok'],
  },
  reglesInsights: [
    // Squelette : règle réaliste à compléter (ex. progression de charge irréaliste)
  ],
}

export default sportModule
