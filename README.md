# KIJUN — Coach de vie modulaire (trading d'abord)

React 18 + Vite + Supabase + Gemini. Architecture **modulaire** : un cœur central + des modules de coaching enfichables. Premier module livré : **TRADING**.

> « Je ne suis pas quelqu'un qui gagne, je suis un observateur discipliné. »

## Démarrage local

```bash
npm install
cp .env.example .env   # remplis les valeurs Supabase
npm run dev            # http://localhost:5173
```

L'app **fonctionne sans backend** (mode local/localStorage) tant que `.env` n'est pas rempli — pratique pour développer. La mémoire longue et le coach Gemini s'activent dès que Supabase est branché.

## Architecture

```
src/
  core/                 cœur — ne dépend d'aucun module
    moduleRegistry.js   registre : ajouter un module = le déposer + l'enregistrer
    correlationEngine.js « tout est lié » : agrège les règles de tous les modules
    i18n/               FR · EN · PT · ES · DE (extensible)
    store/              état global (zustand) + sync Supabase
    supabaseClient.js   client (mode local si non configuré)
    gemini.js           appelle UNIQUEMENT l'Edge Function (jamais la clé)
    hooks/useSpeech.js  dictaphone live + synthèse vocale
    screens/            Home (terrain du jour), Insights
  ui/                   composants partagés (Card, Button, Affirm, Gauge…)
  modules/
    trading/            LE module complet (machine à états, coups de pression…)
    sport/              squelette enfichable
    business/           squelette enfichable
supabase/
  functions/gemini-proxy/  Edge Function sécurisée (détient la clé)
  migrations/0001_init.sql  tables + RLS
```

### Ajouter un module (zéro modif du cœur)
1. Créer `src/modules/<id>/index.js` respectant le contrat :
   `{ id, nom, icon, routes, schemaDonnees, reglesInsights }`
2. L'enregistrer dans `src/modules/index.js`.

## Module TRADING
- **Session = machine à états** : `ATTENTE_SETUP → SETUP_CONFIRMÉ → POSITION_PRISE → GESTION → CLÔTURE` (bouton **ou** voix).
- **Dictaphone live** (Web Speech API) : transcription continue, détection des **phrases rouges/vertes**, recadrage live des **3 coups de pression**, lecture vocale (toggle).
- **Rituels** matin / soir. **Thermostat de l'argent** (jauge, alerte territoire inconnu). **Escalier de manifestation** (données réelles, +10%/jour).

## Supabase — mise en route

```bash
# 1. Lier le projet
supabase link --project-ref <ref>

# 2. Appliquer le schéma (tables + RLS)
supabase db push      # ou colle 0001_init.sql dans le SQL editor

# 3. Edge Function : la clé Gemini ne touche JAMAIS le frontend
supabase secrets set GEMINI_KEY=<clé gemini-ziinga-prod>
supabase functions deploy gemini-proxy

# 4. .env du frontend
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Déploiement Vercel
- Framework : Vite. Build : `npm run build`. Output : `dist`.
- Variables d'env : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Sécurité (rappel)
- ⚠️ La clé Gemini vit **uniquement** dans `supabase secrets`. Le frontend appelle `gemini-proxy`.
- RLS activé : chaque utilisateur ne voit que ses données.
