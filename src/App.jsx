import React, { useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { registerAllModules } from './modules/index.js'
import { getAllRoutes } from './core/moduleRegistry.js'
import { useI18n } from './core/i18n/index.jsx'
import { useAppStore } from './core/store/useAppStore.js'
import { hasSupabase } from './core/supabaseClient.js'
import { LangToggle } from './ui/index.jsx'
import Home from './core/screens/Home.jsx'
import Insights from './core/screens/Insights.jsx'
import Discipline from './core/screens/Discipline.jsx'
import MentalHandHistory from './modules/trading/screens/MentalHandHistory.jsx'

registerAllModules()

const NAV = [
  { to: '/', key: 'nav.today', icon: '○' },
  { to: '/session', key: 'nav.session', icon: '🎙' },
  { to: '/discipline', key: 'nav.discipline', icon: '🔥' },
  { to: '/escalier', key: 'nav.escalier', icon: '↗' },
  { to: '/insights', key: 'nav.insights', icon: '◇' },
]

export default function App() {
  const { t } = useI18n()
  const moduleRoutes = getAllRoutes()
  const hydrate = useAppStore((s) => s.hydrateFromSupabase)

  useEffect(() => {
    if (hasSupabase) hydrate()
  }, [hydrate])

  return (
    <div className="app-shell">
      <header className="spread" style={{ padding: '18px 0 8px' }}>
        <div className="row" style={{ gap: 10 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--gold)' }} />
          <span style={{ fontWeight: 700, letterSpacing: '0.18em' }}>{t('app.name')}</span>
          <span className="faint" style={{ fontSize: 12 }}>{t('app.tagline')}</span>
        </div>
        <LangToggle />
      </header>

      <main style={{ paddingTop: 8 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discipline" element={<Discipline />} />
          <Route path="/mhh" element={<MentalHandHistory />} />
          <Route path="/insights" element={<Insights />} />
          {moduleRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Routes>
      </main>

      <BottomNav nav={NAV} t={t} />
    </div>
  )
}

function BottomNav({ nav, t }) {
  const loc = useLocation()
  return (
    <nav
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        background: 'rgba(14,15,19,0.92)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--line)',
        padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', justifyContent: 'space-around' }}>
        {nav.map((n) => {
          const active = loc.pathname === n.to
          return (
            <NavLink
              key={n.to}
              to={n.to}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                color: active ? 'var(--gold)' : 'var(--text-faint)',
                fontSize: 11, textDecoration: 'none', padding: '4px 12px',
              }}
            >
              <span style={{ fontSize: 18 }}>{n.icon}</span>
              {t(n.key)}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
