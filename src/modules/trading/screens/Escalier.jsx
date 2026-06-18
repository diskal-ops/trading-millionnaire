import React from 'react'
import { useI18n } from '../../../core/i18n/index.jsx'
import { useAppStore } from '../../../core/store/useAppStore.js'
import { Card, Stat } from '../../../ui/index.jsx'
import { ESCALIER, marcheDepuisBalance, prochainPalier } from '../data.js'

export default function Escalier() {
  const { t } = useI18n()
  const { balance } = useAppStore()
  const marche = marcheDepuisBalance(balance)
  const next = prochainPalier(marche)
  const reste = Math.max(0, next.marche - marche)

  return (
    <div className="stack">
      <h2>{t('escalier.title')}</h2>

      <Card tone="calm">
        <div className="spread">
          <Stat label={t('escalier.current')} value={marche} unit={t('common.step')} tone="gold" />
          <div className="center">
            <div className="faint" style={{ fontSize: 12 }}>{t('escalier.next')}</div>
            <div className="serif" style={{ fontSize: 18 }}>{next.label}</div>
            <div className="mono faint" style={{ fontSize: 12 }}>
              {t('escalier.in')} {reste} {reste > 1 ? t('common.steps') : t('common.step')}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {ESCALIER.paliers.map((p) => {
            const done = marche >= p.marche
            const current = p.marche === next.marche
            return (
              <li
                key={p.marche}
                className="spread"
                style={{
                  padding: '10px 0',
                  borderBottom: '1px solid var(--line)',
                  opacity: done ? 0.5 : 1,
                }}
              >
                <div className="row" style={{ gap: 12 }}>
                  <span
                    className="mono"
                    style={{
                      width: 34, textAlign: 'right',
                      color: current ? 'var(--gold)' : done ? 'var(--calm)' : 'var(--text-faint)',
                    }}
                  >
                    {done ? '✓' : 'm' + p.marche}
                  </span>
                  <span style={{ fontWeight: current ? 700 : 400, color: current ? 'var(--gold)' : 'var(--text)' }}>
                    {p.label}
                  </span>
                </div>
                {p.retrait != null && (
                  <span className="mono faint" style={{ fontSize: 13 }}>−{p.retrait.toLocaleString()} €</span>
                )}
              </li>
            )
          })}
        </ol>
      </Card>

      <p className="serif center muted" style={{ fontSize: 16 }}>{t('escalier.final')}</p>
    </div>
  )
}
