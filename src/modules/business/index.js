import React from 'react'

/* ===========================================================
   MODULE BUSINESS — squelette enfichable (à étoffer plus tard)
   Même contrat d'interface que TRADING.
   Prévu : suivi projets (TAABL, Ziinga, Robiin…), objectifs, focus.
   =========================================================== */

function BusinessPlaceholder() {
  return React.createElement(
    'div',
    { className: 'stack' },
    React.createElement('h2', null, '💼 Business'),
    React.createElement(
      'p',
      { className: 'muted' },
      'Module enregistré, à étoffer. Suivra : projets (TAABL…), objectifs, focus.',
    ),
  )
}

const businessModule = {
  id: 'business',
  nom: { fr: 'Business', en: 'Business', pt: 'Negócios', es: 'Negocios', de: 'Business' },
  icon: '💼',
  enabled: true,
  routes: [{ path: '/business', element: React.createElement(BusinessPlaceholder) }],
  schemaDonnees: { contributesToDailyLog: [] },
  reglesInsights: [],
}

export default businessModule
