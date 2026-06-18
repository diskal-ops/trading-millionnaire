import React, { useMemo } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { runCorrelations } from '../correlationEngine.js'
import { Card } from '../../ui/index.jsx'

const TONE = { fragile: 'alert', warn: undefined, info: 'calm' }

export default function Insights() {
  const { t } = useI18n()
  const { dailyLog, sessions } = useAppStore()
  const insights = useMemo(() => runCorrelations(dailyLog), [dailyLog])

  return (
    <div className="stack">
      <h2>{t('nav.insights')}</h2>
      <p className="muted" style={{ fontSize: 14, marginTop: -8 }}>
        Tout est lié. Le moteur lit les données de tous les modules.
      </p>

      {insights.length === 0 && (
        <Card tone="calm"><p className="muted" style={{ margin: 0 }}>Rien à signaler. Terrain stable.</p></Card>
      )}

      {insights.map((i) => (
        <Card key={i.id} tone={TONE[i.severity]}>
          <div className="spread" style={{ marginBottom: 6 }}>
            <strong style={{ color: i.severity === 'fragile' ? 'var(--coral)' : 'var(--gold)' }}>{i.titre}</strong>
            <span className="mono faint" style={{ fontSize: 11 }}>{i.moduleId}</span>
          </div>
          <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{i.detail}</p>
        </Card>
      ))}

      <Card>
        <div className="faint" style={{ fontSize: 12, marginBottom: 8 }}>Sessions récentes</div>
        {sessions.length === 0 ? (
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>Aucune session enregistrée.</p>
        ) : (
          <div className="stack" style={{ gap: 8 }}>
            {sessions.slice(0, 8).map((s) => (
              <div key={s.id} className="spread">
                <span className="mono faint" style={{ fontSize: 13 }}>{s.date}</span>
                <span style={{ fontSize: 13 }}>{s.state_final}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
