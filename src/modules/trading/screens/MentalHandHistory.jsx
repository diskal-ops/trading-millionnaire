import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useI18n } from '../../../core/i18n/index.jsx'
import { useAppStore } from '../../../core/store/useAppStore.js'
import { Card, Button } from '../../../ui/index.jsx'
import { MHH_STEPS, MHH_CORRECTIONS, SABOTAGES } from '../data.js'

/* Outil central de Tendler : trouver et corriger la racine.
   Peut être pré-rempli depuis une session (pattern détecté). */
export default function MentalHandHistory() {
  const { t } = useI18n()
  const nav = useNavigate()
  const loc = useLocation()
  const { saveMHH, mhhEntries } = useAppStore()

  const patternId = loc.state?.pattern || ''
  const initial = MHH_STEPS.reduce((acc, s) => {
    acc[s.key] = s.key === 'correction' && patternId ? MHH_CORRECTIONS[patternId] || '' : ''
    return acc
  }, {})

  const [vals, setVals] = useState(initial)
  const [saved, setSaved] = useState(false)
  const patternLabel = SABOTAGES.find((p) => p.id === patternId)?.titre

  const set = (k, v) => setVals((s) => ({ ...s, [k]: v }))
  const canSave = vals.probleme?.trim() && vals.correction?.trim()

  const save = () => {
    saveMHH({ pattern: patternId || null, ...vals })
    setSaved(true)
    setTimeout(() => nav('/discipline'), 700)
  }

  return (
    <div className="stack">
      <h2>🧭 {t('mhh.title')}</h2>
      <p className="muted" style={{ fontSize: 14, marginTop: -8 }}>{t('mhh.subtitle')}</p>
      {patternLabel && (
        <Card tone="alert"><span className="muted" style={{ fontSize: 13 }}>{t('mhh.from')} : <strong style={{ color: 'var(--coral)' }}>{patternLabel}</strong></span></Card>
      )}

      {MHH_STEPS.map((s, i) => (
        <Card key={s.key}>
          <label style={{ display: 'block' }}>
            <span className="row" style={{ gap: 8, marginBottom: 8 }}>
              <span className="mono" style={{ color: 'var(--gold)' }}>{i + 1}.</span>
              <span style={{ fontSize: 15 }}>{s.q}</span>
            </span>
            <textarea
              value={vals[s.key]}
              onChange={(e) => set(s.key, e.target.value)}
              rows={s.key === 'correction' ? 3 : 2}
              style={{
                width: '100%', background: 'var(--ink-700)', border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '10px 12px',
                fontSize: 15, fontFamily: 'inherit', resize: 'vertical',
              }}
            />
          </label>
        </Card>
      ))}

      <Button onClick={save} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5 }}>
        {saved ? '✓ ' + t('common.saved') : t('mhh.save')}
      </Button>

      {mhhEntries.length > 0 && (
        <Card>
          <div className="faint" style={{ fontSize: 12, marginBottom: 8 }}>{t('mhh.history')} ({mhhEntries.length})</div>
          <div className="stack" style={{ gap: 10 }}>
            {mhhEntries.slice(0, 5).map((e) => (
              <div key={e.id} style={{ borderLeft: '2px solid var(--calm)', paddingLeft: 10 }}>
                <div className="mono faint" style={{ fontSize: 11 }}>{e.date}</div>
                <div style={{ fontSize: 14 }}>{e.correction}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
