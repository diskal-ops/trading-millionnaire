import React, { useState } from 'react'
import { useI18n } from '../../../core/i18n/index.jsx'
import { useAppStore } from '../../../core/store/useAppStore.js'
import { Card, Stat, Field, Input } from '../../../ui/index.jsx'
import { LOT_DISTANCES, LOT_MISES } from '../data.js'

// Tableau d'Ernesto, volontairement simple et approximatif :
// lot = mise (€) / distance (points). Lecture instantanée, aucun calcul broker.
const lotOf = (mise, dist) => (dist ? Number(mise) / Number(dist) : 0)

export default function LotCalc() {
  const { t } = useI18n()
  const { balance } = useAppStore()

  const miseDefaut = Math.round(balance * 0.1)
  const [mise, setMise] = useState(miseDefaut)
  const [dist, setDist] = useState(35)
  const lot = lotOf(mise, dist)

  return (
    <div className="stack">
      <h2>🎯 {t('lot.title')}</h2>
      <p className="muted" style={{ fontSize: 14, marginTop: -8 }}>{t('lot.subtitle')}</p>

      {/* Calcul rapide */}
      <Card>
        <div className="row" style={{ gap: 12 }}>
          <Field label={`${t('lot.mise')} (€)`}>
            <Input type="number" inputMode="decimal" value={mise} onChange={(e) => setMise(e.target.value)} />
          </Field>
          <Field label={t('lot.distance')}>
            <Input type="number" inputMode="decimal" value={dist} onChange={(e) => setDist(e.target.value)} />
          </Field>
        </div>
        <div className="center" style={{ marginTop: 16 }}>
          <Stat label={t('lot.lot')} value={lot ? lot.toFixed(2) : '—'} tone="gold" />
          <p className="faint" style={{ fontSize: 11, marginTop: 4 }}>{t('lot.default10')} : {miseDefaut} €</p>
        </div>
      </Card>

      {/* Grille de lecture instantanée */}
      <Card>
        <div className="faint" style={{ fontSize: 12, marginBottom: 10 }}>{t('lot.grid')}</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="mono" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={th}>pts \ €</th>
                {LOT_MISES.map((m) => <th key={m} style={th}>{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {LOT_DISTANCES.map((d) => (
                <tr key={d}>
                  <td style={{ ...td, color: 'var(--text-dim)' }}>{d}</td>
                  {LOT_MISES.map((m) => {
                    const l = lotOf(m, d)
                    return <td key={m} style={{ ...td, color: l >= 2 ? 'var(--coral)' : 'var(--text)' }}>{l.toFixed(2)}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="faint" style={{ fontSize: 11, marginTop: 10 }}>{t('lot.lotWarn')}</p>
      </Card>
    </div>
  )
}

const th = { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid var(--line)', color: 'var(--text-faint)', fontWeight: 600 }
const td = { textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid var(--ink-700)' }
