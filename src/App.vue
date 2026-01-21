<script setup lang="ts">
import { useDark } from '@vueuse/core'

const isDark = useDark()
</script>

<template>
  <div :class="{ dark: isDark }" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <div class="flex flex-col min-h-screen">
      <!-- Header -->
      <!-- Header -->
      <AppHeader />

      <!-- Main Content -->
      <main class="flex-1 container mx-auto px-4 py-8">
        <router-view />
      </main>

      <!-- Footer -->
      <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div class="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Built with
            <a href="https://github.com/KindleTools/kindle-tools-ts" target="_blank" class="text-primary-600 hover:underline">
              kindle-tools-ts
            </a>
            · 100% Client-side · No data uploaded
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>
