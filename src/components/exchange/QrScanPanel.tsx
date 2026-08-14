import { Button } from '@react-spectrum/s2/Button'
import { Content, Heading, InlineAlert } from '@react-spectrum/s2/InlineAlert'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import QrScanner from 'qr-scanner'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { decodePayloadFromUrl } from '../../data/exportSchema'
import type { ExportPayloadV1 } from '../../data/types'

type ScanState = 'idle' | 'starting' | 'scanning' | 'denied' | 'unsupported'

const panelStyle = style({ display: 'flex', flexDirection: 'column', gap: 12 })
const videoStyle = style({ width: 'full', maxWidth: 320, borderRadius: 'lg', backgroundColor: 'gray-subtle' })

function extractEncodedPayload(scannedText: string): string {
  const match = scannedText.match(/[?&#]d=([A-Za-z0-9_-]+)/)
  return match ? match[1] : scannedText
}

export function QrScanPanel({ onDecoded }: { onDecoded: (payload: ExportPayloadV1) => void }) {
  const { t } = useTranslation('flavor')
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [state, setState] = useState<ScanState>('idle')

  useEffect(() => {
    return () => {
      scannerRef.current?.destroy()
      scannerRef.current = null
    }
  }, [])

  // qr-scanner's underlying <video>.play() can reject asynchronously *after*
  // scanner.start() has already resolved (e.g. stream dies right after
  // starting), which would otherwise surface only as an unhandled rejection
  // and leave the UI stuck showing "scanning" with a dead camera. Narrowly
  // scoped to while a scan attempt is in flight.
  useEffect(() => {
    if (state !== 'starting' && state !== 'scanning') return
    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      event.preventDefault()
      scannerRef.current?.stop()
      setState('denied')
    }
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  }, [state])

  async function startScanning() {
    if (!(await QrScanner.hasCamera())) {
      setState('unsupported')
      return
    }
    if (!videoRef.current) return
    setState('starting')

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        const payload = decodePayloadFromUrl(extractEncodedPayload(result.data))
        if (payload) {
          scanner.stop()
          onDecoded(payload)
        }
      },
      { returnDetailedScanResult: true },
    )
    scannerRef.current = scanner

    try {
      await scanner.start()
      setState('scanning')
    } catch {
      setState('denied')
    }
  }

  function stopScanning() {
    scannerRef.current?.stop()
    setState('idle')
  }

  return (
    <div className={panelStyle}>
      <video ref={videoRef} className={videoStyle} muted playsInline />
      {(state === 'idle' || state === 'starting') && (
        <Button variant="secondary" onPress={startScanning} isPending={state === 'starting'}>
          {t('exchange.scanStart')}
        </Button>
      )}
      {state === 'scanning' && (
        <Button variant="secondary" onPress={stopScanning}>
          {t('exchange.scanStop')}
        </Button>
      )}
      {state === 'denied' && (
        <InlineAlert variant="negative">
          <Heading>{t('exchange.scanDeniedTitle')}</Heading>
          <Content>{t('exchange.scanDeniedBody')}</Content>
        </InlineAlert>
      )}
      {state === 'unsupported' && (
        <InlineAlert variant="notice">
          <Heading>{t('exchange.scanUnsupportedTitle')}</Heading>
          <Content>{t('exchange.scanUnsupportedBody')}</Content>
        </InlineAlert>
      )}
    </div>
  )
}
