import { Button } from '@react-spectrum/s2/Button'
import { ButtonGroup, Content, Dialog, DialogContainer, Heading } from '@react-spectrum/s2/Dialog'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '../calc/format'
import { fromExportPayload } from '../data/exportSchema'
import type { ExportPayloadV1 } from '../data/types'
import { toS2Locale } from '../i18n/localeRegistry'
import { useAppStore } from '../store/appStore'

interface ImportDialogProps {
  payload: ExportPayloadV1 | null
  onCancel: () => void
  onImported: () => void
}

/** Always shown before an import overwrites session/bands/costs -- never silent. */
export function ImportDialog({ payload, onCancel, onImported }: ImportDialogProps) {
  const { t } = useTranslation()
  const locale = useAppStore((s) => s.locale)
  const importPayload = useAppStore((s) => s.importPayload)
  const dateLocale = toS2Locale(locale)

  return (
    <DialogContainer onDismiss={onCancel}>
      {payload && (
        <Dialog>
          {({ close }) => (
            <>
              <Heading slot="title">{t('importDialog.title')}</Heading>
              <Content>
                <p>
                  {t('importDialog.startLabel')} {new Date(payload.s).toLocaleString(dateLocale)}
                  <br />
                  {t('importDialog.endLabel')} {new Date(payload.e).toLocaleString(dateLocale)}
                  <br />
                  {t('importDialog.wageLabel')} {formatMoney(payload.w)}
                  {t('importDialog.wageUnit')}
                  <br />
                  {t('importDialog.bandsCostsLabel', { bands: payload.b.length, costs: payload.c.length })}
                </p>
                <p>{t('importDialog.overwriteNotice')}</p>
              </Content>
              <ButtonGroup>
                <Button
                  variant="secondary"
                  onPress={() => {
                    close()
                    onCancel()
                  }}
                >
                  {t('importDialog.cancel')}
                </Button>
                <Button
                  variant="accent"
                  onPress={() => {
                    importPayload(fromExportPayload(payload))
                    close()
                    onImported()
                  }}
                >
                  {t('importDialog.confirm')}
                </Button>
              </ButtonGroup>
            </>
          )}
        </Dialog>
      )}
    </DialogContainer>
  )
}
