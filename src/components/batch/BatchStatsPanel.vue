<script setup lang="ts">
import { ChevronDown, ChevronRight, GitMerge, Link2, Tags, AlertTriangle, Trash2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { BatchStats } from '@/types/batch'

const props = defineProps<{
  stats: BatchStats
}>()

const { t } = useI18n()
const isExpanded = ref(false)

const processingStats = computed(() => [
  {
    icon: Trash2,
    label: t('batch.stats_duplicates_removed'),
    value: props.stats.duplicatesRemoved,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20'
  },
  {
    icon: GitMerge,
    label: t('batch.stats_merged'),
    value: props.stats.mergedHighlights,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    icon: Link2,
    label: t('batch.stats_linked'),
    value: props.stats.linkedNotes,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    icon: Tags,
    label: t('batch.stats_tags'),
    value: props.stats.tagsExtracted,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    icon: AlertTriangle,
    label: t('batch.stats_suspicious'),
    value: props.stats.suspiciousFlagged,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20'
  }
])

const hasProcessingStats = computed(() => {
  return props.stats.duplicatesRemoved > 0 ||
    props.stats.mergedHighlights > 0 ||
    props.stats.linkedNotes > 0 ||
    props.stats.tagsExtracted > 0 ||
    props.stats.suspiciousFlagged > 0
})
</script>

<template>
  <div v-if="hasProcessingStats" class="mb-6">
    <!-- Collapsible Header -->
    <button
      type="button"
      class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <GitMerge class="h-5 w-5 text-gray-500" aria-hidden="true" />
        <span class="font-medium">{{ t('batch.processing_stats') }}</span>
        <span class="text-sm text-gray-500">
          ({{ t('batch.stats_actions_applied', { count: stats.duplicatesRemoved + stats.mergedHighlights + stats.linkedNotes }) }})
        </span>
      </div>
      <component
        :is="isExpanded ? ChevronDown : ChevronRight"
        class="h-5 w-5 text-gray-400"
        aria-hidden="true"
      />
    </button>

    <!-- Stats Panel -->
    <div
      v-if="isExpanded"
      class="mt-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          v-for="stat in processingStats"
          :key="stat.label"
          class="flex items-center gap-3 p-3 rounded-lg"
          :class="stat.bgColor"
        >
          <component :is="stat.icon" class="h-5 w-5" :class="stat.color" />
          <div>
            <div class="text-lg font-bold" :class="stat.color">{{ stat.value }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
        {{ t('batch.processing_stats_desc') }}
      </p>
    </div>
  </div>
</template>
