import React, { useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { useAppStore } from '../store/useAppStore.js'
import { runCorrelations } from '../correlationEngine.js'
import { syncNow } from '../driveSync.js'
import { Card, Button } from '../../ui/index.jsx'

const TONE = { fragile: 'alert', warn: undefined, info: 'calm' }

export default function Insights() {
  const { t } = useI18n()
  const { dailyLog, sessions, exportState, importState, driveEnabled, lastSync } = useAppStore()
  const insights = useMemo(() => runCorrelations(dailyLog), [dailyLog])
  const fileRef = useRef(null)
  const [syncState, setSyncState] = useState('idle')

  const doSync = async () => {
    setSyncState('syncing')
    try {
      await syncNow({ silent: false })
      setSyncState('ok')
    } catch (e) {
      setSyncState('error')
      alert(t('drive.error') + ' : ' + (e?.message || e))
    }
  }

  const download = () => {
    const blob = new Blob([JSON.stringify(exportState(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kijun-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => {
      try { importState(JSON.parse(r.result)); alert(t('backup.imported')) }
      catch (err) { alert(err.message) }
    }
    r.readAsText(f)
  }

  return (
    <div className="stack">
      <h2>{t('nav.insights')}</h2>
      <p className="muted" style={{ fontSize: 14, marginTop: -8 }}>
        Tout est lié. Le moteur lit les données de tous les modules.
      </p>

      {/* Synchro multi-appareils via Google Drive */}
      <Card tone={driveEnabled ? 'calm' : undefined}>
        <div className="faint" style={{ fontSize: 12, marginBottom: 8 }}>☁️ {t('drive.title')}</div>
        <p className="muted" style={{ fontSize: 13, margin: '0 0 12px' }}>{t('drive.desc')}</p>
        <Button onClick={doSync} disabled={syncState === 'syncing'}>
          {syncState === 'syncing'
            ? t('drive.syncing')
            : driveEnabled
              ? '↻ ' + t('drive.syncNow')
              : t('drive.connect')}
        </Button>
        {driveEnabled && lastSync > 0 && (
          <p className="faint" style={{ fontSize: 11, marginTop: 8 }}>
            {t('drive.synced')} : {new Date(lastSync).toLocaleString()}
          </p>
        )}
      </Card>

      {insights.length === 0 && (
        <Card tone="calm"><p className="muted" style={{ margin: 0 }}>Rien à signaler. Terrain stable.</p></Card>
      )}

      {insights.map((i) => (
        <Card key={i.id} tone={TONE[i.severity]}>
          <div className="spread" style={{ marginBottom: 6 }}>
            <strong style={{ color: i.severity === 'fragile' ? 'var(--coral)' : 'var(--gold)' }}>{i.titre}</strong>
            <span className="mono faint" style={{ fontSize: 11 }}>{i.moduleId}</span>
          </div>
          <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{i.detail}</p>
        </Card>
      ))}

      <Card>
        <div className="faint" style={{ fontSize: 12, marginBottom: 10 }}>💾 {t('backup.title')}</div>
        <p className="muted" style={{ fontSize: 13, margin: '0 0 12px' }}>{t('backup.desc')}</p>
        <div className="row" style={{ gap: 10 }}>
          <Button variant="ghost" onClick={download}>↓ {t('backup.export')}</Button>
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>↑ {t('backup.import')}</Button>
          <input ref={fileRef} type="file" accept="application/json" onChange={onFile} style={{ display: 'none' }} />
        </div>
      </Card>

      <Card>
        <div className="faint" style={{ fontSize: 12, marginBottom: 8 }}>Sessions récentes</div>
        {sessions.length === 0 ? (
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>Aucune session enregistrée.</p>
        ) : (
          <div className="stack" style={{ gap: 8 }}>
            {sessions.slice(0, 8).map((s) => (
              <div key={s.id} className="spread">
                <span className="mono faint" style={{ fontSize: 13 }}>{s.date}</span>
                <span style={{ fontSize: 13 }}>{s.state_final}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
