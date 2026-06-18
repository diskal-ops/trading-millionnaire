import { useAppStore } from './store/useAppStore.js'
import * as drive from './drive.js'

/* ===========================================================
   Synchro = pull (Drive) → fusion → push (Drive).
   Fusion additive : on n'écrase rien (union des sessions, MHH,
   succès, jours…). Pour les scalaires (balance), c'est l'appareil
   modifié le plus récemment qui gagne (champ updatedAt).
   =========================================================== */

function unionById(a = [], b = []) {
  const map = new Map()
  for (const x of [...a, ...b]) if (x?.id) map.set(x.id, x)
  return [...map.values()]
}

function unionByDate(a = [], b = [], remoteNewer) {
  const map = new Map()
  const first = remoteNewer ? a : b
  const last = remoteNewer ? b : a
  for (const x of first) if (x?.date) map.set(x.date, x)
  for (const x of last) if (x?.date) map.set(x.date, x) // le plus récent écrase
  return [...map.values()]
}

export function mergeStates(local, remote) {
  if (!remote) return local
  if (!local) return remote
  const remoteNewer = (remote.updatedAt || 0) > (local.updatedAt || 0)
  const newer = remoteNewer ? remote : local
  const older = remoteNewer ? local : remote
  return {
    _kijun: 1,
    updatedAt: Math.max(local.updatedAt || 0, remote.updatedAt || 0),
    balance: newer.balance ?? older.balance,
    previousHigh: Math.max(local.previousHigh || 0, remote.previousHigh || 0),
    discipline: remoteNewer
      ? { ...local.discipline, ...remote.discipline }
      : { ...remote.discipline, ...local.discipline },
    dailyLog: unionByDate(local.dailyLog, remote.dailyLog, remoteNewer),
    sessions: unionById(local.sessions, remote.sessions),
    mhhEntries: unionById(local.mhhEntries, remote.mhhEntries),
    successJournal: unionById(local.successJournal, remote.successJournal),
  }
}

let syncing = false

// Synchro complète. silent=true => sans popup (au chargement / en arrière-plan).
export async function syncNow({ silent = false } = {}) {
  if (syncing) return
  syncing = true
  try {
    const token = await drive.requestToken({ silent })
    const { id, data: remote } = await drive.loadRemote(token)
    const local = useAppStore.getState().exportState()
    const merged = mergeStates(local, remote)
    useAppStore.getState().importState(merged)
    await drive.saveRemote(token, merged, id)
    const store = useAppStore.getState()
    store.setDriveEnabled(true)
    store.setLastSync(Date.now())
    return merged
  } finally {
    syncing = false
  }
}
