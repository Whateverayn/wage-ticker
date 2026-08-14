import { Time } from '@internationalized/date'
import { Button } from '@react-spectrum/s2/Button'
import { Disclosure, DisclosurePanel, DisclosureTitle } from '@react-spectrum/s2/Disclosure'
import { Form } from '@react-spectrum/s2/Form'
import { NumberField } from '@react-spectrum/s2/NumberField'
import { TimeField } from '@react-spectrum/s2/TimeField'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { hhmmToTime, timeToHHMM } from '../calc/timeValue'
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
  const { t: tFlavor } = useTranslation('flavor')
  const startSession = useAppStore((s) => s.startSession)
  const vibrationEnabled = useAppStore((s) => s.features.vibrationEnabled)
  const draftStartTime = useAppStore((s) => s.draftStartTime)
  const draftEndTime = useAppStore((s) => s.draftEndTime)
  const draftWage = useAppStore((s) => s.draftWage)
  const setDraftStartTime = useAppStore((s) => s.setDraftStartTime)
  const setDraftEndTime = useAppStore((s) => s.setDraftEndTime)
  const setDraftWage = useAppStore((s) => s.setDraftWage)

  // Local Time-object state mirrors the store's persisted 'HH:mm' strings --
  // TimeField needs @internationalized/date's Time type, the store keeps the
  // plain string form shared with PremiumBand times. Initialized once from
  // whatever was last saved, so this view no longer resets to hardcoded
  // defaults on reload (matching how bands/costs already behave).
  const [startTime, setStartTime] = useState<Time | null>(() => hhmmToTime(draftStartTime))
  const [endTime, setEndTime] = useState<Time | null>(() => hhmmToTime(draftEndTime))
  const [wage, setWage] = useState<number | undefined>(draftWage)

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
        <TimeField
          label={tFlavor('setup.startTime')}
          value={startTime}
          onChange={(time) => {
            setStartTime(time)
            if (time) setDraftStartTime(timeToHHMM(time))
          }}
          isRequired
        />
        <TimeField
          label={tFlavor('setup.endTime')}
          value={endTime}
          onChange={(time) => {
            setEndTime(time)
            if (time) setDraftEndTime(timeToHHMM(time))
          }}
          isRequired
        />
        <NumberField
          label={tFlavor('setup.wage')}
          value={wage}
          onChange={(value) => {
            setWage(value)
            setDraftWage(value)
          }}
          minValue={0}
          isRequired
        />
        <Button type="submit" variant="primary" isDisabled={!canStart}>
          {tFlavor('setup.start')}
        </Button>
      </Form>

      <Disclosure styles={style({ width: 'full' })}>
        <DisclosureTitle>{tFlavor('setup.advancedTitle')}</DisclosureTitle>
        <DisclosurePanel>
          <div className={sectionStyle}>
            <div>
              <p className={style({ font: 'body-sm', color: 'neutral-subdued', marginBottom: 8 })}>
                {tFlavor('setup.bandsHeading')}
              </p>
              <BandList />
            </div>
            <div>
              <p className={style({ font: 'body-sm', color: 'neutral-subdued', marginBottom: 8 })}>
                {tFlavor('setup.costsHeading')}
              </p>
              <CostList />
            </div>
          </div>
        </DisclosurePanel>
      </Disclosure>
    </div>
  )
}
