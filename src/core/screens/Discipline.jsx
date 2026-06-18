import React, { useMemo, useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { computeStreak, bestStreak, recentDays } from '../discipline.js'
import { Card, Button, Affirm, Stat } from '../../ui/index.jsx'

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function Discipline() {
  const { t } = useI18n()
  const { discipline, markDiscipline } = useAppStore()

  const streak = useMemo(() => computeStreak(discipline), [discipline])
  const best = useMemo(() => bestStreak(discipline), [discipline])
  const days = useMemo(() => recentDays(discipline, 14), [discipline])
  const todayStatus = discipline[todayISO()] || null

  const [checks, setChecks] = useState({ c1: false, c2: false, c3: false })
  const allChecked = checks.c1 && checks.c2 && checks.c3

  const win = () => markDiscipline(true)
  const miss = () => markDiscipline(false)

  return (
    <div className="stack">
      <h2>🔥 {t('discipline.title')}</h2>
      <p className="muted" style={{ fontSize: 14, marginTop: -8 }}>{t('discipline.subtitle')}</p>

      <Card tone="calm">
        <div className="spread">
          <Stat label={t('discipline.streak')} value={streak} unit={t('discipline.days')} tone="gold" />
          <Stat label={t('discipline.best')} value={best} unit={t('discipline.days')} />
        </div>
      </Card>

      {/* 14 derniers jours */}
      <Card>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {days.map((d) => (
            <div key={d.date} title={d.date} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 22, height: 22, borderRadius: 6,
                  background:
                    d.status === 'won' ? 'var(--gold)' :
                    d.status === 'lost' ? 'var(--coral-soft)' : 'var(--ink-600)',
                  border: '1px solid var(--line)',
                }}
              />
              <span className="mono faint" style={{ fontSize: 9 }}>{d.date.slice(8)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Marquer la journée */}
      <Card tone={todayStatus === 'won' ? 'calm' : todayStatus === 'lost' ? 'alert' : undefined}>
        {todayStatus === 'won' ? (
          <Affirm>✓ {t('discipline.wonToday')}</Affirm>
        ) : (
          <div className="stack" style={{ gap: 12 }}>
            <div className="faint" style={{ fontSize: 12 }}>{t('discipline.today')}</div>
            {[
              ['c1', t('discipline.check1')],
              ['c2', t('discipline.check2')],
              ['c3', t('discipline.check3')],
            ].map(([k, label]) => (
              <label key={k} className="row" style={{ gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={checks[k]}
                  onChange={(e) => setChecks((c) => ({ ...c, [k]: e.target.checked }))}
                />
                <span style={{ fontSize: 15 }}>{label}</span>
              </label>
            ))}
            <Button onClick={win} disabled={!allChecked} style={{ opacity: allChecked ? 1 : 0.5 }}>
              {t('discipline.markWon')}
            </Button>
            <button onClick={miss} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 12 }}>
              {t('discipline.markLost')}
            </button>
          </div>
        )}
      </Card>

      <Card tone="calm">
        <Affirm>{t('discipline.identity')}</Affirm>
      </Card>
    </div>
  )
}
