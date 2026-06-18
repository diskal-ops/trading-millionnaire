import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/index.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { computeStreak, bestStreak } from '../discipline.js'
import { computeXP, rankFor, earnedBadges } from '../gamification.js'
import { Card, Button, Affirm, Stat } from '../../ui/index.jsx'

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function Discipline() {
  const { t } = useI18n()
  const nav = useNavigate()
  const state = useAppStore()
  const { discipline, markDiscipline } = state

  const streak = useMemo(() => computeStreak(discipline), [discipline])
  const best = useMemo(() => bestStreak(discipline), [discipline])
  const xp = useMemo(() => computeXP(state), [state])
  const { rank, next, progress } = useMemo(() => rankFor(xp), [xp])
  const badges = useMemo(() => earnedBadges(state), [state])
  const todayStatus = discipline[todayISO()] || null

  const [checks, setChecks] = useState({ c1: false, c2: false, c3: false })
  const allChecked = checks.c1 && checks.c2 && checks.c3

  return (
    <div className="stack">
      <h2>🔥 {t('discipline.title')}</h2>
      <p className="muted" style={{ fontSize: 14, marginTop: -8 }}>{t('discipline.subtitle')}</p>

      {/* Rang + XP */}
      <Card tone="calm">
        <div className="spread" style={{ marginBottom: 10 }}>
          <div>
            <div className="faint" style={{ fontSize: 12 }}>{t('gam.rank')}</div>
            <div className="serif" style={{ fontSize: 20, color: 'var(--gold)' }}>{rank.nom}</div>
          </div>
          <Stat label="XP" value={xp} tone="gold" />
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'var(--ink-600)', overflow: 'hidden' }}>
          <div style={{ width: `${Math.round(progress * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))', transition: 'width .4s ease' }} />
        </div>
        {next && <div className="faint mono" style={{ fontSize: 11, marginTop: 6 }}>{next.min - xp} XP → {next.nom}</div>}
      </Card>

      <Card>
        <div className="spread">
          <Stat label={t('discipline.streak')} value={streak} unit={t('discipline.days')} tone="gold" />
          <Stat label={t('discipline.best')} value={best} unit={t('discipline.days')} />
        </div>
      </Card>

      {/* Calendrier du mois (trading 5j/7) */}
      <MonthCalendar discipline={discipline} />

      {/* Marquer la journée */}
      <Card tone={todayStatus === 'won' ? 'calm' : todayStatus === 'lost' ? 'alert' : undefined}>
        {todayStatus === 'won' ? (
          <Affirm>✓ {t('discipline.wonToday')}</Affirm>
        ) : (
          <div className="stack" style={{ gap: 12 }}>
            <div className="faint" style={{ fontSize: 12 }}>{t('discipline.today')}</div>
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>{t('discipline.evenLoss')}</p>
            {[['c1', t('discipline.check1')], ['c2', t('discipline.check2')], ['c3', t('discipline.check3')]].map(([k, label]) => (
              <label key={k} className="row" style={{ gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={checks[k]} onChange={(e) => setChecks((c) => ({ ...c, [k]: e.target.checked }))} />
                <span style={{ fontSize: 15 }}>{label}</span>
              </label>
            ))}
            <Button onClick={() => markDiscipline(true)} disabled={!allChecked} style={{ opacity: allChecked ? 1 : 0.5 }}>
              {t('discipline.markWon')}
            </Button>
            <button onClick={() => markDiscipline(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 12 }}>
              {t('discipline.markLost')}
            </button>
          </div>
        )}
      </Card>

      {/* Trophées */}
      <Card>
        <div className="faint" style={{ fontSize: 12, marginBottom: 12 }}>🏆 {t('gam.badges')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {badges.map((b) => (
            <div key={b.id} className="row" style={{ gap: 10, opacity: b.isEarned ? 1 : 0.35 }}>
              <span style={{ fontSize: 22, filter: b.isEarned ? 'none' : 'grayscale(1)' }}>{b.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: b.isEarned ? 'var(--gold)' : 'var(--text-dim)' }}>{b.label}</div>
                <div className="faint" style={{ fontSize: 11, lineHeight: 1.3 }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Button variant="ghost" onClick={() => nav('/mhh')}>🧭 {t('mhh.open')}</Button>

      <Card tone="calm"><Affirm>{t('discipline.identity')}</Affirm></Card>
    </div>
  )
}

const navBtn = { background: 'transparent', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', fontSize: 16 }

function MonthCalendar({ discipline }) {
  const [offset, setOffset] = useState(0)
  const base = new Date()
  base.setDate(1)
  base.setMonth(base.getMonth() + offset)
  const year = base.getFullYear()
  const month = base.getMonth()
  const monthName = base.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const startDow = (new Date(year, month, 1).getDay() + 6) % 7 // lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayIso = new Date().toISOString().slice(0, 10)

  const cells = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dow = new Date(year, month, d).getDay()
    cells.push({ d, iso, status: discipline[iso] || null, weekend: dow === 0 || dow === 6, today: iso === todayIso })
  }
  const wd = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  return (
    <Card>
      <div className="spread" style={{ marginBottom: 12 }}>
        <button onClick={() => setOffset((o) => o - 1)} style={navBtn}>‹</button>
        <span className="mono" style={{ fontSize: 14, textTransform: 'capitalize' }}>{monthName}</span>
        <button onClick={() => setOffset((o) => Math.min(0, o + 1))} style={{ ...navBtn, opacity: offset >= 0 ? 0.3 : 1 }} disabled={offset >= 0}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {wd.map((w, i) => (
          <div key={'h' + i} className="faint" style={{ textAlign: 'center', fontSize: 11 }}>{w}</div>
        ))}
        {cells.map((c, i) => {
          if (!c) return <div key={i} />
          const bg = c.status === 'won' ? 'var(--gold)' : c.status === 'lost' ? 'var(--coral-soft)' : 'transparent'
          const color = c.status === 'won' ? '#1A1206' : c.weekend ? 'var(--text-faint)' : 'var(--text)'
          return (
            <div
              key={i}
              className="mono"
              style={{
                aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8, background: bg,
                border: c.today ? '2px solid var(--gold)' : '1px solid var(--ink-600)',
                opacity: c.weekend && !c.status ? 0.4 : 1, fontSize: 13, color,
              }}
            >
              {c.d}
            </div>
          )
        })}
      </div>
      <div className="row" style={{ gap: 16, marginTop: 12, justifyContent: 'center' }}>
        <span className="row" style={{ gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--gold)' }} /><span className="faint" style={{ fontSize: 11 }}>tenu</span></span>
        <span className="row" style={{ gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--coral-soft)' }} /><span className="faint" style={{ fontSize: 11 }}>manqué</span></span>
      </div>
    </Card>
  )
}
