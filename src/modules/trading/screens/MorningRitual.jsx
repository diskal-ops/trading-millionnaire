import React, { useState } from 'react'
import { useI18n } from '../../../core/i18n/index.jsx'
import { useAppStore } from '../../../core/store/useAppStore.js'
import { Card, Button, Field, Input, Affirm, Stat } from '../../../ui/index.jsx'
import { RITUEL_MATIN, marcheDepuisBalance, prochainPalier } from '../data.js'

export default function MorningRitual() {
  const { t } = useI18n()
  const { balance, setBalance, upsertDailyLog } = useAppStore()

  const [bal, setBal] = useState(balance)
  const [sommeil, setSommeil] = useState('')
  const [sport, setSport] = useState(false)
  const [g1, setG1] = useState('')
  const [g2, setG2] = useState('')
  const [g3, setG3] = useState('')
  const [saved, setSaved] = useState(false)

  const marche = marcheDepuisBalance(Number(bal))
  const objectif = (Number(bal) * 1.1).toFixed(2)
  const next = prochainPalier(marche)

  const save = () => {
    setBalance(Number(bal))
    upsertDailyLog({
      sommeil_h: sommeil ? Number(sommeil) : null,
      sport_fait: sport,
      etat_mental: 'matin',
    })
    setSaved(true)
  }

  return (
    <div className="stack">
      <h2>{t('ritual.morning.title')}</h2>

      <Card>
        <div className="stack">
          <Field label={t('ritual.balanceYesterday')}>
            <Input type="number" inputMode="decimal" value={bal} onChange={(e) => setBal(e.target.value)} />
          </Field>
          <div className="spread">
            <Stat label={t('ritual.objective')} value={`${objectif} €`} tone="gold" />
            <Stat label={t('ritual.currentStep')} value={marche} unit={t('common.step')} />
          </div>
          <div className="muted" style={{ fontSize: 14 }}>
            {t('ritual.nextMilestone')} : <strong style={{ color: 'var(--text)' }}>{next.label}</strong> ({t('common.step')} {next.marche})
          </div>
        </div>
      </Card>

      <Card>
        <div className="stack">
          <Field label={t('ritual.sleptHours')}>
            <Input type="number" inputMode="decimal" value={sommeil} onChange={(e) => setSommeil(e.target.value)} placeholder="7" />
          </Field>
          <label className="row" style={{ gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={sport} onChange={(e) => setSport(e.target.checked)} />
            <span>{t('ritual.sport')}</span>
          </label>
        </div>
      </Card>

      <Card>
        <div className="faint" style={{ fontSize: 12, marginBottom: 8 }}>{t('ritual.gratitude')}</div>
        <div className="stack" style={{ gap: 8 }}>
          <Input value={g1} onChange={(e) => setG1(e.target.value)} placeholder="1." />
          <Input value={g2} onChange={(e) => setG2(e.target.value)} placeholder="2." />
          <Input value={g3} onChange={(e) => setG3(e.target.value)} placeholder="3." />
        </div>
      </Card>

      <Card tone="calm">
        <div className="stack" style={{ gap: 12 }}>
          <Affirm>« {RITUEL_MATIN.croyance} »</Affirm>
          <Affirm>« {RITUEL_MATIN.identite} »</Affirm>
        </div>
      </Card>

      <Button onClick={save}>{saved ? '✓ ' + t('common.saved') : t('common.save')}</Button>
    </div>
  )
}
