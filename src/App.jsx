import React, { useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { registerAllModules } from './modules/index.js'
import { getAllRoutes } from './core/moduleRegistry.js'
import { useI18n } from './core/i18n/index.jsx'
import { useAppStore } from './core/store/useAppStore.js'
import { cloudData } from './core/supabaseClient.js'
import { syncNow } from './core/driveSync.js'
import { preload as preloadDrive } from './core/drive.js'
import Home from './core/screens/Home.jsx'
import Insights from './core/screens/Insights.jsx'
import Discipline from './core/screens/Discipline.jsx'
import MentalHandHistory from './modules/trading/screens/MentalHandHistory.jsx'

registerAllModules()

const NAV = [
  { to: '/', key: 'nav.today', icon: 'home' },
  { to: '/session', key: 'nav.session', icon: 'mic' },
  { to: '/discipline', key: 'nav.discipline', icon: 'calendar' },
  { to: '/escalier', key: 'nav.escalier', icon: 'stairs' },
  { to: '/insights', key: 'nav.insights', icon: 'chart' },
]

export default function App() {
  const { t } = useI18n()
  const moduleRoutes = getAllRoutes()
  const hydrate = useAppStore((s) => s.hydrateFromSupabase)
  const driveEnabled = useAppStore((s) => s.driveEnabled)

  useEffect(() => {
    if (cloudData) hydrate()
    preloadDrive() // charge Google Identity tôt (fiabilité du login mobile)
  }, [hydrate])

  // Synchro Drive : au chargement (pull) + à la fermeture/mise en arrière-plan (push)
  useEffect(() => {
    if (!driveEnabled) return
    syncNow({ silent: true }).catch(() => {})
    const onHide = () => {
      if (document.visibilityState === 'hidden') syncNow({ silent: true }).catch(() => {})
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [driveEnabled])

  return (
    <div className="app-shell">
      <header className="spread" style={{ padding: '18px 0 8px' }}>
        <div className="row" style={{ gap: 10 }}>
          <img src="/favicon.svg" alt="" width="24" height="24" style={{ borderRadius: 6 }} />
          <span style={{ fontWeight: 700, letterSpacing: '0.18em' }}>{t('app.name')}</span>
          <span className="faint" style={{ fontSize: 12 }}>{t('app.tagline')}</span>
        </div>
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

function NavIcon({ name, size = 22 }) {
  const c = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
  }
  switch (name) {
    case 'home':
      return <svg {...c}><path d="M4 12l8-7 8 7" /><path d="M6 10.5V20h12v-9.5" /></svg>
    case 'mic':
      return <svg {...c}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></svg>
    case 'calendar':
      return <svg {...c}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 9h16M8 3v4M16 3v4" /></svg>
    case 'stairs':
      return <svg {...c}><path d="M3 20h5v-5h5v-5h5v-5" /></svg>
    case 'chart':
      return <svg {...c}><path d="M4 4v16h16" /><path d="M7 15l3-4 3 2 4-6" /></svg>
    default:
      return null
  }
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
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
        {nav.map((n) => {
          const active = loc.pathname === n.to
          return (
            <NavLink
              key={n.to}
              to={n.to}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                color: active ? 'var(--gold)' : '#FFFFFF',
                fontSize: 12, lineHeight: 1, textDecoration: 'none',
                padding: '2px 8px', width: 64, textAlign: 'center',
              }}
            >
              <span style={{ height: 24, display: 'flex', alignItems: 'center' }}><NavIcon name={n.icon} /></span>
              <span style={{ whiteSpace: 'nowrap' }}>{t(n.key)}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
