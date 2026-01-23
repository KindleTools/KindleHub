import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // File-based routing (must be before vue())
    VueRouter({
      routesFolder: 'src/pages',
      dts: 'src/typed-router.d.ts',
      extensions: ['.vue'],
      importMode: 'async'
    }),

    vue(),

    // Auto-import Vue APIs
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      dts: 'src/auto-imports.d.ts',
      vueTemplate: true,
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true
      }
    }),

    // Auto-import components
    Components({
      dts: 'src/components.d.ts',
      directoryAsNamespace: true
    }),

    // PWA Support
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'KindleHub',
        short_name: 'KindleHub',
        description: 'Manage and export your Kindle highlights and notes',
        theme_color: '#0ea5e9', // Primary-500
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  base: '/KindleHub/', // For GitHub Pages (must match repo name)

  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vue-vendor'
            }
            if (id.includes('@vueuse')) {
              return 'vueuse-vendor'
            }
            if (id.includes('kindle-tools-ts')) {
              return 'kindle-tools-vendor'
            }
            if (id.includes('lucide-vue') || id.includes('@headlessui')) {
              return 'ui-vendor'
            }
            if (id.includes('fuse.js')) {
              return 'search-vendor'
            }
            if (id.includes('dexie')) {
              return 'db-vendor'
            }
            return 'vendor'
          }
        }
      }
    }
  },

  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: true
  },

  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'kindle-tools-ts', 'date-fns', 'dexie']
  }
})
