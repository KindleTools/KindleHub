<script setup lang="ts">
import { computed } from 'vue'
import { Search, Book, FileText, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  description?: string
  icon?: string | object // string name or component
  type?: 'search' | 'library' | 'batch' | 'error'
}>()

const iconComponent = computed(() => {
  if (props.icon && typeof props.icon === 'object') return props.icon

  // Map types/names to Lucide icons
  switch (props.type) {
    case 'search': return Search
    case 'library': return Book
    case 'batch': return FileText
    case 'error': return AlertCircle
    default: return Book
  }
})
</script>

<template>
  <div class="text-center py-16 px-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/20 backdrop-blur-sm transition-all hover:border-primary-200 dark:hover:border-primary-800 group">
    <div class="relative w-24 h-24 mx-auto mb-6">
      <!-- Decorative Background -->
      <div class="absolute inset-0 bg-primary-100 dark:bg-primary-900/40 rounded-full animate-pulse opacity-50 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/60 transition-colors"></div>

      <!-- Main Circular Container -->
      <div class="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white dark:ring-gray-800">
        <component
          :is="iconComponent"
          class="w-8 h-8 text-primary-500 dark:text-primary-400 transition-transform group-hover:scale-110 duration-300"
          stroke-width="1.5"
          aria-hidden="true"
        />
      </div>

      <!-- Floating Particles -->
      <div class="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style="animation-duration: 2s;"></div>
      <div class="absolute bottom-2 left-2 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-duration: 2.5s; animation-delay: 0.5s;"></div>
      <div class="absolute top-1/2 -right-1 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
    </div>

    <h3 class="mt-4 text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
      {{ title }}
    </h3>

    <p v-if="description" class="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
      {{ description }}
    </p>

    <div v-if="$slots.action" class="mt-8">
      <slot name="action"></slot>
    </div>
  </div>
</template>
