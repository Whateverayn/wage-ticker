import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ImportedSession } from '../data/exportSchema'
import type {
  FeatureToggles,
  FixedCost,
  LocaleId,
  PersistedAppState,
  PremiumBand,
  ThemeOverride,
  WorkSession,
} from '../data/types'
import { generateId } from '../data/uuid'

function dateToHHMM(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

interface AppStore extends PersistedAppState {
  startSession: (session: WorkSession) => void
  resetSession: () => void
  addBand: (band: Omit<PremiumBand, 'id'>) => void
  updateBand: (id: string, patch: Partial<Omit<PremiumBand, 'id'>>) => void
  removeBand: (id: string) => void
  addCost: (cost: Omit<FixedCost, 'id'>) => void
  updateCost: (id: string, patch: Partial<Omit<FixedCost, 'id'>>) => void
  removeCost: (id: string) => void
  setLocale: (locale: LocaleId) => void
  setTheme: (theme: ThemeOverride) => void
  setFeatureToggle: (key: keyof FeatureToggles, value: boolean) => void
  setDraftStartTime: (hhmm: string) => void
  setDraftEndTime: (hhmm: string) => void
  setDraftWage: (wage: number) => void
  /** Overwrites session/bands/costs from a confirmed import (text or QR). */
  importPayload: (imported: ImportedSession) => void
}

const initialState: PersistedAppState = {
  schemaVersion: 1,
  session: null,
  bands: [],
  costs: [],
  locale: 'ja',
  theme: 'auto',
  features: { wakeLockEnabled: false, vibrationEnabled: false },
  draftStartTime: '09:00',
  draftEndTime: '17:00',
  draftWage: 1200,
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,

      startSession: (session) => set({ session }),
      resetSession: () => set({ session: null }),

      addBand: (band) => set((s) => ({ bands: [...s.bands, { ...band, id: generateId() }] })),
      updateBand: (id, patch) =>
        set((s) => ({ bands: s.bands.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      removeBand: (id) => set((s) => ({ bands: s.bands.filter((b) => b.id !== id) })),

      addCost: (cost) => set((s) => ({ costs: [...s.costs, { ...cost, id: generateId() }] })),
      updateCost: (id, patch) =>
        set((s) => ({ costs: s.costs.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      removeCost: (id) => set((s) => ({ costs: s.costs.filter((c) => c.id !== id) })),

      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setFeatureToggle: (key, value) => set((s) => ({ features: { ...s.features, [key]: value } })),

      setDraftStartTime: (hhmm) => set({ draftStartTime: hhmm }),
      setDraftEndTime: (hhmm) => set({ draftEndTime: hhmm }),
      setDraftWage: (wage) => set({ draftWage: wage }),

      importPayload: (imported) =>
        set({
          session: imported.session,
          bands: imported.bands,
          costs: imported.costs,
          draftStartTime: dateToHHMM(imported.session.startAt),
          draftEndTime: dateToHHMM(imported.session.endAt),
          draftWage: imported.session.hourlyWage,
        }),
    }),
    {
      name: 'wage-ticker/state',
      version: 1,
      // No migrate() needed: new keys (draftStartTime/draftEndTime/draftWage)
      // added here get their defaults from initialState via the default
      // shallow merge for anyone with older persisted data.
    },
  ),
)
