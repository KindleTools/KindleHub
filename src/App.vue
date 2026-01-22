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
    <div class="flex flex-col min-h-screen">
      <!-- Header -->
      <LayoutAppHeader />

      <!-- Main Content -->
      <main class="flex-1 container mx-auto px-4 py-8">
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
