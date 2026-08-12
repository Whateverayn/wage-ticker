const moneyFormatter = new Intl.NumberFormat('ja-JP', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Fixed 2-decimal yen display, independent of UI language (per spec). */
export function formatMoney(amount: number): string {
  return `¥${moneyFormatter.format(amount)}`
}

/** Fixed 3-decimal percent display. */
export function formatPercent(pct: number): string {
  return `${pct.toFixed(3)}%`
}

/** h:mm:ss, no leading zero on hours. Negative durations clamp to 0. */
export function formatHMS(ms: number): string {
  const clamped = Math.max(0, ms)
  const totalSec = Math.floor(clamped / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
