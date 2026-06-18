import React from 'react'

/* Jauge verticale du thermostat de l'argent.
   - confort : zone connue
   - high : ancien plus-haut (rouge)
   - current : balance actuelle
   Quand current > high => territoire inconnu (alerte). */
export function Gauge({ comfort, high, current, labels }) {
  const top = Math.max(high, current) * 1.15 || 100
  const pct = (v) => `${Math.min(100, (v / top) * 100)}%`
  const unknown = current > high

  return (
    <div className="row" style={{ alignItems: 'stretch', gap: 16 }}>
      <div
        style={{
          position: 'relative',
          width: 56,
          minHeight: 220,
          borderRadius: 999,
          background: 'var(--ink-700)',
          border: '1px solid var(--line)',
          overflow: 'hidden',
        }}
      >
        {/* remplissage balance actuelle */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: pct(current),
            background: unknown
              ? 'linear-gradient(180deg, var(--coral) 0%, var(--gold) 100%)'
              : 'linear-gradient(180deg, var(--gold) 0%, var(--gold-dim) 100%)',
            transition: 'height .4s ease',
          }}
        />
        {/* ligne ancien plus-haut */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: pct(high), height: 2, background: 'var(--coral)' }} />
      </div>

      <div className="stack" style={{ justifyContent: 'space-between', gap: 8 }}>
        <Marker color="var(--gold)" label={labels.current} value={`${current} €`} />
        <Marker color="var(--coral)" label={labels.high} value={`${high} €`} />
        <Marker color="var(--text-faint)" label={labels.comfort} value={`≤ ${comfort} €`} />
      </div>
    </div>
  )
}

function Marker({ color, label, value }) {
  return (
    <div>
      <div className="row" style={{ gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />
        <span className="faint" style={{ fontSize: 12 }}>{label}</span>
      </div>
      <div className="mono" style={{ fontSize: 18, marginLeft: 16 }}>{value}</div>
    </div>
  )
}
