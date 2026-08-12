import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { useAppStore } from '../store/appStore'
import enFlavor from './locales/en/flavor.json'
import enUi from './locales/en/ui.json'
import jaFlavor from './locales/ja/flavor.json'
import jaUi from './locales/ja/ui.json'
import jaHakataFlavor from './locales/ja-hakata/flavor.json'
import jaHiroshimaFlavor from './locales/ja-hiroshima/flavor.json'
import jaKansaiFlavor from './locales/ja-kansai/flavor.json'
import jaNagoyaFlavor from './locales/ja-nagoya/flavor.json'
import jaOkinawaFlavor from './locales/ja-okinawa/flavor.json'
import jaTohokuFlavor from './locales/ja-tohoku/flavor.json'

// `ui` is neutral and never gets a per-dialect file; `flavor` is the small
// set of dialect-worthy strings (status messages, share text). Missing
// dialect keys fall back to standard `ja`, never straight to `en`.
i18n.use(initReactI18next).init({
  resources: {
    en: { ui: enUi, flavor: enFlavor },
    ja: { ui: jaUi, flavor: jaFlavor },
    'ja-kansai': { flavor: jaKansaiFlavor },
    'ja-hakata': { flavor: jaHakataFlavor },
    'ja-tohoku': { flavor: jaTohokuFlavor },
    'ja-nagoya': { flavor: jaNagoyaFlavor },
    'ja-hiroshima': { flavor: jaHiroshimaFlavor },
    'ja-okinawa': { flavor: jaOkinawaFlavor },
  },
  lng: useAppStore.getState().locale,
  fallbackLng: {
    'ja-kansai': ['ja'],
    'ja-hakata': ['ja'],
    'ja-tohoku': ['ja'],
    'ja-nagoya': ['ja'],
    'ja-hiroshima': ['ja'],
    'ja-okinawa': ['ja'],
    default: ['en'],
  },
  ns: ['ui', 'flavor'],
  defaultNS: 'ui',
  interpolation: { escapeValue: false },
})

export default i18n
