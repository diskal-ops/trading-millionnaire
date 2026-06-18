import React, { useState } from 'react'
import { useI18n } from '../../../core/i18n/index.jsx'
import { useAppStore } from '../../../core/store/useAppStore.js'
import { Card, Button, Field, Input, Stat, Affirm } from '../../../ui/index.jsx'
import { marcheDepuisBalance, prochainPalier, SUCCESS_QUESTIONS } from '../data.js'

export default function EveningRitual() {
  const { t } = useI18n()
  const { balance, setBalance, upsertDailyLog, addSuccess } = useAppStore()

  const [bal, setBal] = useState(balance)
  const [sleepPlan, setSleepPlan] = useState('')
  const [nutrition, setNutrition] = useState(true)
  const [feeling, setFeeling] = useState('')
  const [saved, setSaved] = useState(false)
  const [succ, setSucc] = useState(['', '', ''])
  const [succSaved, setSuccSaved] = useState(false)

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

      {/* Valoriser le succès — ferme la boucle (Tendler) */}
      {marche >= next.marche && (
        <Card tone="calm">
          <div className="faint" style={{ fontSize: 12, marginBottom: 8 }}>🌟 {t('success.title')}</div>
          <Affirm>{t('success.intro', { palier: next.label })}</Affirm>
          <div className="stack" style={{ gap: 8, marginTop: 12 }}>
            {SUCCESS_QUESTIONS.map((q, i) => (
              <label key={i}>
                <span className="muted" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>{q}</span>
                <Input value={succ[i]} onChange={(e) => setSucc((s) => s.map((x, j) => (j === i ? e.target.value : x)))} />
              </label>
            ))}
            <Button
              variant="calm"
              disabled={!succ[0].trim()}
              style={{ opacity: succ[0].trim() ? 1 : 0.5 }}
              onClick={() => { addSuccess({ palier: next.label, reponses: succ }); setSuccSaved(true) }}
            >
              {succSaved ? '✓ ' + t('common.saved') : t('success.save')}
            </Button>
          </div>
        </Card>
      )}

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
