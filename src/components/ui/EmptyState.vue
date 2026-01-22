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
  <div class="text-center py-12 px-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
    <div class="flex justify-center mb-4">
      <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
        <component
          :is="iconComponent"
          class="w-12 h-12 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
      </div>
    </div>

    <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">
      {{ title }}
    </h3>

    <p v-if="description" class="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
      {{ description }}
    </p>

    <div v-if="$slots.action" class="mt-6">
      <slot name="action"></slot>
    </div>
  </div>
</template>
