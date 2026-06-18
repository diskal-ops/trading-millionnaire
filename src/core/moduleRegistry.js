/* ===========================================================
   Registre de modules
   -----------------------------------------------------------
   Le cœur découvre les modules ici. Ajouter un module =
   déposer un dossier dans /modules et l'enregistrer dans
   /modules/index.js. ZÉRO modification du cœur.

   Contrat d'interface d'un module :
   {
     id: string,                    // "trading"
     nom: { fr, en },
     icon: string,
     enabled: boolean,
     routes: [{ path, element, nav?: {labelKey, order} }],
     schemaDonnees: object,         // forme des données persistées
     reglesInsights: [fn(window) -> insight|null],  // pour le moteur de corrélations
   }
   =========================================================== */

const registry = new Map()

export function registerModule(mod) {
  if (!mod?.id) throw new Error('Un module doit avoir un id')
  if (registry.has(mod.id)) {
    console.warn(`[registry] module "${mod.id}" déjà enregistré, ignoré`)
    return
  }
  registry.set(mod.id, { enabled: true, routes: [], reglesInsights: [], ...mod })
}

export function getModules() {
  return [...registry.values()]
}

export function getEnabledModules() {
  return getModules().filter((m) => m.enabled)
}

export function getModule(id) {
  return registry.get(id)
}

// Toutes les routes des modules actifs, à plat (pour le router)
export function getAllRoutes() {
  return getEnabledModules().flatMap((m) => m.routes || [])
}

// Toutes les règles d'insight déclarées par les modules (pour le moteur)
export function getAllInsightRules() {
  return getEnabledModules().flatMap((m) =>
    (m.reglesInsights || []).map((rule) => ({ moduleId: m.id, rule })),
  )
}
