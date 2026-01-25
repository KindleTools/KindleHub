<script setup lang="ts">
import { Award } from 'lucide-vue-next'
import EmptyState from '@/components/ui/EmptyState.vue'

defineProps<{
  badges: { id: string, icon: string, title: string, desc: string }[]
}>()

</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ $t('stats.achievements', 'Achievements') }}
    </h3>

    <div v-if="badges.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="badge in badges"
        :key="badge.id"
        class="flex flex-col items-center text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
      >
        <span class="text-3xl mb-2" role="img" :aria-label="badge.title">{{ badge.icon }}</span>
        <span class="font-bold text-sm text-gray-800 dark:text-gray-100">{{ badge.title }}</span>
        <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ badge.desc }}</span>
      </div>
    </div>
    <div v-else>
      <EmptyState
        :title="$t('stats.no_badges')"
        :icon="Award"
      />
    </div>
  </div>
</template>
