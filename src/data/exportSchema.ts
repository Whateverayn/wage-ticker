import type { ExportPayloadV1, FixedCost, PremiumBand, WorkSession } from './types'
import { generateId } from './uuid'

export interface ExportSource {
  session: WorkSession
  bands: PremiumBand[]
  costs: FixedCost[]
}

export interface ImportedSession {
  session: WorkSession
  bands: PremiumBand[]
  costs: FixedCost[]
}

export function toExportPayload(source: ExportSource): ExportPayloadV1 {
  return {
    v: 1,
    s: source.session.startAt,
    e: source.session.endAt,
    w: source.session.hourlyWage,
    b: source.bands.map((band) => [band.start, band.end, band.type === 'percent' ? 'p' : 'f', band.value]),
    c: source.costs.map((cost) => [cost.label, cost.amount]),
  }
}

export function fromExportPayload(payload: ExportPayloadV1): ImportedSession {
  return {
    session: { startAt: payload.s, endAt: payload.e, hourlyWage: payload.w },
    bands: payload.b.map(([start, end, type, value]) => ({
      id: generateId(),
      start,
      end,
      type: type === 'p' ? 'percent' : 'fixed',
      value,
    })),
    costs: payload.c.map(([label, amount]) => ({ id: generateId(), label, amount })),
  }
}

/**
 * Runtime-validates untrusted input (pasted text, decoded QR/URL data) into a
 * known-good ExportPayloadV1, or returns null. `v !== 1` is the hook point for
 * a future migratePayload(raw) branch once a v2 ships.
 */
export function parseExportPayload(raw: unknown): ExportPayloadV1 | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>

  if (obj.v !== 1) return null
  if (typeof obj.s !== 'string' || typeof obj.e !== 'string' || typeof obj.w !== 'number') return null
  if (!Array.isArray(obj.b) || !Array.isArray(obj.c)) return null

  const bandsValid = obj.b.every(
    (row): row is [string, string, 'p' | 'f', number] =>
      Array.isArray(row) &&
      row.length === 4 &&
      typeof row[0] === 'string' &&
      typeof row[1] === 'string' &&
      (row[2] === 'p' || row[2] === 'f') &&
      typeof row[3] === 'number',
  )
  const costsValid = obj.c.every(
    (row): row is [string, number] =>
      Array.isArray(row) && row.length === 2 && typeof row[0] === 'string' && typeof row[1] === 'number',
  )
  if (!bandsValid || !costsValid) return null

  return obj as unknown as ExportPayloadV1
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(encoded: string): Uint8Array {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** URL-safe compact encoding, used for both the QR payload and the `#/import?d=` deep link. */
export function encodePayloadForUrl(payload: ExportPayloadV1): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  return base64UrlEncode(bytes)
}

export function decodePayloadFromUrl(encoded: string): ExportPayloadV1 | null {
  try {
    const bytes = base64UrlDecode(encoded)
    const json = new TextDecoder().decode(bytes)
    return parseExportPayload(JSON.parse(json))
  } catch {
    return null
  }
}

/** Raw (pre-encoding) JSON byte size, used for the QR warning/hard-cap thresholds. */
export function payloadJsonByteSize(payload: ExportPayloadV1): number {
  return new TextEncoder().encode(JSON.stringify(payload)).length
}
