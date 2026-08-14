import Delete from '@react-spectrum/s2/icons/Delete'
import { ActionButton } from '@react-spectrum/s2/ActionButton'
import { NumberField } from '@react-spectrum/s2/NumberField'
import { Picker, PickerItem } from '@react-spectrum/s2/Picker'
import { TimeField } from '@react-spectrum/s2/TimeField'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import { useTranslation } from 'react-i18next'
import { hhmmToTime, timeToHHMM } from '../../calc/timeValue'
import type { BandValueType, PremiumBand } from '../../data/types'
import { useAppStore } from '../../store/appStore'

const rowStyle = style({ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap' })
const narrowField = style({ width: 100 })

export function BandRow({ band }: { band: PremiumBand }) {
  const { t } = useTranslation()
  const { t: tFlavor } = useTranslation('flavor')
  const updateBand = useAppStore((s) => s.updateBand)
  const removeBand = useAppStore((s) => s.removeBand)

  return (
    <div className={rowStyle}>
      <TimeField
        aria-label={t('setup.bandStartAria')}
        value={hhmmToTime(band.start)}
        onChange={(time) => time && updateBand(band.id, { start: timeToHHMM(time) })}
        styles={narrowField}
      />
      <TimeField
        aria-label={t('setup.bandEndAria')}
        value={hhmmToTime(band.end)}
        onChange={(time) => time && updateBand(band.id, { end: timeToHHMM(time) })}
        styles={narrowField}
      />
      <Picker
        aria-label={t('setup.bandTypeAria')}
        value={band.type}
        onChange={(value) => value && updateBand(band.id, { type: value as BandValueType })}
        styles={narrowField}
      >
        <PickerItem id="percent">{tFlavor('setup.bandTypePercent')}</PickerItem>
        <PickerItem id="fixed">{tFlavor('setup.bandTypeFixed')}</PickerItem>
      </Picker>
      <NumberField
        aria-label={t('setup.bandValueAria')}
        value={band.value}
        onChange={(value) => updateBand(band.id, { value })}
        styles={style({ width: 90 })}
      />
      <ActionButton aria-label={t('setup.deleteBandAria')} onPress={() => removeBand(band.id)}>
        <Delete />
      </ActionButton>
    </div>
  )
}
