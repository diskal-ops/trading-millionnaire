import { useCallback, useEffect, useRef, useState } from 'react'

/* ===========================================================
   useSpeech — dictaphone + synthèse vocale
   -----------------------------------------------------------
   - SpeechRecognition (fr-FR / en-US), "appuie pour parler".
   - SpeechSynthesis pour lire la réponse du coach.
   - IMPORTANT : quand le coach PARLE, on COUPE le micro, sinon
     le micro réenregistre la voix du coach → boucle (le coach
     se répond à lui-même). voiceOn est contrôlé par le parent.
   =========================================================== */

const Recognition =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition)

export function useSpeech({ lang = 'fr', onFinalSegment, voiceOn = true } = {}) {
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  const supported = Boolean(Recognition)
  const recRef = useRef(null)
  const onSegRef = useRef(onFinalSegment)
  onSegRef.current = onFinalSegment
  const voiceOnRef = useRef(voiceOn)
  voiceOnRef.current = voiceOn

  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')

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
        if (res.isFinal) onSegRef.current?.(text.trim())
        else interimText += text
      }
      setInterim(interimText)
    }
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return
      console.warn('[speech] error', e.error)
    }
    rec.onend = () => {
      if (recRef.current?._wantListening) {
        try { rec.start() } catch { /* déjà démarré */ }
      } else {
        setListening(false)
      }
    }
    recRef.current = rec
    return () => {
      rec._wantListening = false
      try { rec.abort() } catch { /* noop */ }
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

  // Coupe le micro IMMÉDIATEMENT (sans produire de résultat).
  const muteMic = useCallback(() => {
    const rec = recRef.current
    if (!rec) return
    rec._wantListening = false
    try { rec.abort() } catch { /* noop */ }
    setListening(false)
    setInterim('')
  }, [])

  const speak = useCallback(
    (text) => {
      if (!voiceOnRef.current || !text || typeof window === 'undefined' || !window.speechSynthesis) return
      // On coupe le micro AVANT de parler → le coach ne s'enregistre pas.
      muteMic()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = locale
      u.rate = 0.96
      u.pitch = 0.95
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    },
    [locale, muteMic],
  )

  return { supported, listening, interim, start, stop, speak }
}
