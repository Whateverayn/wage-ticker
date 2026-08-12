import { useMemo } from 'react'

export interface ShareOrCopyInput {
  text?: string
  file?: { blob: Blob; filename: string; mimeType: string }
  title?: string
}

/**
 * - 'shared': navigator.share invoked (whether the user completed or cancelled
 *   the native sheet -- from the app's perspective the action was handed off successfully).
 * - 'copied': written to the clipboard (Clipboard API or execCommand fallback).
 * - 'displayed': nothing could be copied/shared automatically; the caller should
 *   show the content itself (e.g. an <img> or selectable text) for long-press/
 *   context-menu copying -- this is the intended terminal fallback, not a failure.
 * - 'failed': no mechanism was available at all.
 */
export type ShareOrCopyResult = 'shared' | 'copied' | 'displayed' | 'failed'

export interface ShareOrCopyCapability {
  canShare: boolean
  canShareFiles: boolean
  canCopyText: boolean
  canCopyImage: boolean
}

function detectCapability(): ShareOrCopyCapability {
  const nav = typeof navigator === 'undefined' ? undefined : navigator
  return {
    canShare: !!nav?.share,
    canShareFiles: !!nav?.share && !!nav.canShare,
    canCopyText: !!nav?.clipboard?.writeText || typeof document?.execCommand === 'function',
    canCopyImage: !!nav?.clipboard?.write && typeof ClipboardItem !== 'undefined',
  }
}

async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through to execCommand
    }
  }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

/** One reusable share/copy cascade, feature-detected once, shared by text and image export. */
export function useShareOrCopy() {
  const capability = useMemo(detectCapability, [])

  async function shareOrCopy(input: ShareOrCopyInput): Promise<ShareOrCopyResult> {
    const { text, file, title } = input

    if (file) {
      const shareFile = new File([file.blob], file.filename, { type: file.mimeType })
      if (capability.canShareFiles && navigator.canShare!({ files: [shareFile] })) {
        try {
          await navigator.share({ files: [shareFile], title })
          return 'shared'
        } catch (e) {
          if ((e as Error).name !== 'AbortError') {
            // fall through to clipboard/display
          } else {
            return 'shared'
          }
        }
      }
      if (capability.canCopyImage) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ [file.mimeType]: file.blob })])
          return 'copied'
        } catch {
          // fall through to display
        }
      }
      return 'displayed'
    }

    if (text) {
      if (capability.canShare) {
        try {
          await navigator.share({ text, title })
          return 'shared'
        } catch (e) {
          if ((e as Error).name === 'AbortError') return 'shared'
          // fall through to copy
        }
      }
      if (capability.canCopyText) {
        return (await copyText(text)) ? 'copied' : 'failed'
      }
      return 'displayed'
    }

    return 'failed'
  }

  return { capability, shareOrCopy }
}
