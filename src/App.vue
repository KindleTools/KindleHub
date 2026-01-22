<script setup lang="ts">
import { useDark } from '@vueuse/core'
import UiToastContainer from '@/components/ui/ToastContainer.vue'
import { useGlobalShortcuts } from '@/composables/useKeyboardShortcuts'

const isDark = useDark()

// Register global keyboard shortcuts (Ctrl+K for search)
useGlobalShortcuts()
</script>

<template>
  <div :class="{ dark: isDark }" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Skip to main content -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {{ $t('common.skip_to_content') }}
    </a>

    <div class="flex flex-col min-h-screen">
      <!-- Header -->
      <LayoutAppHeader />

      <!-- Main Content -->
      <main id="main-content" class="flex-1 container mx-auto px-4 py-8" tabindex="-1">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>

      <!-- Footer -->
      <LayoutAppFooter />
    </div>

    <!-- Toast Notifications -->
    <UiToastContainer />
  </div>
</template>

<style>
/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
