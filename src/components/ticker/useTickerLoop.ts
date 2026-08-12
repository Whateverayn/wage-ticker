import { useEffect, useRef } from 'react'
import { computeSnapshot, type TickerSnapshot } from '../../calc/earnings'
import { useAppStore } from '../../store/appStore'

/** 20fps -- matches the prototype's cadence, per explicit user preference. */
const TICK_INTERVAL_MS = 50

/**
 * Drives a snapshot callback at TICK_INTERVAL_MS via requestAnimationFrame,
 * paused automatically while the tab is hidden. Reads session/bands/costs
 * fresh from the store on every tick (via getState(), not a subscription),
 * so edits made elsewhere are picked up without restarting the loop.
 */
export function useTickerLoop(onTick: (snapshot: TickerSnapshot | null) => void) {
  const onTickRef = useRef(onTick)
  onTickRef.current = onTick

  useEffect(() => {
    let rafId = 0
    let lastTick = 0
    let running = true

    function frame(timestamp: number) {
      if (!running) return
      if (timestamp - lastTick >= TICK_INTERVAL_MS) {
        lastTick = timestamp
        const { session, bands, costs } = useAppStore.getState()
        onTickRef.current(session ? computeSnapshot(new Date(), session, bands, costs) : null)
      }
      rafId = requestAnimationFrame(frame)
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(rafId)
      } else if (!running) {
        running = true
        rafId = requestAnimationFrame(frame)
      }
    }

    rafId = requestAnimationFrame(frame)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}
