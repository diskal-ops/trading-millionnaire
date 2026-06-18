import React, { useState } from 'react'
import { useI18n } from '../../../core/i18n/index.jsx'
import { useAppStore } from '../../../core/store/useAppStore.js'
import { Card, Button, Field, Input, Stat } from '../../../ui/index.jsx'
import { marcheDepuisBalance, prochainPalier } from '../data.js'

export default function EveningRitual() {
  const { t } = useI18n()
  const { balance, setBalance, upsertDailyLog } = useAppStore()

  const [bal, setBal] = useState(balance)
  const [sleepPlan, setSleepPlan] = useState('')
  const [nutrition, setNutrition] = useState(true)
  const [feeling, setFeeling] = useState('')
  const [saved, setSaved] = useState(false)

  const marche = marcheDepuisBalance(Number(bal))
  const next = prochainPalier(marche)
  const result = Number(bal) - balance

  const save = () => {
    setBalance(Number(bal))
    upsertDailyLog({
      trading_resultat: result,
      nutrition_ok: nutrition,
      etat_mental: feeling || 'soir',
    })
    setSaved(true)
  }

  return (
    <div className="stack">
      <h2>{t('ritual.evening.title')}</h2>

      <Card>
        <div className="stack">
          <Field label={t('ritual.balanceToday')}>
            <Input type="number" inputMode="decimal" value={bal} onChange={(e) => setBal(e.target.value)} />
          </Field>
          <div className="spread">
            <Stat label={t('ritual.currentStep')} value={marche} unit={t('common.step')} />
            <Stat label={t('ritual.nextMilestone')} value={next.label} />
          </div>
          {marche >= next.marche && (
            <div className="serif" style={{ color: 'var(--gold)' }}>
              🎉 Palier atteint : {next.label}. Célèbre, ancre, ne saute pas de marche.
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="stack">
          <Field label={t('ritual.sleep')}>
            <Input type="number" inputMode="decimal" value={sleepPlan} onChange={(e) => setSleepPlan(e.target.value)} placeholder="8" />
          </Field>
          <label className="row" style={{ gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={nutrition} onChange={(e) => setNutrition(e.target.checked)} />
            <span>{t('ritual.nutrition')}</span>
          </label>
          <Field label={t('ritual.feeling')}>
            <Input value={feeling} onChange={(e) => setFeeling(e.target.value)} placeholder="…" />
          </Field>
        </div>
      </Card>

      <Button onClick={save}>{saved ? '✓ ' + t('common.saved') : t('common.save')}</Button>
    </div>
  )
}
