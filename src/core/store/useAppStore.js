import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, hasSupabase } from '../supabaseClient.js'

/* ===========================================================
   Store global (zustand)
   -----------------------------------------------------------
   - daily_log : table partagée par tous les modules (cœur).
   - balance / marche : escalier de manifestation.
   - sessions : sessions de trading sauvegardées.
   Persistance locale (localStorage) + sync Supabase si branché.
   =========================================================== */

const todayISO = () => new Date().toISOString().slice(0, 10)

export const useAppStore = create(
  persist(
    (set, get) => ({
      // --- Escalier / argent ---
      balance: 480, // valeur réelle actuelle (Ernesto)
      previousHigh: 820, // ancien plus-haut (thermostat, rouge)

      setBalance: (v) =>
        set((s) => ({
          balance: Number(v) || 0,
          previousHigh: Math.max(s.previousHigh, Number(v) || 0),
        })),

      // --- Discipline (course de fond) : { 'YYYY-MM-DD': 'won' | 'lost' } ---
      discipline: {},
      markDiscipline: (won, date = todayISO()) =>
        set((s) => ({ discipline: { ...s.discipline, [date]: won ? 'won' : 'lost' } })),

      // --- Mental Hand History (Tendler) ---
      mhhEntries: [],
      saveMHH: (entry) => {
        const e = { id: crypto.randomUUID(), date: todayISO(), ...entry }
        set((s) => ({ mhhEntries: [e, ...s.mhhEntries] }))
        if (hasSupabase) get()._syncRow('mhh', e)
        return e
      },

      // --- Journal des succès (valoriser ses accomplissements) ---
      successJournal: [],
      addSuccess: (entry) => {
        const e = { id: crypto.randomUUID(), date: todayISO(), ...entry }
        set((s) => ({ successJournal: [e, ...s.successJournal] }))
        if (hasSupabase) get()._syncRow('success_journal', e)
        return e
      },

      // --- daily_log (cœur, transverse) ---
      dailyLog: [], // [{ date, sommeil_h, sport_fait, nutrition_ok, trading_resultat, etat_mental, patterns_detectes[] }]

      upsertDailyLog: (patch) => {
        const date = patch.date || todayISO()
        set((s) => {
          const existing = s.dailyLog.find((d) => d.date === date)
          const merged = { date, patterns_detectes: [], ...existing, ...patch }
          const rest = s.dailyLog.filter((d) => d.date !== date)
          return { dailyLog: [...rest, merged] }
        })
        if (hasSupabase) get()._syncDailyLog(date)
      },

      addPattern: (pattern, date = todayISO()) =>
        set((s) => {
          const d = s.dailyLog.find((x) => x.date === date) || {
            date,
            patterns_detectes: [],
          }
          const patterns = Array.from(new Set([...(d.patterns_detectes || []), pattern]))
          const rest = s.dailyLog.filter((x) => x.date !== date)
          return { dailyLog: [...rest, { ...d, patterns_detectes: patterns }] }
        }),

      // --- sessions de trading ---
      sessions: [],
      saveSession: (session) => {
        const entry = { id: crypto.randomUUID(), date: todayISO(), ...session }
        set((s) => ({ sessions: [entry, ...s.sessions] }))
        if (hasSupabase) get()._syncSession(entry)
        return entry
      },

      // --- sync Supabase (no-op si non branché) ---
      _syncDailyLog: async (date) => {
        const row = get().dailyLog.find((d) => d.date === date)
        if (!row || !supabase) return
        const { data: u } = await supabase.auth.getUser()
        if (!u?.user) return
        await supabase.from('daily_log').upsert({ ...row, user_id: u.user.id }, { onConflict: 'user_id,date' })
      },
      _syncSession: async (entry) => {
        if (!supabase) return
        const { data: u } = await supabase.auth.getUser()
        if (!u?.user) return
        await supabase.from('sessions').insert({ ...entry, user_id: u.user.id })
      },
      _syncRow: async (table, entry) => {
        if (!supabase) return
        const { data: u } = await supabase.auth.getUser()
        if (!u?.user) return
        await supabase.from(table).insert({ ...entry, user_id: u.user.id })
      },

      hydrateFromSupabase: async () => {
        if (!supabase) return
        const { data: u } = await supabase.auth.getUser()
        if (!u?.user) return
        const { data: logs } = await supabase
          .from('daily_log')
          .select('*')
          .order('date', { ascending: false })
          .limit(60)
        if (logs) set({ dailyLog: logs })
        const { data: sess } = await supabase
          .from('sessions')
          .select('*')
          .order('date', { ascending: false })
          .limit(50)
        if (sess) set({ sessions: sess })
      },
    }),
    { name: 'kijun.store' },
  ),
)
