<script setup lang="ts">
import { useDark } from '@vueuse/core'
import UiToastContainer from '@/components/ui/ToastContainer.vue'

const isDark = useDark()
</script>

<template>
  <div :class="{ dark: isDark }" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <div class="flex flex-col min-h-screen">
      <!-- Header -->
      <LayoutAppHeader />

      <!-- Main Content -->
      <main class="flex-1 container mx-auto px-4 py-8">
        <router-view />
      </main>

      <!-- Footer -->
      <LayoutAppFooter />
    </div>

    <!-- Toast Notifications -->
    <UiToastContainer />
  </div>
</template>
