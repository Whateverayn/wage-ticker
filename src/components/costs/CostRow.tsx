import Delete from '@react-spectrum/s2/icons/Delete'
import { ActionButton } from '@react-spectrum/s2/ActionButton'
import { NumberField } from '@react-spectrum/s2/NumberField'
import { TextField } from '@react-spectrum/s2/TextField'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import { useTranslation } from 'react-i18next'
import type { FixedCost } from '../../data/types'
import { useAppStore } from '../../store/appStore'

const rowStyle = style({ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap' })

export function CostRow({ cost }: { cost: FixedCost }) {
  const { t } = useTranslation()
  const updateCost = useAppStore((s) => s.updateCost)
  const removeCost = useAppStore((s) => s.removeCost)

  return (
    <div className={rowStyle}>
      <TextField
        aria-label={t('setup.costLabelAria')}
        value={cost.label}
        onChange={(label) => updateCost(cost.id, { label })}
        styles={style({ width: 140 })}
      />
      <NumberField
        aria-label={t('setup.costAmountAria')}
        value={cost.amount}
        onChange={(amount) => updateCost(cost.id, { amount })}
        styles={style({ width: 100 })}
      />
      <ActionButton aria-label={t('setup.deleteCostAria')} onPress={() => removeCost(cost.id)}>
        <Delete />
      </ActionButton>
    </div>
  )
}
