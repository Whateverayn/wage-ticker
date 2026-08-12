import type { ReactNode } from 'react'
import { css, style } from '@react-spectrum/s2/style' with { type: 'macro' }

// env(safe-area-inset-*) isn't part of the style macro's constrained token set,
// so this is a deliberate, narrow use of the css() escape hatch -- not a
// custom-design choice, just infrastructure the macro doesn't cover.
const safeAreaPadding = css(`
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
`)

const layoutStyle = style({ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 })

/**
 * Layer B of the two-layer safe-area split: the Provider (Layer A) paints a
 * full-bleed background with no padding, so color extends under the iOS
 * status bar/notch/home-indicator; this container, nested immediately
 * inside it, is where all real content lives, padded away from those insets.
 */
export function SafeAreaContainer({ children }: { children: ReactNode }) {
  return <div className={`${layoutStyle} ${safeAreaPadding}`}>{children}</div>
}
