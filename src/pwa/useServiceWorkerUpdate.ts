import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * registerType is 'prompt' (not 'autoUpdate') on purpose: silently swapping
 * the app under a live, running elapsed-time session would be jarring.
 * This surfaces an explicit reload prompt instead (see UpdateToast).
 */
export function useServiceWorkerUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  return {
    needRefresh,
    dismiss: () => setNeedRefresh(false),
    reload: () => updateServiceWorker(true),
  }
}
