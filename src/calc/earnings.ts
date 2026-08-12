import type { FixedCost, PremiumBand, WorkSession } from '../data/types'

const MS_PER_HOUR = 60 * 60 * 1000

/**
 * Safety cap on the day-loop in bandOverlapMs (~400 days). Only guards
 * against a pathologically stale forgotten session; realistic shifts never
 * approach it. On trip, logs a warning and returns a partial (undercounted)
 * result rather than hanging.
 */
export const MAX_BAND_LOOP_ITERATIONS = 400

function parseTimeOnDate(hhmm: string, baseDate: Date): Date {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(baseDate)
  d.setHours(h, m, 0, 0)
  return d
}

/**
 * Overlap (ms) between a recurring daily band and a fixed [rangeStart, rangeEnd)
 * window. Walks one day at a time; each day's band instance is <=24h and starts
 * 24h apart from its neighbors, so instances never overlap each other and the
 * per-day overlaps can simply be summed.
 *
 * Note: start === end is treated the same as any other end <= start case, i.e.
 * it wraps to a full 24h band (not zero) -- this falls out of the "crosses
 * midnight" rule and is intentional, not special-cased.
 */
export function bandOverlapMs(band: PremiumBand, rangeStart: Date, rangeEnd: Date): number {
  if (rangeEnd.getTime() <= rangeStart.getTime()) return 0

  let total = 0
  const dayCursor = new Date(rangeStart)
  dayCursor.setHours(0, 0, 0, 0)
  dayCursor.setDate(dayCursor.getDate() - 1)

  const limit = new Date(rangeEnd)
  limit.setHours(0, 0, 0, 0)
  limit.setDate(limit.getDate() + 1)

  let iterations = 0
  while (dayCursor.getTime() <= limit.getTime()) {
    if (++iterations > MAX_BAND_LOOP_ITERATIONS) {
      console.warn('bandOverlapMs: exceeded MAX_BAND_LOOP_ITERATIONS, returning partial result')
      break
    }
    const bandStart = parseTimeOnDate(band.start, dayCursor)
    const bandEnd = parseTimeOnDate(band.end, dayCursor)
    if (bandEnd.getTime() <= bandStart.getTime()) {
      bandEnd.setDate(bandEnd.getDate() + 1)
    }
    const overlapStart = Math.max(bandStart.getTime(), rangeStart.getTime())
    const overlapEnd = Math.min(bandEnd.getTime(), rangeEnd.getTime())
    if (overlapEnd > overlapStart) total += overlapEnd - overlapStart
    dayCursor.setDate(dayCursor.getDate() + 1)
  }
  return total
}

export interface TimeEarnings {
  baseYen: number
  bonusYen: number
  totalYen: number
}

/** Additive: bonuses from every band overlapping a given moment all apply. */
export function computeTimeEarnings(
  rangeStart: Date,
  rangeEnd: Date,
  hourlyWage: number,
  bands: PremiumBand[],
): TimeEarnings {
  const hours = Math.max(0, rangeEnd.getTime() - rangeStart.getTime()) / MS_PER_HOUR
  const baseYen = hourlyWage * hours

  let bonusYen = 0
  for (const band of bands) {
    const overlapHours = bandOverlapMs(band, rangeStart, rangeEnd) / MS_PER_HOUR
    if (overlapHours <= 0) continue
    bonusYen +=
      band.type === 'percent' ? hourlyWage * (band.value / 100) * overlapHours : band.value * overlapHours
  }

  return { baseYen, bonusYen, totalYen: baseYen + bonusYen }
}

export interface TickerSnapshot {
  now: Date
  elapsedMs: number
  scheduledMs: number
  /** 0 once overtime starts */
  remainingMs: number
  /** 0 until overtime starts */
  overtimeMs: number
  isOvertime: boolean
  isBeforeStart: boolean
  /** Uncapped -- can exceed 100 during overtime. UI caps only the bar width. */
  progressPct: number
  timeEarnings: TimeEarnings
  fixedCostsTotal: number
  totalEarned: number
}

export function computeSnapshot(
  now: Date,
  session: WorkSession,
  bands: PremiumBand[],
  costs: FixedCost[],
): TickerSnapshot {
  const startAt = new Date(session.startAt)
  const endAt = new Date(session.endAt)

  const scheduledMs = Math.max(0, endAt.getTime() - startAt.getTime())
  const elapsedMs = Math.max(0, now.getTime() - startAt.getTime())
  const isBeforeStart = now.getTime() < startAt.getTime()
  const isOvertime = now.getTime() > endAt.getTime()
  const remainingMs = isOvertime ? 0 : Math.max(0, endAt.getTime() - now.getTime())
  const overtimeMs = isOvertime ? now.getTime() - endAt.getTime() : 0
  const progressPct = scheduledMs > 0 ? (elapsedMs / scheduledMs) * 100 : 0

  const timeEarnings = computeTimeEarnings(startAt, now, session.hourlyWage, bands)
  const fixedCostsTotal = costs.reduce((sum, cost) => sum + cost.amount, 0)
  const totalEarned = timeEarnings.totalYen + fixedCostsTotal

  return {
    now,
    elapsedMs,
    scheduledMs,
    remainingMs,
    overtimeMs,
    isOvertime,
    isBeforeStart,
    progressPct,
    timeEarnings,
    fixedCostsTotal,
    totalEarned,
  }
}
