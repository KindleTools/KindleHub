<script setup lang="ts">
import { Lightbulb } from 'lucide-vue-next'

import type { Insight } from '@/composables/useStatistics'

defineProps<{
  insights: Insight[]
}>()
</script>

<template>
  <div class="card">
    <div class="flex items-center gap-2 mb-4">
      <Lightbulb class="h-4 w-4 text-amber-500" aria-hidden="true" />
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ $t('stats.insights') }}
      </h3>
    </div>
    <ul v-if="insights.length > 0" class="space-y-3">
      <li
        v-for="(insight, index) in insights"
        :key="index"
        class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
      >
        <span class="text-primary-500 mt-0.5">•</span>
        <span>{{ $t(insight.key, insight.params) }}</span>
      </li>
    </ul>
    <p
      v-else
      class="text-sm text-gray-400 dark:text-gray-500"
    >
      {{ $t('stats.no_insights') }}
    </p>
  </div>
</template>
