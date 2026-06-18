import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/index.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { runCorrelations, isTerrainFragile } from '../correlationEngine.js'
import { computeStreak } from '../discipline.js'
import { Card, Button, Affirm, Stat } from '../../ui/index.jsx'
import { marcheDepuisBalance, prochainPalier, ANCRAGES } from '../../modules/trading/data.js'

export default function Home() {
  const { t } = useI18n()
  const nav = useNavigate()
  const { balance, dailyLog, discipline } = useAppStore()

  const streak = useMemo(() => computeStreak(discipline), [discipline])
  const fragile = useMemo(() => isTerrainFragile(dailyLog), [dailyLog])
  const insights = useMemo(() => runCorrelations(dailyLog), [dailyLog])
  const marche = marcheDepuisBalance(balance)
  const next = prochainPalier(marche)
  const reste = Math.max(0, next.marche - marche)
  const objGain = Math.round(balance * 0.1)
  const cible = Math.round(balance * 1.1)
  const ancrage = ANCRAGES[new Date().getDate() % ANCRAGES.length]

  return (
    <div className="stack">
      {/* Terrain + salutation (compact) */}
      <Card tone={fragile ? 'alert' : 'calm'}>
        <div className="faint" style={{ fontSize: 12, marginBottom: 6 }}>
          {fragile ? '⚠ ' + t('home.terrain.fragile') : '○ ' + t('home.terrain.solid')}
        </div>
        <Affirm>{t('home.greeting')}</Affirm>
      </Card>

      {/* 1) Rituel du matin — en premier */}
      <Button onClick={() => nav('/morning')}>☀️ {t('home.openMorning')}</Button>

      {/* 2) Objectif du jour — le GAIN en héros, pas le solde final */}
      <Card tone="calm">
        <div className="faint" style={{ fontSize: 12 }}>{t('home.objToday')} (+10%)</div>
        <div className="mono" style={{ fontSize: 44, color: 'var(--gold)', lineHeight: 1.05 }}>+{objGain} €</div>
        <div className="mono faint" style={{ fontSize: 13, marginTop: 2 }}>
          {balance} € → {cible} €
        </div>
      </Card>

      {/* 3) Prochaine manifestation = le résultat */}
      <Card>
        <div className="faint" style={{ fontSize: 12, marginBottom: 6 }}>🎯 {t('home.manifest')}</div>
        <div className="serif" style={{ fontSize: 24, color: 'var(--text)' }}>{next.label}</div>
        <div className="mono faint" style={{ fontSize: 13, marginTop: 4 }}>
          {t('escalier.in')} {reste} {reste > 1 ? t('common.steps') : t('common.step')}
          {next.retrait ? ` · ${next.retrait.toLocaleString()} €` : ''}
        </div>
      </Card>

      {/* Repères secondaires */}
      <div className="spread">
        <Stat label={t('discipline.streak')} value={`🔥 ${streak}`} tone="gold" />
        <Stat label={t('escalier.current')} value={marche} unit={t('common.step')} />
        <Stat label={t('thermostat.current')} value={`${balance} €`} />
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

      {/* Actions de la journée */}
      <div className="stack" style={{ gap: 10 }}>
        <Button onClick={() => nav('/session')}>🎙 {t('home.openSession')}</Button>
        <Button variant="ghost" onClick={() => nav('/lot')}>🎯 {t('lot.title')}</Button>
        <Button variant="ghost" onClick={() => nav('/evening')}>🌙 {t('home.openEvening')}</Button>
      </div>

      <p className="serif center muted" style={{ fontSize: 16 }}>« {ancrage} »</p>
    </div>
  )
}
