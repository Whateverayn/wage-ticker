import { describe, expect, it } from 'vitest'
import type { FixedCost, PremiumBand, WorkSession } from './types'
import {
  decodePayloadFromUrl,
  encodePayloadForUrl,
  fromExportPayload,
  parseExportPayload,
  payloadJsonByteSize,
  toExportPayload,
} from './exportSchema'

const session: WorkSession = {
  startAt: '2026-08-12T09:00:00.000Z',
  endAt: '2026-08-12T17:00:00.000Z',
  hourlyWage: 1200,
}
const bands: PremiumBand[] = [{ id: 'b1', start: '22:00', end: '05:00', type: 'fixed', value: 100 }]
const costs: FixedCost[] = [{ id: 'c1', label: '交通費', amount: 300 }]

describe('export payload round trip', () => {
  it('round-trips session/bands/costs through toExportPayload/fromExportPayload', () => {
    const payload = toExportPayload({ session, bands, costs })
    const restored = fromExportPayload(payload)

    expect(restored.session).toEqual(session)
    expect(restored.bands.map(({ id: _id, ...rest }) => rest)).toEqual(bands.map(({ id: _id, ...rest }) => rest))
    expect(restored.costs.map(({ id: _id, ...rest }) => rest)).toEqual(costs.map(({ id: _id, ...rest }) => rest))
  })

  it('validates a well-formed payload via parseExportPayload', () => {
    const payload = toExportPayload({ session, bands, costs })
    const parsed = parseExportPayload(JSON.parse(JSON.stringify(payload)))
    expect(parsed).toEqual(payload)
  })

  it.each([
    ['wrong version', { v: 2, s: 'x', e: 'y', w: 1, b: [], c: [] }],
    ['non-string startAt', { v: 1, s: 123, e: 'y', w: 1, b: [], c: [] }],
    ['non-number wage', { v: 1, s: 'x', e: 'y', w: 'nope', b: [], c: [] }],
    ['bands not an array', { v: 1, s: 'x', e: 'y', w: 1, b: 'nope', c: [] }],
    ['malformed band tuple', { v: 1, s: 'x', e: 'y', w: 1, b: [['22:00']], c: [] }],
    ['null', null],
    ['a bare string', 'not an object'],
  ])('rejects %s', (_label, bad) => {
    expect(parseExportPayload(bad)).toBeNull()
  })

  it('round-trips through the URL-safe base64 encoding, including non-ASCII cost labels', () => {
    const payload = toExportPayload({ session, bands, costs })
    const encoded = encodePayloadForUrl(payload)
    expect(encoded).not.toMatch(/[+/=]/)
    expect(decodePayloadFromUrl(encoded)).toEqual(payload)
  })

  it('rejects garbage input to decodePayloadFromUrl without throwing', () => {
    expect(decodePayloadFromUrl('!!!not valid base64!!!')).toBeNull()
  })

  it('reports a byte size usable for the QR warning/hard-cap thresholds', () => {
    const payload = toExportPayload({ session, bands, costs })
    const size = payloadJsonByteSize(payload)
    expect(size).toBeGreaterThan(0)
    expect(size).toBeLessThan(300)
  })
})
