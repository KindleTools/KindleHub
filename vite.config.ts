import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    // File-based routing (must be before vue())
    VueRouter({
      routesFolder: 'src/pages',
      dts: 'src/typed-router.d.ts',
      extensions: ['.vue']
    }),

    vue(),

    // Auto-import Vue APIs
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core'
      ],
      dts: 'src/auto-imports.d.ts',
      vueTemplate: true
    }),

    // Auto-import components
    Components({
      dts: 'src/components.d.ts',
      directoryAsNamespace: true
    })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  base: '/kindle-hub/',  // For GitHub Pages

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
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@vueuse/core',
      'kindle-tools-ts',
      'date-fns',
      'dexie'
    ]
  }
})
