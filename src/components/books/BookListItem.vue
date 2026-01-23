<script setup lang="ts">
import { computed } from 'vue'
import { BookOpen, User, Hash, Calendar } from 'lucide-vue-next'
import type { Book } from '@/db/schema'
import { formatDate } from '@/utils/date.utils'

const props = defineProps<{
  book: Book
}>()

const lastRead = computed(() => formatDate(props.book.lastReadDate))

const isRecentlyRead = computed(() => {
  const now = new Date()
  const lastReadDate = new Date(props.book.lastReadDate)
  const diffTime = Math.abs(now.getTime() - lastReadDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7
})
</script>

<template>
  <router-link
    :to="`/books/${book.id}`"
    class="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-gray-100 dark:border-gray-700/50 group relative"
  >
    <!-- Recently Read Badge -->
    <div
      v-if="isRecentlyRead"
      class="absolute top-2 right-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-green-200 dark:border-green-800 md:hidden"
    >
      New
    </div>

    <!-- Small Cover -->
    <div
      class="h-16 w-12 flex-shrink-0 rounded overflow-hidden relative"
      :style="{ background: `linear-gradient(135deg, ${book.coverColor || '#4f46e5'}, ${book.coverColor ? book.coverColor + 'dd' : '#4338ca'})` }"
    >
      <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')"></div>
      <div class="absolute inset-0 flex items-center justify-center">
        <BookOpen class="text-white/30 h-6 w-6" />
      </div>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
      <!-- Title & Author (Cols 1-6) -->
      <div class="col-span-12 md:col-span-6">
        <h3 class="font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {{ book.title }}
        </h3>
        <div class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <User class="h-3 w-3" />
          <span class="truncate">{{ book.author }}</span>
        </div>
      </div>

      <!-- Stats (Cols 7-12) -->
      <div class="hidden md:flex col-span-6 items-center justify-end gap-6 text-sm text-gray-500 dark:text-gray-400">
        <div class="flex items-center gap-1.5">
          <Hash class="h-4 w-4" />
          <span>{{ book.clippingCount }} highlights</span>
        </div>
        <div class="flex items-center gap-1.5">
          <Calendar class="h-4 w-4" />
          <span>{{ lastRead }}</span>
        </div>
      </div>
    </div>
  </router-link>
</template>
