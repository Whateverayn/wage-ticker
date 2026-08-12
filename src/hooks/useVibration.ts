/** iOS Safari has no Vibration API -- this is always a safe, silent no-op there. */
export function isVibrationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

export function vibrateIfEnabled(enabled: boolean, pattern: number | number[] = 40): void {
  if (!enabled || !isVibrationSupported()) return
  try {
    navigator.vibrate(pattern)
  } catch {
    // Some browsers throw on vibrate() in unsupported contexts; ignore.
  }
}
