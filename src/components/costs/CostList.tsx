import { ActionButton } from '@react-spectrum/s2/ActionButton'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../store/appStore'
import { CostRow } from './CostRow'

const listStyle = style({ display: 'flex', flexDirection: 'column', gap: 12 })

export function CostList() {
  const { t } = useTranslation('flavor')
  const costs = useAppStore((s) => s.costs)
  const addCost = useAppStore((s) => s.addCost)

  return (
    <div className={listStyle}>
      {costs.map((cost) => (
        <CostRow key={cost.id} cost={cost} />
      ))}
      <ActionButton onPress={() => addCost({ label: t('setup.defaultCostLabel'), amount: 0 })}>
        {t('setup.addCost')}
      </ActionButton>
    </div>
  )
}
