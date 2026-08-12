import { describe, expect, it } from 'vitest'
import { encodePayloadForUrl, toExportPayload } from '../data/exportSchema'
import type { WorkSession } from '../data/types'
import { isSetupShortcut, parseImportDeepLink, parseShareTarget } from './routerLite'

const session: WorkSession = {
  startAt: '2026-08-13T00:00:00.000Z',
  endAt: '2026-08-13T08:00:00.000Z',
  hourlyWage: 1200,
}

describe('parseImportDeepLink', () => {
  it('extracts and decodes the payload from a #/import?d= hash', () => {
    const payload = toExportPayload({ session, bands: [], costs: [] })
    const encoded = encodePayloadForUrl(payload)
    expect(parseImportDeepLink(`#/import?d=${encoded}`)).toEqual(payload)
  })

  it('returns null when there is no d= param', () => {
    expect(parseImportDeepLink('#/setup')).toBeNull()
    expect(parseImportDeepLink('')).toBeNull()
  })
})

describe('parseShareTarget', () => {
  const payload = toExportPayload({ session, bands: [], costs: [] })

  it('parses raw exported JSON shared as text', () => {
    const search = `?text=${encodeURIComponent(JSON.stringify(payload))}`
    expect(parseShareTarget(search)).toEqual(payload)
  })

  it('parses a #/import?d= link shared as text or url', () => {
    const encoded = encodePayloadForUrl(payload)
    const link = encodeURIComponent(`https://example.com/#/import?d=${encoded}`)
    expect(parseShareTarget(`?url=${link}`)).toEqual(payload)
    expect(parseShareTarget(`?text=${link}`)).toEqual(payload)
  })

  it('returns null for unrelated shared content', () => {
    expect(parseShareTarget('?text=hello&url=https://example.com')).toBeNull()
    expect(parseShareTarget('')).toBeNull()
  })
})

describe('isSetupShortcut', () => {
  it('matches only the exact #/setup hash', () => {
    expect(isSetupShortcut('#/setup')).toBe(true)
    expect(isSetupShortcut('#/import?d=x')).toBe(false)
    expect(isSetupShortcut('')).toBe(false)
  })
})
