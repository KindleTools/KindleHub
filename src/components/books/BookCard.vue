<script setup lang="ts">
import { computed } from 'vue'
import { BookOpen, User, Calendar, Hash } from 'lucide-vue-next'

import type { Book } from '@/db/schema'

interface Props {
  book: Book
}

const props = defineProps<Props>()

// Format date to relative time or date string
const formatDate = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return new Date(date).toLocaleDateString()
}

const lastRead = computed(() => formatDate(props.book.lastReadDate))
</script>

<template>
  <router-link
    :to="`/books/${book.id}`"
    class="group block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600"
  >
    <!-- Cover with generated gradient -->
    <div
      class="aspect-[3/4] rounded-lg mb-4 flex items-end p-4 relative overflow-hidden"
      :style="{ background: `linear-gradient(135deg, ${book.coverColor}, ${book.coverColor}dd)` }"
    >
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      <BookOpen class="absolute top-4 right-4 h-8 w-8 text-white/30" />
      <div class="relative z-10 text-white">
        <h3 class="font-bold text-lg leading-tight line-clamp-3 group-hover:text-primary-200 transition-colors">
          {{ book.title }}
        </h3>
      </div>
    </div>

    <!-- Book Info -->
    <div class="space-y-2">
      <!-- Author -->
      <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <User class="h-4 w-4 flex-shrink-0" />
        <span class="truncate">{{ book.author || 'Unknown Author' }}</span>
      </div>

      <!-- Stats Row -->
      <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
        <div class="flex items-center gap-1">
          <Hash class="h-3 w-3" />
          <span>{{ book.clippingCount }} highlights</span>
        </div>
        <div class="flex items-center gap-1">
          <Calendar class="h-3 w-3" />
          <span>{{ lastRead }}</span>
        </div>
      </div>
    </div>
  </router-link>
</template>
