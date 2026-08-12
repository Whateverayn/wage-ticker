import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import macros from 'unplugin-parcel-macros'
import optimizeLocales from '@react-aria/optimize-locales-plugin'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: Boolean(process.env.PORT),
  },
  plugins: [
    macros.vite(), // Must be first! Powers React Spectrum S2's style() macro.
    {
      ...optimizeLocales.vite({ locales: ['en-US', 'ja-JP'] }),
      enforce: 'pre',
    },
    react(),
    VitePWA({
      registerType: 'prompt',
      strategies: 'generateSW',
      manifest: false, // manifest.webmanifest is authored by hand in public/, see Phase 6
      includeAssets: ['icons/*.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
      },
    }),
  ],
  build: {
    target: ['es2022'],
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        // Bundle all S2 + style-macro generated CSS into one shared chunk instead of
        // splitting per-route, since atomic CSS overlaps heavily between components.
        manualChunks(id) {
          if (/macro-(.*)\.css$/.test(id) || /@react-spectrum\/s2\/.*\.css$/.test(id)) {
            return 's2-styles'
          }
        },
      },
    },
  },
})
