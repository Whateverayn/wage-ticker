import { describe, expect, it } from 'vitest'
import type { FixedCost, PremiumBand, WorkSession } from '../data/types'
import { bandOverlapMs, computeSnapshot, computeTimeEarnings } from './earnings'

function at(hhmm: string, dayOffset = 0): Date {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(h, m, 0, 0)
  return d
}

function band(start: string, end: string, type: 'fixed' | 'percent', value: number): PremiumBand {
  return { id: 'b', start, end, type, value }
}

describe('computeTimeEarnings', () => {
  it('computes plain hours times wage with no bands', () => {
    const { baseYen, bonusYen, totalYen } = computeTimeEarnings(at('09:00'), at('17:00'), 1000, [])
    expect(baseYen).toBe(8000)
    expect(bonusYen).toBe(0)
    expect(totalYen).toBe(8000)
  })

  it('applies a same-day percent band fully inside the range', () => {
    const b = band('12:00', '13:00', 'percent', 50)
    const { bonusYen, totalYen } = computeTimeEarnings(at('09:00'), at('17:00'), 1000, [b])
    expect(bonusYen).toBe(500)
    expect(totalYen).toBe(8500)
  })

  it('applies an overnight fixed band crossing midnight', () => {
    const b = band('22:00', '05:00', 'fixed', 100) // 7h window
    const { bonusYen } = computeTimeEarnings(at('20:00'), at('06:00', 1), 1000, [b])
    expect(bonusYen).toBe(700)
  })

  it('applies overlapping bands additively, not deduped', () => {
    const nightBand = band('22:00', '23:00', 'fixed', 100) // 1h overlap
    const deliveryBand = band('22:00', '23:00', 'percent', 25) // same 1h overlap
    const { bonusYen } = computeTimeEarnings(at('20:00'), at('23:00'), 1000, [nightBand, deliveryBand])
    expect(bonusYen).toBe(100 * 1 + 1000 * 0.25 * 1)
  })

  it('treats a zero-length band as a full 24h wrap (end<=start always rolls to next day)', () => {
    const b = band('10:00', '10:00', 'fixed', 10)
    const { bonusYen } = computeTimeEarnings(at('00:00'), at('00:00', 1), 1000, [b])
    expect(bonusYen).toBe(10 * 24)
  })

  it('handles wage of 0', () => {
    const { baseYen, totalYen } = computeTimeEarnings(at('09:00'), at('17:00'), 0, [])
    expect(baseYen).toBe(0)
    expect(totalYen).toBe(0)
  })

  it('applies a negative band value as a reduction (no special clamping)', () => {
    const b = band('12:00', '13:00', 'fixed', -50)
    const { bonusYen, totalYen } = computeTimeEarnings(at('09:00'), at('17:00'), 1000, [b])
    expect(bonusYen).toBe(-50)
    expect(totalYen).toBe(7950)
  })
})

describe('bandOverlapMs', () => {
  it('stays bounded and correct across a multi-day range', () => {
    const b = band('22:00', '05:00', 'fixed', 100) // 7h/night
    const overlap = bandOverlapMs(b, at('09:00'), at('09:00', 10)) // 10 full nights
    expect(overlap).toBe(10 * 7 * 60 * 60 * 1000)
  })

  it('returns 0 for an empty or inverted range', () => {
    const b = band('22:00', '05:00', 'fixed', 100)
    expect(bandOverlapMs(b, at('09:00'), at('09:00'))).toBe(0)
    expect(bandOverlapMs(b, at('17:00'), at('09:00'))).toBe(0)
  })
})

describe('computeSnapshot', () => {
  it('reports remaining time and no overtime while within the scheduled window', () => {
    const session: WorkSession = {
      startAt: at('09:00').toISOString(),
      endAt: at('17:00').toISOString(),
      hourlyWage: 1000,
    }
    const snap = computeSnapshot(at('12:00'), session, [], [])
    expect(snap.isOvertime).toBe(false)
    expect(snap.overtimeMs).toBe(0)
    expect(snap.remainingMs).toBe(5 * 60 * 60 * 1000)
    expect(snap.progressPct).toBeCloseTo(37.5, 5)
  })

  it('switches to overtime accrual past the scheduled end, and keeps earning', () => {
    const session: WorkSession = {
      startAt: at('09:00').toISOString(),
      endAt: at('17:00').toISOString(),
      hourlyWage: 1000,
    }
    const snap = computeSnapshot(at('18:00'), session, [], [])
    expect(snap.isOvertime).toBe(true)
    expect(snap.remainingMs).toBe(0)
    expect(snap.overtimeMs).toBe(60 * 60 * 1000)
    expect(snap.timeEarnings.totalYen).toBe(9000)
    expect(snap.progressPct).toBeGreaterThan(100)
  })

  it('includes fixed costs in totalEarned alongside time-based earnings', () => {
    const session: WorkSession = {
      startAt: at('09:00').toISOString(),
      endAt: at('17:00').toISOString(),
      hourlyWage: 1000,
    }
    const costs: FixedCost[] = [{ id: 'c1', label: 'transport', amount: 300 }]
    const snap = computeSnapshot(at('10:00'), session, [], costs)
    expect(snap.fixedCostsTotal).toBe(300)
    expect(snap.totalEarned).toBe(snap.timeEarnings.totalYen + 300)
  })

  it('reports isBeforeStart before the shift begins, with no negative elapsed time', () => {
    const session: WorkSession = {
      startAt: at('09:00').toISOString(),
      endAt: at('17:00').toISOString(),
      hourlyWage: 1000,
    }
    const snap = computeSnapshot(at('08:00'), session, [], [])
    expect(snap.isBeforeStart).toBe(true)
    expect(snap.elapsedMs).toBe(0)
  })
})
