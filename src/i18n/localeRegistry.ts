import type { LocaleId } from '../data/types'

export interface LocaleDescriptor {
  id: LocaleId
  labelNative: string
  /** BCP-47 code for S2 <Provider locale>; every dialect maps to its base language. */
  s2Locale: string
}

/**
 * Adding a new dialect = add one row here + one flavor.json file. `ui` never
 * gets a per-dialect file -- i18next's fallbackLng chain (see i18n/index.ts)
 * routes any dialect's missing keys back to `ja`.
 */
export const LOCALES: LocaleDescriptor[] = [
  { id: 'ja', labelNative: '標準語', s2Locale: 'ja-JP' },
  { id: 'ja-kansai', labelNative: '関西弁', s2Locale: 'ja-JP' },
  { id: 'ja-hakata', labelNative: '博多弁', s2Locale: 'ja-JP' },
  { id: 'ja-tohoku', labelNative: '東北弁', s2Locale: 'ja-JP' },
  { id: 'ja-nagoya', labelNative: '名古屋弁', s2Locale: 'ja-JP' },
  { id: 'ja-hiroshima', labelNative: '広島弁', s2Locale: 'ja-JP' },
  { id: 'ja-okinawa', labelNative: '沖縄口', s2Locale: 'ja-JP' },
  { id: 'en', labelNative: 'English', s2Locale: 'en-US' },
]

export function toS2Locale(locale: LocaleId): string {
  return LOCALES.find((l) => l.id === locale)?.s2Locale ?? 'en-US'
}
