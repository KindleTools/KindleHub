<script setup lang="ts">
import { AlertTriangle, Info, XOctagon, ChevronDown, ChevronRight } from 'lucide-vue-next'
import type { BatchWarning } from '@/types/batch'
import { useBatchesStore } from '@/stores/batches'

const batchesStore = useBatchesStore()
const isExpanded = ref(true)

const warnings = computed(() => batchesStore.currentBatch?.warnings ?? [])
const hasWarnings = computed(() => warnings.value.length > 0)

const getIcon = (severity: string) => {
  switch (severity) {
    case 'error': return XOctagon
    case 'warning': return AlertTriangle
    default: return Info
  }
}

const getColor = (severity: string) => {
  switch (severity) {
    case 'error': return 'text-red-500 bg-red-50 dark:bg-red-900/20'
    case 'warning': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
    default: return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
  }
}

const groupedWarnings = computed(() => {
  const groups = {
    error: [] as BatchWarning[],
    warning: [] as BatchWarning[],
    info: [] as BatchWarning[]
  }
  for (const w of warnings.value) {
    if (w.severity in groups) {
      groups[w.severity as keyof typeof groups].push(w)
    }
  }
  return groups
})
</script>

<template>
  <div v-if="hasWarnings" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Header -->
    <button
      class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-3">
        <component
          :is="isExpanded ? ChevronDown : ChevronRight"
          class="h-5 w-5 text-gray-400"
        />
        <AlertTriangle class="h-5 w-5 text-orange-500" />
        <span class="font-semibold">Issues Found</span>
      </div>
      <span class="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
        {{ warnings.length }} {{ warnings.length === 1 ? 'issue' : 'issues' }}
      </span>
    </button>

    <!-- Warnings List -->
    <div v-if="isExpanded" class="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
      <!-- Errors first -->
      <div
        v-for="warning in groupedWarnings.error"
        :key="warning.id"
        class="px-4 py-3 flex items-start gap-3"
        :class="getColor('error')"
      >
        <component :is="getIcon('error')" class="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm">{{ warning.message }}</p>
          <p v-if="warning.details" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {{ warning.details }}
          </p>
        </div>
      </div>

      <!-- Warnings next -->
      <div
        v-for="warning in groupedWarnings.warning"
        :key="warning.id"
        class="px-4 py-3 flex items-start gap-3"
        :class="getColor('warning')"
      >
        <component :is="getIcon('warning')" class="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm">{{ warning.message }}</p>
          <p v-if="warning.details" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {{ warning.details }}
          </p>
        </div>
      </div>

      <!-- Info last -->
      <div
        v-for="warning in groupedWarnings.info"
        :key="warning.id"
        class="px-4 py-3 flex items-start gap-3"
        :class="getColor('info')"
      >
        <component :is="getIcon('info')" class="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm">{{ warning.message }}</p>
          <p v-if="warning.details" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {{ warning.details }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
