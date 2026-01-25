<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  data: { tag: string, count: number }[]
}>()

const { t } = useI18n()

// Normalize values to font size range 12px - 32px
const normalizedData = computed(() => {
  if (props.data.length === 0) return []
  const max = Math.max(...props.data.map((d) => d.count))
  const min = Math.min(...props.data.map((d) => d.count))

  return props.data.map((item) => ({
    ...item,
    size: min === max
      ? 16
      : 12 + ((item.count - min) / (max - min)) * 24,
    color: getRandomColor()
  }))
})

// Extended color palette
const colors = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9'
]

const router = useRouter()

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)]
}

function navigateToTag(tag: string) {
  router.push({ path: '/search', query: { q: tag, type: 'tag' } })
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ t('stats.tags', 'Tags') }}
    </h3>

    <div v-if="data.length > 0" class="flex flex-wrap gap-x-4 gap-y-2 justify-center items-center h-64 overflow-y-auto content-center">
      <span
        v-for="item in normalizedData"
        :key="item.tag"
        class="transition-all hover:scale-110 cursor-pointer font-medium px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
        :style="{ fontSize: `${item.size}px`, color: item.color, opacity: 0.9 }"
        :title="`${item.tag}: ${item.count}`"
        @click="navigateToTag(item.tag)"
      >
        {{ item.tag.replace(/^#/, '') }}
      </span>
    </div>
    <div v-else class="h-64 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
      <span class="text-2xl">🏷️</span>
      <p>{{ t('stats.no_tags', 'No tags found') }}</p>
      <p class="text-xs text-gray-500">{{ t('stats.tags_hint', 'Add tags in your notes (uppercase words separated by dots)') }}</p>
    </div>
  </div>
</template>
