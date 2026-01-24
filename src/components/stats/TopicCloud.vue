<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  data: { text: string, value: number }[]
}>()

const { t } = useI18n()

// Normalize values to font size range 12px - 32px
const normalizedData = computed(() => {
  if (props.data.length === 0) return []
  const max = Math.max(...props.data.map((d) => d.value))
  const min = Math.min(...props.data.map((d) => d.value))

  return props.data.map((item) => ({
    ...item,
    size: min === max
      ? 16
      : 12 + ((item.value - min) / (max - min)) * 24,
    color: getRandomColor()
  }))
})

// Simple color palette from tailwind colors (blue, indigo, violet, emerald, teal)
const colors = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#14b8a6', '#f59e0b', '#ec4899'
]

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)]
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ $t('stats.topics', 'Topic Cloud') }}
    </h3>

    <div v-if="data.length > 0" class="flex flex-wrap gap-x-4 gap-y-2 justify-center items-center h-64 overflow-y-auto content-center">
      <span
        v-for="item in normalizedData"
        :key="item.text"
        class="transition-all hover:scale-110 cursor-default font-medium"
        :style="{ fontSize: `${item.size}px`, color: item.color, opacity: 0.9 }"
        :title="`${item.text}: ${item.value}`"
      >
        {{ item.text }}
      </span>
    </div>
    <div v-else class="h-64 flex items-center justify-center text-gray-400 text-sm">
      {{ $t('stats.no_data') }}
    </div>
  </div>
</template>
