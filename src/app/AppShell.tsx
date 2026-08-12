import { Tab, TabList, TabPanel, Tabs } from '@react-spectrum/s2/Tabs'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ExportPayloadV1 } from '../data/types'
import { useAppStore } from '../store/appStore'
import { DashboardView } from '../views/DashboardView'
import { ExchangeView } from '../views/ExchangeView'
import { SettingsView } from '../views/SettingsView'
import { SetupView } from '../views/SetupView'
import { ImportDialog } from './ImportDialog'
import { isSetupShortcut, parseImportDeepLink, parseShareTarget } from './routerLite'

type ViewKey = 'dashboard' | 'setup' | 'exchange' | 'settings'

// Padding/maxWidth/centering live on this plain wrapper -- Tabs' own `styles`
// prop only accepts a restricted layout subset (no display/padding/boxSizing).
const wrapperStyle = style({
  flexGrow: 1,
  minHeight: 0,
  padding: 16,
  maxWidth: 480,
  marginX: 'auto',
  width: 'full',
  boxSizing: 'border-box',
})
const tabsStyle = style({ width: 'full', flexGrow: 1 })

export function AppShell() {
  const { t } = useTranslation()
  const hasSession = useAppStore((s) => s.session !== null)
  const [view, setView] = useState<ViewKey>(hasSession ? 'dashboard' : 'setup')
  const [pendingImport, setPendingImport] = useState<ExportPayloadV1 | null>(null)

  useEffect(() => {
    const { hash, search, pathname } = window.location

    if (isSetupShortcut(hash)) {
      setView('setup')
    }

    const payload = parseImportDeepLink(hash) ?? parseShareTarget(search)
    if (payload) {
      setPendingImport(payload)
    }

    if (hash || search) {
      history.replaceState(null, '', pathname)
    }
  }, [])

  return (
    <div className={wrapperStyle}>
      <Tabs
        aria-label="Wage Ticker"
        selectedKey={view}
        onSelectionChange={(key) => setView(key as ViewKey)}
        styles={tabsStyle}
      >
        <TabList aria-label={t('tabs.ariaLabel')}>
          <Tab id="dashboard">{t('tabs.dashboard')}</Tab>
          <Tab id="setup">{t('tabs.setup')}</Tab>
          <Tab id="exchange">{t('tabs.exchange')}</Tab>
          <Tab id="settings">{t('tabs.settings')}</Tab>
        </TabList>
        <TabPanel id="dashboard">
          <DashboardView onNavigateToSetup={() => setView('setup')} />
        </TabPanel>
        <TabPanel id="setup">
          <SetupView onStarted={() => setView('dashboard')} />
        </TabPanel>
        <TabPanel id="exchange">
          <ExchangeView onScanned={setPendingImport} />
        </TabPanel>
        <TabPanel id="settings">
          <SettingsView />
        </TabPanel>
      </Tabs>

      <ImportDialog
        payload={pendingImport}
        onCancel={() => setPendingImport(null)}
        onImported={() => {
          setPendingImport(null)
          setView('dashboard')
        }}
      />
    </div>
  )
}
