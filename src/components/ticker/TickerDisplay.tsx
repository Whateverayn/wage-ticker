import { AlertDialog } from '@react-spectrum/s2/AlertDialog'
import { Button } from '@react-spectrum/s2/Button'
import { DialogTrigger } from '@react-spectrum/s2/Dialog'
import { ProgressBar } from '@react-spectrum/s2/ProgressBar'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import type { CSSProperties } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TickerSnapshot } from '../../calc/earnings'
import { formatHMS, formatMoney, formatPercent } from '../../calc/format'
import { vibrateIfEnabled } from '../../hooks/useVibration'
import { useAppStore } from '../../store/appStore'
import { useTickerLoop } from './useTickerLoop'

// Locale-driven CJK font stacks (e.g. adobe-clean-han-japanese) don't
// implement the tabular-figure OpenType feature, so digits jitter as they
// tick under ja/dialect locales. Neither a css()-injected font-family (loses
// the cascade to the `font` shorthand's own font-family sub-declaration) nor
// the macro's `fontFamily: 'sans'` token (itself locale-aware, so it just
// resolves back to the same CJK stack) can override this from within the
// style macro system. A plain inline `style` attribute is the one thing
// guaranteed to beat any class-based rule regardless of cascade layers.
const numericStyle: CSSProperties = {
  fontVariantNumeric: 'tabular-nums',
  fontFamily: 'adobe-clean-spectrum-vf, adobe-clean-variable, adobe-clean, ui-sans-serif, system-ui, sans-serif',
}

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
// flexBasis:0 (not just flexGrow:1) so cards are always equal width --
// flexGrow alone distributes only the *extra* space on top of each item's
// own content size, so differing label/digit widths still produced
// slightly different final widths.
const statCardStyle = style({
  backgroundColor: 'layer-1',
  borderRadius: 'lg',
  padding: 16,
  flexGrow: 1,
  flexBasis: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
})
const bigStyle = style({ font: 'title-lg', fontWeight: 'bold' })
const breakdownValueStyle = style({ font: 'title-sm', fontWeight: 'bold' })
const progressStyle = style({ width: 'full', marginTop: 8 })

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
        <div className={earnedStyle} style={numericStyle}>
          {formatMoney(snapshot.totalEarned)}
        </div>
        <div className={subStyle}>{tFlavor('dashboard.earnedLabel')}</div>
        <ProgressBar
          styles={progressStyle}
          value={Math.min(100, snapshot.progressPct)}
          valueLabel={<span style={numericStyle}>{formatPercent(snapshot.progressPct)}</span>}
          aria-label={t('dashboard.progressAria')}
        />
        <div className={subStyle}>{statusMessage}</div>
      </div>

      {hasBandsOrCosts && (
        <div className={rowStyle}>
          <div className={statCardStyle}>
            <div className={breakdownValueStyle} style={numericStyle}>
              {formatMoney(snapshot.timeEarnings.baseYen)}
            </div>
            <div className={subStyle}>{tFlavor('dashboard.breakdownBase')}</div>
          </div>
          <div className={statCardStyle}>
            <div className={breakdownValueStyle} style={numericStyle}>
              {formatMoney(snapshot.timeEarnings.bonusYen)}
            </div>
            <div className={subStyle}>{tFlavor('dashboard.breakdownBonus')}</div>
          </div>
          <div className={statCardStyle}>
            <div className={breakdownValueStyle} style={numericStyle}>
              {formatMoney(snapshot.fixedCostsTotal)}
            </div>
            <div className={subStyle}>{tFlavor('dashboard.breakdownFixed')}</div>
          </div>
        </div>
      )}

      <div className={rowStyle}>
        <div className={statCardStyle}>
          <div className={bigStyle} style={numericStyle}>
            {formatHMS(snapshot.elapsedMs)}
          </div>
          <div className={subStyle}>{tFlavor('dashboard.elapsedLabel')}</div>
        </div>
        <div className={statCardStyle}>
          <div className={bigStyle} style={numericStyle}>
            {formatHMS(snapshot.isOvertime ? snapshot.overtimeMs : snapshot.remainingMs)}
          </div>
          <div className={subStyle}>
            {snapshot.isOvertime ? tFlavor('dashboard.overtimeLabel') : tFlavor('dashboard.remainingLabel')}
          </div>
        </div>
      </div>

      <DialogTrigger>
        <Button variant="secondary">{tFlavor('dashboard.reset')}</Button>
        <AlertDialog
          variant="destructive"
          title={tFlavor('dashboard.resetConfirmTitle')}
          primaryActionLabel={tFlavor('dashboard.reset')}
          cancelLabel={tFlavor('importDialog.cancel')}
          onPrimaryAction={() => {
            vibrateIfEnabled(vibrationEnabled)
            resetSession()
          }}
        >
          {tFlavor('dashboard.resetConfirmBody')}
        </AlertDialog>
      </DialogTrigger>
    </div>
  )
}
