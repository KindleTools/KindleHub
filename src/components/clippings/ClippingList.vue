<script setup lang="ts">
import { ref, computed } from 'vue'
import { Filter, Highlighter, StickyNote, Bookmark, List } from 'lucide-vue-next'

import type { StoredClipping } from '@/db/schema'

interface Props {
  clippings: StoredClipping[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

type FilterType = 'all' | 'highlight' | 'note' | 'bookmark'

const activeFilter = ref<FilterType>('all')

const filters: { id: FilterType, label: string, icon: typeof List }[] = [
  { id: 'all', label: 'All', icon: List },
  { id: 'highlight', label: 'Highlights', icon: Highlighter },
  { id: 'note', label: 'Notes', icon: StickyNote },
  { id: 'bookmark', label: 'Bookmarks', icon: Bookmark }
]

const filteredClippings = computed(() => {
  if (activeFilter.value === 'all') {
    return props.clippings
  }
  return props.clippings.filter((c) => c.type === activeFilter.value)
})

const counts = computed(() => ({
  all: props.clippings.length,
  highlight: props.clippings.filter((c) => c.type === 'highlight').length,
  note: props.clippings.filter((c) => c.type === 'note').length,
  bookmark: props.clippings.filter((c) => c.type === 'bookmark').length
}))
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="space-y-4">
    <div v-for="i in 5" :key="i" class="animate-pulse">
      <div class="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </div>

  <div v-else>
    <!-- Filter Bar -->
    <div class="flex items-center gap-2 mb-6 flex-wrap">
      <Filter class="h-4 w-4 text-gray-500" />
      <button
        v-for="filter in filters"
        :key="filter.id"
        :class="[
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
          activeFilter === filter.id
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        ]"
        @click="activeFilter = filter.id"
      >
        <component :is="filter.icon" class="h-3.5 w-3.5" />
        {{ filter.label }}
        <span
          :class="[
            'ml-1 px-1.5 py-0.5 text-xs rounded-full',
            activeFilter === filter.id
              ? 'bg-white/20 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          ]"
        >
          {{ counts[filter.id] }}
        </span>
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredClippings.length === 0"
      class="text-center py-12"
    >
      <List class="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
        No {{ activeFilter === 'all' ? 'clippings' : activeFilter + 's' }} found
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ activeFilter === 'all' ? 'This book has no clippings yet.' : `Try selecting a different filter.` }}
      </p>
    </div>

    <!-- Clippings List -->
    <div v-else class="space-y-4">
      <ClippingsClippingCard
        v-for="clipping in filteredClippings"
        :key="clipping.id!"
        :clipping="clipping"
      />
    </div>
  </div>
</template>
