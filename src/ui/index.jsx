import React from 'react'
import { useI18n, LANGS } from '../core/i18n/index.jsx'

/* ===========================================================
   Composants UI partagés — calmes, sobres, accessibles.
   =========================================================== */

export function Card({ children, tone, style, ...rest }) {
  const border =
    tone === 'alert' ? 'var(--coral-soft)' : tone === 'calm' ? 'var(--calm)' : 'var(--line)'
  return (
    <section
      style={{
        background: 'var(--ink-800)',
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius)',
        padding: 18,
        boxShadow: 'var(--shadow)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </section>
  )
}

export function Button({ children, variant = 'solid', style, ...rest }) {
  const base = {
    border: '1px solid transparent',
    borderRadius: 'var(--radius-sm)',
    padding: '13px 18px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background .15s ease, border-color .15s ease',
    width: '100%',
  }
  const variants = {
    solid: { background: 'var(--gold)', color: '#1A1206' },
    ghost: { background: 'transparent', color: 'var(--text)', borderColor: 'var(--line)' },
    calm: { background: 'transparent', color: 'var(--calm)', borderColor: 'var(--calm)' },
    alert: { background: 'transparent', color: 'var(--coral)', borderColor: 'var(--coral-soft)' },
  }
  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {children}
    </button>
  )
}

// Affirmation = humain (serif)
export function Affirm({ children }) {
  return (
    <p className="serif" style={{ fontSize: 19, lineHeight: 1.5, color: 'var(--text)', margin: 0 }}>
      {children}
    </p>
  )
}

// Chiffre = terminal (monospace)
export function Stat({ value, unit, label, tone }) {
  const color = tone === 'gold' ? 'var(--gold)' : tone === 'alert' ? 'var(--coral)' : 'var(--text)'
  return (
    <div>
      {label && <div className="faint" style={{ fontSize: 12, marginBottom: 4 }}>{label}</div>}
      <div className="mono" style={{ fontSize: 26, color }}>
        {value}
        {unit && <span style={{ fontSize: 14, color: 'var(--text-dim)' }}> {unit}</span>}
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span className="muted" style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  )
}

export function Input(props) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        background: 'var(--ink-700)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text)',
        padding: '12px 14px',
        fontSize: 16,
        fontFamily: props.type === 'number' ? 'var(--font-mono)' : 'inherit',
        ...props.style,
      }}
    />
  )
}

export function VoiceToggle({ on, onToggle }) {
  const { t } = useI18n()
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      style={{
        background: 'transparent',
        border: `1px solid ${on ? 'var(--gold)' : 'var(--line)'}`,
        color: on ? 'var(--gold)' : 'var(--text-dim)',
        borderRadius: 999,
        padding: '8px 14px',
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      {on ? '🔊 ' + t('voice.on') : '🔈 ' + t('voice.off')}
    </button>
  )
}

export function LangToggle() {
  const { lang, setLang } = useI18n()
  return (
    <div className="row" style={{ gap: 4 }}>
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            background: 'transparent',
            border: 'none',
            color: lang === l ? 'var(--gold)' : 'var(--text-faint)',
            fontWeight: lang === l ? 700 : 400,
            cursor: 'pointer',
            fontSize: 13,
            textTransform: 'uppercase',
          }}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
