import { Time } from '@internationalized/date'

/** Adapts our plain 'HH:mm' band-time strings to/from S2 TimeField's Time value type. */
export function timeToHHMM(time: Time): string {
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`
}

export function hhmmToTime(hhmm: string): Time {
  const [hour, minute] = hhmm.split(':').map(Number)
  return new Time(hour, minute)
}
