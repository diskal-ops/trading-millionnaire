import React from 'react'
import { useI18n } from '../../../core/i18n/index.jsx'
import { useAppStore } from '../../../core/store/useAppStore.js'
import { Card, Affirm } from '../../../ui/index.jsx'
import { Gauge } from '../../../ui/Gauge.jsx'
import { THERMOSTAT } from '../data.js'

export default function Thermostat() {
  const { t } = useI18n()
  const { balance, previousHigh } = useAppStore()
  const unknown = balance > previousHigh

  return (
    <div className="stack">
      <h2>{t('thermostat.title')}</h2>

      <Card tone={unknown ? 'alert' : undefined}>
        <Gauge
          comfort={THERMOSTAT.comfortZone}
          high={previousHigh}
          current={balance}
          labels={{
            comfort: t('thermostat.comfort'),
            high: t('thermostat.high'),
            current: t('thermostat.current'),
          }}
        />
      </Card>

      {unknown && (
        <Card tone="alert">
          <div className="faint" style={{ fontSize: 12, marginBottom: 8 }}>⚠ {t('thermostat.unknown')}</div>
          <Affirm>{THERMOSTAT.alerte}</Affirm>
        </Card>
      )}

      <Card tone="calm">
        <p className="muted" style={{ fontSize: 14, margin: 0, lineHeight: 1.5 }}>
          {THERMOSTAT.explication}
        </p>
      </Card>
    </div>
  )
}
