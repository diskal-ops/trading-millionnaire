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
  "Tu es KIJUN, coach de trading d'Ernesto (stratégie Millionnaire, GER40/Nasdaq). " +
  "Réponds en UNE ou DEUX phrases courtes, calmes, à la 2e personne. Fais BAISSER la tension. " +
  "Rappelle : le retest est normal, le SL est le seul juge, lire sur M5, ne pas sortir par soulagement. " +
  "Jamais de conseil financier chiffré, jamais d'incitation à pousser.";

export default function SessionLive() {
  const { t, lang } = useI18n()
  const nav = useNavigate()
  const { saveSession, addPattern, balance } = useAppStore()
  // État de session PERSISTANT (reste à travers la navigation)
  const state = useAppStore((s) => s.sessionState)
  const setState = useAppStore((s) => s.setSessionState)
  const voiceOn = useAppStore((s) => s.voiceOn)
  const setVoiceOn = useAppStore((s) => s.setVoiceOn)

  const [transcript, setTranscript] = useState([])
  const [coachMsgs, setCoachMsgs] = useState([])
  const [lastCoup, setLastCoup] = useState(null)
  const transcriptRef = useRef(null)
  const speakRef = useRef(null)

  // Calcul du lot (avant de valider le setup)
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

  const handleSegment = useCallback(
    async (text) => {
      if (!text) return
      const signal = classifySignal(text)
      setTranscript((tr) => [...tr, { text, signal }])

      const trans = voiceTransition(state, text)
      if (trans) enterState(trans)

      const coup = detectCoupDePression(text)
      if (coup) {
        setLastCoup(coup)
        const pat = coupToPattern(coup.id)
        if (pat) addPattern(pat)
      }

      if (state === STATES.GESTION || state === STATES.POSITION_PRISE) {
        if (coup) {
          pushCoach(coup.rappel)
        } else if (signal === 'rouge') {
          const reply = await coachReply({
            system: COACH_SYSTEM,
            user: text,
            context: { etat: state, coupDePression: lastCoup },
          })
          pushCoach(reply)
        }
      }
    },
    [state, enterState, addPattern, pushCoach, lastCoup],
  )

  const speech = useSpeech({ lang, onFinalSegment: handleSegment, voiceOn })
  speakRef.current = speech.speak

  // Message d'accueil pour l'état COURANT (reprise de session incluse)
  useEffect(() => {
    pushCoach(STATE_MESSAGES[state] || STATE_MESSAGES[STATES.ATTENTE_SETUP])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' })
  }, [transcript])

  const finish = () => {
    speech.stop()
    saveSession({
      state_final: STATES.CLOTURE,
      transcript: transcript.map((x) => x.text).join(' '),
      patterns: [...new Set(transcript.filter((x) => x.signal === 'rouge').map(() => 'rouge'))],
      coach: coachMsgs.map((m) => m.text),
    })
    setState(STATES.ATTENTE_SETUP) // prêt pour la prochaine session
    nav('/evening') // → mettre à jour le solde + ressenti
  }

  return (
    <div className="stack">
      <div className="spread">
        <div>
          <div className="faint" style={{ fontSize: 12 }}>{t('nav.session')}</div>
          <div className="mono" style={{ fontSize: 18, color: 'var(--gold)' }}>
            {t(`session.state.${state}`)}
          </div>
        </div>
        <VoiceToggle on={voiceOn} onToggle={() => setVoiceOn(!voiceOn)} />
      </div>

      {/* Coach */}
      <Card tone={lastCoup ? 'alert' : undefined}>
        <div className="faint" style={{ fontSize: 12, marginBottom: 8 }}>{t('session.coach')}</div>
        <div className="stack" style={{ gap: 10 }}>
          {coachMsgs.slice(-3).map((m, i) => (
            <p key={i} className="serif" style={{ margin: 0, fontSize: 17, lineHeight: 1.45 }}>
              {m.text}
            </p>
          ))}
        </div>
        {state === STATES.POSITION_PRISE && (
          <p className="muted" style={{ fontSize: 13, marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
            {LOT_WARNING}
          </p>
        )}
      </Card>

      {/* Dictaphone */}
      <Card>
        <div className="spread" style={{ marginBottom: 10 }}>
          <span className="faint" style={{ fontSize: 12 }}>{t('session.transcript')}</span>
          <span className="mono" style={{ fontSize: 12, color: speech.listening ? 'var(--calm)' : 'var(--text-faint)' }}>
            {speech.listening ? '● ' + t('voice.listening') : t('voice.stopped')}
          </span>
        </div>

        {!speech.supported && (
          <p className="muted" style={{ fontSize: 13 }}>
            La reconnaissance vocale n'est pas supportée par ce navigateur (essaie Chrome/Edge).
          </p>
        )}

        <div ref={transcriptRef} style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {transcript.map((x, i) => (
            <span key={i} style={{ fontSize: 14, color: x.signal === 'rouge' ? 'var(--coral)' : x.signal === 'vert' ? 'var(--calm)' : 'var(--text-dim)' }}>
              {x.text}
            </span>
          ))}
          {speech.interim && <span className="faint" style={{ fontSize: 14, fontStyle: 'italic' }}>{speech.interim}…</span>}
        </div>

        <div className="row" style={{ marginTop: 14, gap: 10 }}>
          {speech.listening ? (
            <Button variant="ghost" onClick={speech.stop}>● {t('voice.listening')} — stop</Button>
          ) : (
            <Button variant="calm" onClick={speech.start} disabled={!speech.supported}>🎙 {t('voice.talk')}</Button>
          )}
        </div>
        <p className="faint" style={{ fontSize: 11, marginTop: 8 }}>{t('voice.talkHint')}</p>
      </Card>

      {/* Contrôles d'état */}
      <Card>
        <div className="stack" style={{ gap: 12 }}>
          {state === STATES.ATTENTE_SETUP && (
            <>
              {/* 1) On calcule le lot AVANT de prendre */}
              <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 14 }}>
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
                    <div className="mono" style={{ fontSize: 26, color: lot >= 2 ? 'var(--coral)' : 'var(--gold)' }}>
                      {lot ? lot.toFixed(2) : '—'}
                    </div>
                  </div>
                </div>
              </div>
              {/* 2) Puis on valide le setup */}
              <Button onClick={() => enterState(STATES.SETUP_CONFIRME)}>{t('session.confirmSetup')}</Button>
            </>
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
    </div>
  )
}
