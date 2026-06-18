import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../../core/i18n/index.jsx'
import { useSpeech } from '../../../core/hooks/useSpeech.js'
import { useAppStore } from '../../../core/store/useAppStore.js'
import { coachReply } from '../../../core/gemini.js'
import { Card, Button, VoiceToggle, Field, Input } from '../../../ui/index.jsx'
import { STATES, STATE_MESSAGES, voiceTransition } from '../stateMachine.js'
import { classifySignal, detectCoupDePression, coupToPattern } from '../detect.js'
import { LOT_WARNING } from '../data.js'

const COACH_SYSTEM =
  "Tu es KIJUN, le coach de trading d'Ernesto (stratégie Millionnaire, GER40/Nasdaq). " +
  "Tu DIALOGUES avec lui : il te parle, tu lui réponds en UNE ou DEUX phrases courtes, calmes, à la 2e personne (tutoie). " +
  "Fais BAISSER la tension. Rappelle au besoin : le retest est normal, le SL est le seul juge, lire sur M5, ne pas sortir par soulagement. " +
  "Jamais de conseil financier chiffré, jamais d'incitation à pousser.";

export default function SessionLive() {
  const { t, lang } = useI18n()
  const nav = useNavigate()
  const { saveSession, addPattern, balance } = useAppStore()
  const state = useAppStore((s) => s.sessionState)
  const setState = useAppStore((s) => s.setSessionState)
  const voiceOn = useAppStore((s) => s.voiceOn)
  const setVoiceOn = useAppStore((s) => s.setVoiceOn)

  const [transcript, setTranscript] = useState([])
  const [coachMsgs, setCoachMsgs] = useState([])
  const [lastCoup, setLastCoup] = useState(null)
  const [turnText, setTurnText] = useState('') // message en cours de dictée
  const [thinking, setThinking] = useState(false)
  const speakRef = useRef(null)

  // Calcul du lot (carte en bas)
  const [mise, setMise] = useState(Math.round(balance * 0.1))
  const [dist, setDist] = useState(35)
  const lot = dist ? Number(mise) / Number(dist) : 0

  const pushCoach = useCallback((text) => {
    if (!text) return
    setCoachMsgs((m) => [...m, { text, at: Date.now() }])
    speakRef.current?.(text)
  }, [])

  const enterState = useCallback(
    (s) => {
      setState(s)
      const msg = STATE_MESSAGES[s]
      if (msg) pushCoach(msg)
    },
    [pushCoach, setState],
  )

  // Pendant la dictée : on accumule le message (aucune réponse encore)
  const handleSegment = useCallback((text) => {
    if (!text) return
    const signal = classifySignal(text)
    setTranscript((tr) => [...tr, { text, signal }])
    setTurnText((prev) => (prev ? prev + ' ' + text : text).trim())
  }, [])

  const speech = useSpeech({ lang, onFinalSegment: handleSegment, voiceOn })
  speakRef.current = speech.speak

  // ENVOYER : on traite le message et le coach répond (comme un chat)
  const sendTurn = useCallback(async () => {
    const msg = (turnText + ' ' + (speech.interim || '')).trim()
    speech.stop()
    if (!msg) return
    setTurnText('')

    const coup = detectCoupDePression(msg)
    if (coup) {
      setLastCoup(coup)
      const pat = coupToPattern(coup.id)
      if (pat) addPattern(pat)
    }

    // Si la phrase fait changer d'état (« j'ai pris le trade »), le message d'état sert de réponse.
    const trans = voiceTransition(state, msg)
    if (trans) {
      enterState(trans)
      return
    }

    setThinking(true)
    try {
      const reply = await coachReply({
        system: COACH_SYSTEM,
        user: msg,
        context: { etat: state, coupDePression: coup ? { declencheur: coup.declencheur, rappel: coup.rappel } : null },
      })
      pushCoach(reply)
    } finally {
      setThinking(false)
    }
  }, [turnText, speech, state, enterState, addPattern, pushCoach])

  useEffect(() => {
    pushCoach(STATE_MESSAGES[state] || STATE_MESSAGES[STATES.ATTENTE_SETUP])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finish = () => {
    speech.stop()
    saveSession({
      state_final: STATES.CLOTURE,
      transcript: transcript.map((x) => x.text).join(' '),
      patterns: [...new Set(transcript.filter((x) => x.signal === 'rouge').map(() => 'rouge'))],
      coach: coachMsgs.map((m) => m.text),
    })
    setState(STATES.ATTENTE_SETUP)
    nav('/evening')
  }

  const startTalk = () => { setTurnText(''); speech.start() }
  const liveMsg = (turnText + ' ' + (speech.interim || '')).trim()

  return (
    <div className="stack">
      <div className="spread">
        <div>
          <div className="faint" style={{ fontSize: 12 }}>{t('nav.session')}</div>
          <div className="mono" style={{ fontSize: 18, color: 'var(--gold)' }}>{t(`session.state.${state}`)}</div>
        </div>
        <VoiceToggle on={voiceOn} onToggle={() => setVoiceOn(!voiceOn)} />
      </div>

      {/* Coach (conversation) */}
      <Card tone={lastCoup ? 'alert' : undefined}>
        <div className="faint" style={{ fontSize: 12, marginBottom: 8 }}>{t('session.coach')}</div>
        <div className="stack" style={{ gap: 10 }}>
          {coachMsgs.slice(-3).map((m, i) => (
            <p key={i} className="serif" style={{ margin: 0, fontSize: 17, lineHeight: 1.45 }}>{m.text}</p>
          ))}
          {thinking && <p className="faint" style={{ margin: 0, fontSize: 15 }}>…</p>}
        </div>
        {state === STATES.POSITION_PRISE && (
          <p className="muted" style={{ fontSize: 13, marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 10 }}>{LOT_WARNING}</p>
        )}
      </Card>

      {/* Parler → écrire → envoyer */}
      <Card>
        <div className="spread" style={{ marginBottom: 10 }}>
          <span className="faint" style={{ fontSize: 12 }}>{t('session.yourMessage')}</span>
          <span className="mono" style={{ fontSize: 12, color: speech.listening ? 'var(--calm)' : 'var(--text-faint)' }}>
            {speech.listening ? '● ' + t('voice.listening') : t('voice.stopped')}
          </span>
        </div>

        {!speech.supported && (
          <p className="muted" style={{ fontSize: 13 }}>Reconnaissance vocale non supportée (essaie Chrome/Edge).</p>
        )}

        <div style={{ minHeight: 48, background: 'var(--ink-700)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: 15 }}>
          {liveMsg || <span className="faint" style={{ fontStyle: 'italic' }}>{t('voice.talkHint')}</span>}
        </div>

        <div className="row" style={{ marginTop: 12, gap: 10 }}>
          {speech.listening ? (
            <Button onClick={sendTurn}>➤ {t('voice.send')}</Button>
          ) : (
            <Button variant="calm" onClick={startTalk} disabled={!speech.supported}>🎙 {t('voice.talk')}</Button>
          )}
          {!speech.listening && liveMsg && (
            <Button variant="ghost" onClick={sendTurn}>➤ {t('voice.send')}</Button>
          )}
        </div>
      </Card>

      {/* Contrôles d'état */}
      <Card>
        <div className="stack" style={{ gap: 10 }}>
          {state === STATES.ATTENTE_SETUP && (
            <Button onClick={() => enterState(STATES.SETUP_CONFIRME)}>{t('session.confirmSetup')}</Button>
          )}
          {state === STATES.SETUP_CONFIRME && (
            <Button onClick={() => enterState(STATES.POSITION_PRISE)}>{t('session.took')}</Button>
          )}
          {state === STATES.POSITION_PRISE && (
            <Button variant="calm" onClick={() => enterState(STATES.GESTION)}>{t('common.next')} → {t('session.state.GESTION')}</Button>
          )}
          {state === STATES.GESTION && (
            <Button variant="alert" onClick={finish}>{t('session.closeDay')}</Button>
          )}
        </div>
      </Card>

      {/* Calcul du lot — en bas, fait partie de la session */}
      <Card>
        <div className="faint" style={{ fontSize: 12, marginBottom: 10 }}>🎯 {t('lot.title')}</div>
        <div className="row" style={{ gap: 12, alignItems: 'flex-end' }}>
          <Field label={`${t('lot.mise')} (€)`}>
            <Input type="number" inputMode="decimal" value={mise} onChange={(e) => setMise(e.target.value)} />
          </Field>
          <Field label={t('lot.distance')}>
            <Input type="number" inputMode="decimal" value={dist} onChange={(e) => setDist(e.target.value)} />
          </Field>
          <div style={{ textAlign: 'center', minWidth: 64 }}>
            <div className="faint" style={{ fontSize: 11 }}>{t('lot.lot')}</div>
            <div className="mono" style={{ fontSize: 26, color: lot >= 2 ? 'var(--coral)' : 'var(--gold)' }}>{lot ? lot.toFixed(2) : '—'}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
