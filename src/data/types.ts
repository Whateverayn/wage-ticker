export interface WorkSession {
  /** ISO-8601 instant (Date#toISOString()) */
  startAt: string
  /** ISO-8601 instant; guaranteed to be after startAt */
  endAt: string
  hourlyWage: number
}

export type BandValueType = 'fixed' | 'percent'

/** A recurring daily premium window, e.g. 22:00-05:00 night shift. */
export interface PremiumBand {
  id: string
  /** wall-clock 'HH:mm', repeats daily */
  start: string
  /** wall-clock 'HH:mm'; end <= start means the band crosses midnight */
  end: string
  type: BandValueType
  /** yen/hr if type is 'fixed'; percentage points if type is 'percent' */
  value: number
}

export interface FixedCost {
  id: string
  label: string
  amount: number
}

export type ThemeOverride = 'auto' | 'light' | 'dark'

export type LocaleId =
  | 'en'
  | 'ja'
  | 'ja-kansai'
  | 'ja-hakata'
  | 'ja-tohoku'
  | 'ja-nagoya'
  | 'ja-hiroshima'
  | 'ja-okinawa'
  | string

export interface FeatureToggles {
  wakeLockEnabled: boolean
  vibrationEnabled: boolean
}

export interface PersistedAppState {
  schemaVersion: 1
  session: WorkSession | null
  bands: PremiumBand[]
  costs: FixedCost[]
  locale: LocaleId
  theme: ThemeOverride
  features: FeatureToggles
  /**
   * Last-entered Setup form values, saved live on every edit (like bands/
   * costs) so the form doesn't reset to hardcoded defaults on reload.
   * Wall-clock 'HH:mm', same representation as PremiumBand times.
   */
  draftStartTime: string
  draftEndTime: string
  draftWage: number
}

/**
 * Compact shape shared by text/QR export and import. Versioned independently
 * from PersistedAppState.schemaVersion: this payload may be read by an older
 * or newer install on a different device, while schemaVersion only ever
 * migrates this browser's own previously-written localStorage data.
 */
export interface ExportPayloadV1 {
  v: 1
  /** startAt */
  s: string
  /** endAt */
  e: string
  /** hourlyWage */
  w: number
  /** [start, end, type, value] tuples; type: 'p' = percent, 'f' = fixed */
  b: [string, string, 'p' | 'f', number][]
  /** [label, amount] tuples */
  c: [string, number][]
}
