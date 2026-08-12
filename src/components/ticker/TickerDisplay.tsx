import { Button } from '@react-spectrum/s2/Button'
import { ProgressBar } from '@react-spectrum/s2/ProgressBar'
import { css, style } from '@react-spectrum/s2/style' with { type: 'macro' }
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TickerSnapshot } from '../../calc/earnings'
import { formatHMS, formatMoney, formatPercent } from '../../calc/format'
import { vibrateIfEnabled } from '../../hooks/useVibration'
import { useAppStore } from '../../store/appStore'
import { useTickerLoop } from './useTickerLoop'

// fontVariantNumeric isn't in the style macro's token set; narrow css() escape hatch.
const tabularNums = css(`font-variant-numeric: tabular-nums;`)

const columnStyle = style({ display: 'flex', flexDirection: 'column', gap: 16, width: 'full' })
const heroCardStyle = style({
  backgroundColor: 'layer-1',
  borderRadius: 'lg',
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
})
const earnedStyle = style({ font: 'heading-2xl', fontWeight: 'bold' })
const subStyle = style({ font: 'body-sm', color: 'neutral-subdued' })
const rowStyle = style({ display: 'flex', gap: 12, width: 'full' })
const statCardStyle = style({
  backgroundColor: 'layer-1',
  borderRadius: 'lg',
  padding: 16,
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
})
const bigStyle = style({ font: 'title-lg', fontWeight: 'bold' })
const progressStyle = style({ width: 'full', marginTop: 8 })
const breakdownStyle = style({ font: 'body-xs', color: 'neutral-subdued' })

export function TickerDisplay() {
  const { t } = useTranslation()
  const { t: tFlavor } = useTranslation('flavor')
  const [snapshot, setSnapshot] = useState<TickerSnapshot | null>(null)
  const resetSession = useAppStore((s) => s.resetSession)
  const vibrationEnabled = useAppStore((s) => s.features.vibrationEnabled)
  const hasBandsOrCosts = useAppStore((s) => s.bands.length > 0 || s.costs.length > 0)

  useTickerLoop(setSnapshot)

  if (!snapshot) return null

  const statusMessage = snapshot.isBeforeStart
    ? tFlavor('status.beforeStart')
    : snapshot.isOvertime
      ? tFlavor('status.overtime')
      : tFlavor('status.working')

  return (
    <div className={columnStyle}>
      <div className={heroCardStyle}>
        <div className={`${earnedStyle} ${tabularNums}`}>{formatMoney(snapshot.totalEarned)}</div>
        {hasBandsOrCosts && (
          <div className={`${breakdownStyle} ${tabularNums}`}>
            {t('dashboard.breakdownBase')} {formatMoney(snapshot.timeEarnings.baseYen)} ｜{' '}
            {t('dashboard.breakdownBonus')} {formatMoney(snapshot.timeEarnings.bonusYen)} ｜{' '}
            {t('dashboard.breakdownFixed')} {formatMoney(snapshot.fixedCostsTotal)}
          </div>
        )}
        <div className={subStyle}>{t('dashboard.earnedLabel')}</div>
        <ProgressBar
          styles={progressStyle}
          value={Math.min(100, snapshot.progressPct)}
          valueLabel={<span className={tabularNums}>{formatPercent(snapshot.progressPct)}</span>}
          aria-label={t('dashboard.progressAria')}
        />
        <div className={subStyle}>{statusMessage}</div>
      </div>

      <div className={rowStyle}>
        <div className={statCardStyle}>
          <div className={`${bigStyle} ${tabularNums}`}>{formatHMS(snapshot.elapsedMs)}</div>
          <div className={subStyle}>{t('dashboard.elapsedLabel')}</div>
        </div>
        <div className={statCardStyle}>
          <div className={`${bigStyle} ${tabularNums}`}>
            {formatHMS(snapshot.isOvertime ? snapshot.overtimeMs : snapshot.remainingMs)}
          </div>
          <div className={subStyle}>{snapshot.isOvertime ? t('dashboard.overtimeLabel') : t('dashboard.remainingLabel')}</div>
        </div>
      </div>

      <Button
        variant="secondary"
        onPress={() => {
          vibrateIfEnabled(vibrationEnabled)
          resetSession()
        }}
      >
        {t('dashboard.reset')}
      </Button>
    </div>
  )
}
