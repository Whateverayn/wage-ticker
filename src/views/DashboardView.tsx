import { Button } from '@react-spectrum/s2/Button'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import { useTranslation } from 'react-i18next'
import { TickerDisplay } from '../components/ticker/TickerDisplay'
import { useWakeLock } from '../hooks/useWakeLock'
import { useAppStore } from '../store/appStore'

const emptyStateStyle = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  padding: 32,
})

export function DashboardView({ onNavigateToSetup }: { onNavigateToSetup: () => void }) {
  const { t } = useTranslation()
  const hasSession = useAppStore((s) => s.session !== null)
  const wakeLockEnabled = useAppStore((s) => s.features.wakeLockEnabled)

  useWakeLock(hasSession && wakeLockEnabled)

  if (!hasSession) {
    return (
      <div className={emptyStateStyle}>
        <p className={style({ font: 'body', color: 'neutral-subdued' })}>{t('dashboard.emptyMessage')}</p>
        <Button variant="primary" onPress={onNavigateToSetup}>
          {t('dashboard.goToSetup')}
        </Button>
      </div>
    )
  }

  return <TickerDisplay />
}
