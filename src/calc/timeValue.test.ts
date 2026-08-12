import { Time } from '@internationalized/date'
import { describe, expect, it } from 'vitest'
import { hhmmToTime, timeToHHMM } from './timeValue'

describe('timeValue conversions', () => {
  it('round-trips HH:mm through Time and back, zero-padded', () => {
    expect(timeToHHMM(hhmmToTime('22:00'))).toBe('22:00')
    expect(timeToHHMM(hhmmToTime('05:00'))).toBe('05:00')
    expect(timeToHHMM(new Time(9, 5))).toBe('09:05')
  })
})
