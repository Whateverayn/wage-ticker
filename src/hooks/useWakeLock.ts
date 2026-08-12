import { useEffect } from 'react'

/**
 * Keeps the screen on while `enabled` and the tab is visible. No-ops
 * entirely (never throws) on browsers without the Screen Wake Lock API --
 * callers should also hide/disable the toggle itself when unsupported.
 */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return

    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    async function acquire() {
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) {
          await lock.release()
          return
        }
        sentinel = lock
      } catch {
        // Wake lock can be refused (e.g. low battery); silently skip.
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && !sentinel) {
        acquire()
      }
    }

    acquire()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      sentinel?.release().catch(() => {})
      sentinel = null
    }
  }, [enabled])
}

export function isWakeLockSupported(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator
}
