<script setup lang="ts">
import { computed } from 'vue'
import { Highlighter, StickyNote, Bookmark, Calendar, FileText, Link2 } from 'lucide-vue-next'

import type { StoredClipping } from '@/db/schema'

interface Props {
  clipping: StoredClipping
  showBookInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBookInfo: false
})

// Type config for colors and icons
const typeConfig = computed(() => {
  switch (props.clipping.type) {
    case 'highlight':
      return {
        icon: Highlighter,
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        label: 'Highlight'
      }
    case 'note':
      return {
        icon: StickyNote,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-400',
        label: 'Note'
      }
    case 'bookmark':
      return {
        icon: Bookmark,
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        borderColor: 'border-purple-200 dark:border-purple-800',
        iconColor: 'text-purple-600 dark:text-purple-400',
        label: 'Bookmark'
      }
    default:
      return {
        icon: FileText,
        bgColor: 'bg-gray-50 dark:bg-gray-800',
        borderColor: 'border-gray-200 dark:border-gray-700',
        iconColor: 'text-gray-600 dark:text-gray-400',
        label: 'Clipping'
      }
  }
})

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatLocation = computed(() => {
  if (props.clipping.page) {
    return `Page ${props.clipping.page}`
  }
  if (props.clipping.location) {
    return `Location ${props.clipping.location}`
  }
  return null
})
</script>

<template>
  <div
    :class="[
      'p-4 rounded-lg border-l-4 transition-all hover:shadow-md',
      typeConfig.bgColor,
      typeConfig.borderColor
    ]"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 mb-3">
      <div class="flex items-center gap-2">
        <component
          :is="typeConfig.icon"
          :class="['h-4 w-4', typeConfig.iconColor]"
        />
        <span :class="['text-xs font-medium uppercase tracking-wide', typeConfig.iconColor]">
          {{ typeConfig.label }}
        </span>
      </div>
      <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span v-if="formatLocation" class="flex items-center gap-1">
          <FileText class="h-3 w-3" />
          {{ formatLocation }}
        </span>
        <span v-if="clipping.date" class="flex items-center gap-1">
          <Calendar class="h-3 w-3" />
          {{ formatDate(clipping.date) }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="text-gray-900 dark:text-gray-100">
      <p v-if="clipping.content" class="leading-relaxed">
        {{ clipping.content }}
      </p>
      <p v-else class="text-gray-500 dark:text-gray-400 italic">
        No content
      </p>
    </div>

    <!-- Linked Note -->
    <div
      v-if="clipping.note"
      class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
        <Link2 class="h-3 w-3" />
        <span>Your note</span>
      </div>
      <p class="text-sm text-gray-700 dark:text-gray-300 italic">
        {{ clipping.note }}
      </p>
    </div>

    <!-- Tags -->
    <div v-if="clipping.tags && clipping.tags.length > 0" class="mt-3 flex flex-wrap gap-1">
      <span
        v-for="tag in clipping.tags"
        :key="tag"
        class="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
      >
        #{{ tag }}
      </span>
    </div>
  </div>
</template>
