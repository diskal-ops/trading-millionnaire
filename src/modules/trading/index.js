import React from 'react'
import SessionLive from './screens/SessionLive.jsx'
import MorningRitual from './screens/MorningRitual.jsx'
import EveningRitual from './screens/EveningRitual.jsx'
import Thermostat from './screens/Thermostat.jsx'
import Escalier from './screens/Escalier.jsx'
import LotCalc from './screens/LotCalc.jsx'

/* ===========================================================
   MODULE TRADING — contrat d'interface
   Le cœur le découvre via le registre. Aucune modif du cœur.
   =========================================================== */

const tradingModule = {
  id: 'trading',
  nom: { fr: 'Trading', en: 'Trading', pt: 'Trading', es: 'Trading', de: 'Trading' },
  icon: '📈',
  enabled: true,

  // Écrans exposés (routes à plat, montées par le cœur)
  routes: [
    { path: '/session', element: React.createElement(SessionLive), nav: { labelKey: 'nav.session', order: 2 } },
    { path: '/escalier', element: React.createElement(Escalier), nav: { labelKey: 'nav.escalier', order: 3 } },
    { path: '/morning', element: React.createElement(MorningRitual) },
    { path: '/evening', element: React.createElement(EveningRitual) },
    { path: '/thermostat', element: React.createElement(Thermostat) },
    { path: '/lot', element: React.createElement(LotCalc) },
  ],

  // Forme des données persistées par le module
  schemaDonnees: {
    session: ['date', 'state_final', 'transcript', 'patterns', 'coach'],
    contributesToDailyLog: ['trading_resultat', 'patterns_detectes', 'etat_mental'],
  },

  // Règles d'insight déclarées par le module (agrégées par le moteur de corrélations)
  reglesInsights: [
    // Insatisfaction répétée après gain sur 7 jours
    function insatisfactionRecurrente(window) {
      const count = window
        .slice(0, 7)
        .filter((d) => (d.patterns_detectes || []).includes('insatisfaction_gain')).length
      if (count >= 2) {
        return {
          id: 'trading.insatisfaction',
          severity: 'info',
          titre: 'La boucle ne se ferme pas',
          detail: `${count} jours d'insatisfaction post-gain cette semaine. La récompense vient de l'ancrage (achat du palier), pas du chiffre.`,
        }
      }
      return null
    },
    // "Pousser le prix" détecté aujourd'hui
    function pousserAujourdhui(window) {
      const today = window[0]
      if (today && (today.patterns_detectes || []).includes('pousser_prix')) {
        return {
          id: 'trading.pousser',
          severity: 'warn',
          titre: 'Illusion de contrôle',
          detail: 'Tu as voulu "pousser le prix" aujourd\'hui. Reviens au M5, RSI dans le sens, Tenkan borde. Tu observes.',
        }
      }
      return null
    },
  ],
}

export default tradingModule
