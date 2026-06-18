import { useCallback, useEffect, useRef, useState } from 'react'

/* ===========================================================
   useSpeech — dictaphone live + synthèse vocale
   -----------------------------------------------------------
   - Web Speech API SpeechRecognition (fr-FR / en-US)
   - transcription continue
   - SpeechSynthesis pour lire la réponse du coach (toggle)
   Aucune écriture clavier pendant la session.
   =========================================================== */

const Recognition =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition)

export function useSpeech({ lang = 'fr', onFinalSegment } = {}) {
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  const supported = Boolean(Recognition)
  const recRef = useRef(null)
  const onSegRef = useRef(onFinalSegment)
  onSegRef.current = onFinalSegment

  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [voiceOn, setVoiceOn] = useState(true)

  useEffect(() => {
    if (!supported) return
    const rec = new Recognition()
    rec.lang = locale
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = (event) => {
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        const text = res[0].transcript
        if (res.isFinal) {
          onSegRef.current?.(text.trim())
        } else {
          interimText += text
        }
      }
      setInterim(interimText)
    }
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return
      console.warn('[speech] error', e.error)
    }
    rec.onend = () => {
      // auto-restart tant que l'utilisateur veut écouter
      if (recRef.current?._wantListening) {
        try { rec.start() } catch { /* déjà démarré */ }
      } else {
        setListening(false)
      }
    }
    recRef.current = rec
    return () => {
      rec._wantListening = false
      try { rec.stop() } catch { /* noop */ }
    }
  }, [locale, supported])

  const start = useCallback(() => {
    const rec = recRef.current
    if (!rec) return
    rec._wantListening = true
    try { rec.start(); setListening(true) } catch { /* déjà démarré */ }
  }, [])

  const stop = useCallback(() => {
    const rec = recRef.current
    if (!rec) return
    rec._wantListening = false
    try { rec.stop() } catch { /* noop */ }
    setListening(false)
    setInterim('')
  }, [])

  const speak = useCallback(
    (text) => {
      if (!voiceOn || !text || typeof window === 'undefined' || !window.speechSynthesis) return
      const u = new SpeechSynthesisUtterance(text)
      u.lang = locale
      u.rate = 0.96
      u.pitch = 0.95
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    },
    [voiceOn, locale],
  )

  return { supported, listening, interim, voiceOn, setVoiceOn, start, stop, speak }
}
