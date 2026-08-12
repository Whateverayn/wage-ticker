import { Content, Heading, InlineAlert } from '@react-spectrum/s2/InlineAlert'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { buildImportUrl } from '../../app/routerLite'
import { encodePayloadForUrl, payloadJsonByteSize, toExportPayload } from '../../data/exportSchema'
import { useAppStore } from '../../store/appStore'

// Conservative, UX-driven thresholds (phone-camera scan reliability degrades
// well before the QR spec's theoretical byte ceiling) -- not spec limits.
const SOFT_WARNING_BYTES = 300
const HARD_CAP_BYTES = 900

const panelStyle = style({ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' })
const noteStyle = style({ font: 'body-sm', color: 'neutral-subdued' })
const qrImgStyle = style({ borderRadius: 'lg' })

export function QrExportPanel() {
  const { t } = useTranslation()
  const session = useAppStore((s) => s.session)
  const bands = useAppStore((s) => s.bands)
  const costs = useAppStore((s) => s.costs)
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  const payload = session ? toExportPayload({ session, bands, costs }) : null
  const byteSize = payload ? payloadJsonByteSize(payload) : 0
  const tooLarge = byteSize > HARD_CAP_BYTES

  useEffect(() => {
    if (!payload || tooLarge) {
      setDataUrl(null)
      return
    }
    const url = buildImportUrl(encodePayloadForUrl(payload))
    let cancelled = false
    QRCode.toDataURL(url, { errorCorrectionLevel: 'M', margin: 1, scale: 6 })
      .then((generated) => {
        if (!cancelled) setDataUrl(generated)
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [payload, tooLarge])

  if (!session) {
    return <p className={noteStyle}>{t('exchange.noSessionQr')}</p>
  }

  return (
    <div className={panelStyle}>
      {tooLarge && (
        <InlineAlert variant="negative">
          <Heading>{t('exchange.qrTooLargeTitle')}</Heading>
          <Content>{t('exchange.qrTooLargeBody')}</Content>
        </InlineAlert>
      )}
      {!tooLarge && byteSize > SOFT_WARNING_BYTES && (
        <InlineAlert variant="notice">
          <Heading>{t('exchange.qrWarnTitle')}</Heading>
          <Content>{t('exchange.qrWarnBody')}</Content>
        </InlineAlert>
      )}
      {dataUrl && <img src={dataUrl} alt={t('exchange.qrImageAlt')} width={240} height={240} className={qrImgStyle} />}
      <p className={noteStyle}>{t('exchange.qrHint')}</p>
    </div>
  )
}
