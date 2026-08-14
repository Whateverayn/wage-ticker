import { Provider } from '@react-spectrum/s2/Provider'
import { ToastContainer } from '@react-spectrum/s2/Toast'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import { AppShell } from './app/AppShell'
import { SafeAreaContainer } from './app/SafeAreaContainer'
import { toS2Locale } from './i18n/localeRegistry'
import { UpdateToast } from './pwa/UpdateToast'
import { useThemeColorMeta } from './pwa/useThemeColorMeta'
import { useAppStore } from './store/appStore'

// Layer A: full-bleed background + color scheme, no padding (see SafeAreaContainer for Layer B).
const providerStyle = style({ display: 'flex', flexDirection: 'column', minHeight: 'screen' })

export default function App() {
  const theme = useAppStore((s) => s.theme)
  const locale = useAppStore((s) => s.locale)

  useThemeColorMeta(theme)

  return (
    <Provider
      colorScheme={theme === 'auto' ? undefined : theme}
      locale={toS2Locale(locale)}
      background="base"
      styles={providerStyle}
    >
      <SafeAreaContainer>
        <AppShell />
      </SafeAreaContainer>
      <ToastContainer />
      <UpdateToast />
    </Provider>
  )
}
