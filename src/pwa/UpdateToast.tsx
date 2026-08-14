import { ToastQueue } from '@react-spectrum/s2/Toast'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useServiceWorkerUpdate } from './useServiceWorkerUpdate'

/** No visual output of its own -- just bridges SW update state to a ToastQueue call. */
export function UpdateToast() {
  const { t } = useTranslation('flavor')
  const { needRefresh, reload, dismiss } = useServiceWorkerUpdate()

  useEffect(() => {
    if (!needRefresh) return
    ToastQueue.info(t('update.available'), {
      actionLabel: t('update.action'),
      onAction: reload,
      shouldCloseOnAction: true,
      onClose: dismiss,
    })
  }, [needRefresh, reload, dismiss, t])

  return null
}
