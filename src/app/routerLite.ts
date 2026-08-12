import { decodePayloadFromUrl, parseExportPayload } from '../data/exportSchema'
import type { ExportPayloadV1 } from '../data/types'

/**
 * Parses a `#/import?d=<payload>` deep link (from a scanned QR or shared
 * link). Intentionally lenient about the exact hash shape so a
 * screenshot-shared or pre-deploy-domain link still works.
 */
export function parseImportDeepLink(hash: string): ExportPayloadV1 | null {
  const match = hash.match(/d=([A-Za-z0-9_-]+)/)
  if (!match) return null
  return decodePayloadFromUrl(match[1])
}

export function buildImportUrl(encodedPayload: string): string {
  return `${window.location.origin}${window.location.pathname}#/import?d=${encodedPayload}`
}

/**
 * Android Web Share Target lands here as real query params (never a hash --
 * share_target's `action` is matched against a normal navigation). Covers
 * two cases: the shared text IS our raw exported JSON (shared straight out
 * of TextExportPanel), or it contains a `#/import?d=` link (shared as a URL).
 */
export function parseShareTarget(search: string): ExportPayloadV1 | null {
  const params = new URLSearchParams(search)
  const text = params.get('text') ?? ''
  const url = params.get('url') ?? ''

  try {
    const parsed = parseExportPayload(JSON.parse(text))
    if (parsed) return parsed
  } catch {
    // not raw JSON; fall through to link extraction
  }

  const match = `${text} ${url}`.match(/d=([A-Za-z0-9_-]+)/)
  return match ? decodePayloadFromUrl(match[1]) : null
}

export function isSetupShortcut(hash: string): boolean {
  return hash === '#/setup'
}
