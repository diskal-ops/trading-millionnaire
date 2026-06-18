/* ===========================================================
   Enregistrement des modules.
   Ajouter un module = importer + registerModule. Rien d'autre.
   =========================================================== */
import { registerModule } from '../core/moduleRegistry.js'
import trading from './trading/index.js'
import sport from './sport/index.js'
import business from './business/index.js'

let done = false
export function registerAllModules() {
  if (done) return
  registerModule(trading)
  registerModule(sport)
  registerModule(business)
  done = true
}
