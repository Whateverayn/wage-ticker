import { Button } from '@react-spectrum/s2/Button'
import { TextArea } from '@react-spectrum/s2/TextArea'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fromExportPayload, parseExportPayload, toExportPayload } from '../../data/exportSchema'
import type { FixedCost, PremiumBand, WorkSession } from '../../data/types'
import { useShareOrCopy } from '../../hooks/useShareOrCopy'
import { useAppStore } from '../../store/appStore'

const panelStyle = style({ display: 'flex', flexDirection: 'column', gap: 12, width: 'full' })
const actionsStyle = style({ display: 'flex', gap: 8 })
const noteStyle = style({ font: 'body-xs', color: 'neutral-subdued' })
const errorStyle = style({ font: 'body-xs', color: 'negative' })

function currentExportText(session: WorkSession | null, bands: PremiumBand[], costs: FixedCost[]): string {
  if (!session) return ''
  return JSON.stringify(toExportPayload({ session, bands, costs }), null, 2)
}

export function TextExportPanel() {
  const { t } = useTranslation()
  const { t: tFlavor } = useTranslation('flavor')
  const session = useAppStore((s) => s.session)
  const bands = useAppStore((s) => s.bands)
  const costs = useAppStore((s) => s.costs)
  const importPayload = useAppStore((s) => s.importPayload)
  const { capability, shareOrCopy } = useShareOrCopy()

  const [text, setText] = useState(() => currentExportText(session, bands, costs))
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!session) {
    return <p className={noteStyle}>{t('exchange.noSessionText')}</p>
  }

  async function handleShareOrCopy() {
    setError(null)
    const result = await shareOrCopy({ text, title: tFlavor('shareTitle') })
    if (result === 'shared') setMessage(t('exchange.shared'))
    else if (result === 'copied') setMessage(t('exchange.copied'))
    setTimeout(() => setMessage(null), 2000)
  }

  function handleLoad() {
    setError(null)
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      setError(t('exchange.errorInvalidJson'))
      return
    }
    const payload = parseExportPayload(parsed)
    if (!payload) {
      setError(t('exchange.errorMissingData'))
      return
    }
    importPayload(fromExportPayload(payload))
    setMessage(t('exchange.loaded'))
    setTimeout(() => setMessage(null), 2000)
  }

  const shareLabel = capability.canShare ? t('exchange.share') : capability.canCopyText ? t('exchange.copy') : null

  return (
    <div className={panelStyle}>
      <TextArea
        aria-label={t('exchange.textAreaAria')}
        value={text}
        onChange={setText}
        styles={style({ width: 'full' })}
      />
      <div className={actionsStyle}>
        {shareLabel && (
          <Button variant="secondary" onPress={handleShareOrCopy}>
            {shareLabel}
          </Button>
        )}
        <Button variant="primary" onPress={handleLoad}>
          {t('exchange.load')}
        </Button>
      </div>
      {message && <p className={noteStyle}>{message}</p>}
      {error && <p className={errorStyle}>{error}</p>}
      <p className={noteStyle}>
        {t('exchange.textFallbackNote')}
        {!shareLabel && t('exchange.textFallbackHint')}
      </p>
    </div>
  )
}
