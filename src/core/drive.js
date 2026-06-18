/* ===========================================================
   Google Drive — synchro multi-appareils (PC ↔ mobile)
   -----------------------------------------------------------
   Stocke UN fichier JSON dans le dossier caché "appDataFolder"
   de TON Drive (invisible, propre à KIJUN). Connexion via
   Google Identity Services (jeton court, scope drive.appdata).
   L'ID client est PUBLIC (par conception) → ok en clair.
   =========================================================== */

const CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '930089932849-aett28t78oogv8req19715ebaiq365hg.apps.googleusercontent.com'
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const FILE_NAME = 'kijun-data.json'

export function isConfigured() {
  return Boolean(CLIENT_ID)
}

let gisReady
function loadGis() {
  if (gisReady) return gisReady
  gisReady = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve()
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Échec du chargement de Google Identity'))
    document.head.appendChild(s)
  })
  return gisReady
}

// À appeler tôt (au chargement de l'app) pour que Google soit prêt
// AVANT le clic → évite le blocage de la fenêtre par le navigateur mobile.
export function preload() {
  return getTokenClient().catch(() => {})
}

let tokenClient
async function getTokenClient() {
  await loadGis()
  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: () => {},
    })
  }
  return tokenClient
}

// Demande un jeton d'accès. silent=true => sans popup (si déjà consenti).
export function requestToken({ silent = false } = {}) {
  return new Promise((resolve, reject) => {
    getTokenClient().then((tc) => {
      tc.callback = (resp) => {
        if (resp.error) return reject(new Error(resp.error))
        resolve(resp.access_token)
      }
      try {
        tc.requestAccessToken({ prompt: silent ? 'none' : '' })
      } catch (e) {
        reject(e)
      }
    }, reject)
  })
}

async function api(url, token, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  })
  if (!res.ok) throw new Error(`Drive API ${res.status}`)
  return res
}

async function findFileId(token) {
  const q = encodeURIComponent(`name='${FILE_NAME}'`)
  const res = await api(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,name)`,
    token,
  )
  const data = await res.json()
  return data.files?.[0]?.id || null
}

// Lit le fichier distant. Retourne { id, data } (data = null si absent).
export async function loadRemote(token) {
  const id = await findFileId(token)
  if (!id) return { id: null, data: null }
  const res = await api(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, token)
  const data = await res.json().catch(() => null)
  return { id, data }
}

// Écrit le fichier (crée s'il n'existe pas). Retourne l'id.
export async function saveRemote(token, data, existingId) {
  const body = new Blob([JSON.stringify(data)], { type: 'application/json' })
  if (existingId) {
    await api(
      `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media`,
      token,
      { method: 'PATCH', body },
    )
    return existingId
  }
  const boundary = 'kijun' + Date.now()
  const meta = { name: FILE_NAME, parents: ['appDataFolder'] }
  const multipart = new Blob(
    [
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
      JSON.stringify(meta),
      `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n`,
      JSON.stringify(data),
      `\r\n--${boundary}--`,
    ],
    { type: `multipart/related; boundary=${boundary}` },
  )
  const res = await api(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    token,
    { method: 'POST', body: multipart },
  )
  const j = await res.json()
  return j.id
}
