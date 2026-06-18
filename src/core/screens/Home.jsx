import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/index.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { runCorrelations, isTerrainFragile } from '../correlationEngine.js'
import { Card, Button, Affirm, Stat } from '../../ui/index.jsx'
import { marcheDepuisBalance, prochainPalier, ANCRAGES } from '../../modules/trading/data.js'

export default function Home() {
  const { t } = useI18n()
  const nav = useNavigate()
  const { balance, dailyLog } = useAppStore()

  const fragile = useMemo(() => isTerrainFragile(dailyLog), [dailyLog])
  const insights = useMemo(() => runCorrelations(dailyLog), [dailyLog])
  const marche = marcheDepuisBalance(balance)
  const next = prochainPalier(marche)
  const ancrage = ANCRAGES[new Date().getDate() % ANCRAGES.length]

  return (
    <div className="stack">
      <Card tone={fragile ? 'alert' : 'calm'}>
        <div className="faint" style={{ fontSize: 12, marginBottom: 8 }}>
          {fragile ? '⚠ ' + t('home.terrain.fragile') : '○ ' + t('home.terrain.solid')}
        </div>
        <Affirm>{t('home.greeting')}</Affirm>
      </Card>

      <div className="spread">
        <Stat label={t('escalier.current')} value={marche} unit={t('common.step')} tone="gold" />
        <Stat label={t('thermostat.current')} value={`${balance} €`} />
        <Stat label={t('escalier.next')} value={next.label} />
      </div>

      {insights.length > 0 && (
        <Card>
          <div className="faint" style={{ fontSize: 12, marginBottom: 8 }}>{t('nav.insights')}</div>
          <div className="stack" style={{ gap: 10 }}>
            {insights.slice(0, 2).map((i) => (
              <div key={i.id}>
                <strong style={{ color: i.severity === 'fragile' ? 'var(--coral)' : 'var(--gold)' }}>{i.titre}</strong>
                <p className="muted" style={{ margin: '2px 0 0', fontSize: 14 }}>{i.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="stack" style={{ gap: 10 }}>
        <Button onClick={() => nav('/session')}>🎙 {t('home.openSession')}</Button>
        <Button variant="ghost" onClick={() => nav('/morning')}>☀️ {t('home.openMorning')}</Button>
        <Button variant="ghost" onClick={() => nav('/evening')}>🌙 {t('home.openEvening')}</Button>
      </div>

      <p className="serif center muted" style={{ fontSize: 16 }}>« {ancrage} »</p>
    </div>
  )
}
