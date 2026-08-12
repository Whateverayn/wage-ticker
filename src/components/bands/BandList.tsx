import { ActionButton } from '@react-spectrum/s2/ActionButton'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store/appStore'
import { BandRow } from './BandRow'

const listStyle = style({ display: 'flex', flexDirection: 'column', gap: 12 })

export function BandList() {
  const { t } = useTranslation()
  const bands = useAppStore((s) => s.bands)
  const addBand = useAppStore((s) => s.addBand)

  return (
    <div className={listStyle}>
      {bands.map((band) => (
        <BandRow key={band.id} band={band} />
      ))}
      <ActionButton onPress={() => addBand({ start: '22:00', end: '05:00', type: 'percent', value: 25 })}>
        {t('setup.addBand')}
      </ActionButton>
    </div>
  )
}
