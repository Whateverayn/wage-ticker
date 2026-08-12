import { Time } from '@internationalized/date'
import { Button } from '@react-spectrum/s2/Button'
import { Disclosure, DisclosurePanel, DisclosureTitle } from '@react-spectrum/s2/Disclosure'
import { Form } from '@react-spectrum/s2/Form'
import { NumberField } from '@react-spectrum/s2/NumberField'
import { TimeField } from '@react-spectrum/s2/TimeField'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BandList } from '../components/bands/BandList'
import { CostList } from '../components/costs/CostList'
import { vibrateIfEnabled } from '../hooks/useVibration'
import { useAppStore } from '../store/appStore'

function timeToDate(time: Time, base: Date): Date {
  const d = new Date(base)
  d.setHours(time.hour, time.minute, 0, 0)
  return d
}

// Form lays out its own children (label/field stacking + gap); `styles` here
// only needs the restricted layout subset Spectrum components accept.
const formStyle = style({ width: 'full', maxWidth: 360 })

const sectionStyle = style({ display: 'flex', flexDirection: 'column', gap: 16 })

export function SetupView({ onStarted }: { onStarted: () => void }) {
  const { t } = useTranslation()
  const startSession = useAppStore((s) => s.startSession)
  const vibrationEnabled = useAppStore((s) => s.features.vibrationEnabled)
  const [startTime, setStartTime] = useState<Time | null>(new Time(9, 0))
  const [endTime, setEndTime] = useState<Time | null>(new Time(17, 0))
  const [wage, setWage] = useState<number | undefined>(1200)

  const canStart = startTime != null && endTime != null && typeof wage === 'number' && wage > 0

  function handleStart() {
    if (!canStart || !startTime || !endTime || wage == null) return
    const now = new Date()
    const startAt = timeToDate(startTime, now)
    let endAt = timeToDate(endTime, now)
    if (endAt.getTime() <= startAt.getTime()) {
      endAt = new Date(endAt.getTime() + 24 * 60 * 60 * 1000)
    }
    startSession({ startAt: startAt.toISOString(), endAt: endAt.toISOString(), hourlyWage: wage })
    vibrateIfEnabled(vibrationEnabled)
    onStarted()
  }

  return (
    <div className={sectionStyle}>
      <Form
        styles={formStyle}
        onSubmit={(e) => {
          e.preventDefault()
          handleStart()
        }}
      >
        <TimeField label={t('setup.startTime')} value={startTime} onChange={setStartTime} isRequired />
        <TimeField label={t('setup.endTime')} value={endTime} onChange={setEndTime} isRequired />
        <NumberField label={t('setup.wage')} value={wage} onChange={setWage} minValue={0} isRequired />
        <Button type="submit" variant="primary" isDisabled={!canStart}>
          {t('setup.start')}
        </Button>
      </Form>

      <Disclosure styles={style({ width: 'full' })}>
        <DisclosureTitle>{t('setup.advancedTitle')}</DisclosureTitle>
        <DisclosurePanel>
          <div className={sectionStyle}>
            <div>
              <p className={style({ font: 'body-sm', color: 'neutral-subdued', marginBottom: 8 })}>
                {t('setup.bandsHeading')}
              </p>
              <BandList />
            </div>
            <div>
              <p className={style({ font: 'body-sm', color: 'neutral-subdued', marginBottom: 8 })}>
                {t('setup.costsHeading')}
              </p>
              <CostList />
            </div>
          </div>
        </DisclosurePanel>
      </Disclosure>
    </div>
  )
}
