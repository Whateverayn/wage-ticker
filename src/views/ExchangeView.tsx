import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import { useTranslation } from 'react-i18next'
import { QrExportPanel } from '../components/exchange/QrExportPanel'
import { QrScanPanel } from '../components/exchange/QrScanPanel'
import { TextExportPanel } from '../components/exchange/TextExportPanel'
import type { ExportPayloadV1 } from '../data/types'

const sectionStyle = style({ display: 'flex', flexDirection: 'column', gap: 24 })
const headingStyle = style({ font: 'title-sm', marginBottom: 4 })

export function ExchangeView({ onScanned }: { onScanned: (payload: ExportPayloadV1) => void }) {
  const { t } = useTranslation()
  return (
    <div className={sectionStyle}>
      <div>
        <p className={headingStyle}>{t('exchange.textHeading')}</p>
        <TextExportPanel />
      </div>
      <div>
        <p className={headingStyle}>{t('exchange.qrHeading')}</p>
        <QrExportPanel />
      </div>
      <div>
        <p className={headingStyle}>{t('exchange.scanHeading')}</p>
        <QrScanPanel onDecoded={onScanned} />
      </div>
    </div>
  )
}
