import { useEffect } from 'react'
import type { ThemeOverride } from '../data/types'

// Exact hex values S2's 'base' background layer resolves to (confirmed from
// the built CSS's --s2-container-bg custom property), not a brand color --
// a fixed brand color here would mismatch the real page background and look
// like a stray bar, especially on Android where only the title bar area
// picks up theme-color.
const LIGHT_BG = '#ffffff'
const DARK_BG = '#222222'

export function useThemeColorMeta(theme: ThemeOverride) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return

    function sync() {
      const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      meta!.setAttribute('content', isDark ? DARK_BG : LIGHT_BG)
    }

    sync()
    if (theme !== 'auto') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [theme])
}
