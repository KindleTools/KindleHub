<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, Hash } from 'lucide-vue-next'

import type { Book } from '@/db/schema'

import { formatDate } from '@/utils/date.utils'

import UiSkeleton from '@/components/ui/Skeleton.vue'

interface Props {
  book?: Book
  loading?: boolean
}

const props = defineProps<Props>()

const lastRead = computed(() => {
  if (props.loading || !props.book) return ''
  return formatDate(props.book.lastReadDate)
})

const isRecentlyRead = computed(() => {
  if (props.loading || !props.book) return false
  const now = new Date()
  const lastReadDate = new Date(props.book.lastReadDate)
  const diffTime = Math.abs(now.getTime() - lastReadDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7 // Recently read within last 7 days
})
</script>

<template>
  <div v-if="loading" class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <UiSkeleton variant="rounded" height="0" class="aspect-[3/4] mb-4 w-full" />
    <UiSkeleton variant="text" width="80%" class="mb-2" />
    <UiSkeleton variant="text" width="50%" />
    <div class="mt-4 flex justify-between">
      <UiSkeleton variant="text" width="30%" />
      <UiSkeleton variant="text" width="30%" />
    </div>
  </div>

  <router-link
    v-else-if="book"
    :to="`/books/${book.id}`"
    class="group block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 hover:-translate-y-1 active:scale-[0.98] relative"
  >
    <!-- Recently Read Badge -->
    <div
      v-if="isRecentlyRead"
      class="absolute top-2 right-2 z-20 px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-green-200 dark:border-green-800"
    >
      New
    </div>

    <!-- Cover with generated gradient -->
    <div
      class="aspect-[2/3] rounded-lg mb-4 flex relative overflow-hidden shadow-inner"
      :style="{ background: `linear-gradient(135deg, ${book.coverColor || '#4f46e5'}, ${book.coverColor ? book.coverColor + 'dd' : '#4338ca'})` }"
    >
      <!-- Decorative Pattern (Noise/Texture) -->
      <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')"></div>

      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

      <!-- Title centered -->
      <div class="absolute inset-0 flex items-center justify-center p-4 z-10">
        <h3 class="text-white font-serif text-xl text-center font-medium leading-tight text-shadow-sm select-none">
          {{ book.title }}
        </h3>
      </div>

      <!-- Author at bottom -->
      <div class="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-[2px] px-3 py-2 z-10 border-t border-white/10">
        <p class="text-white/90 text-xs truncate text-center font-medium">{{ book.author || 'Unknown Author' }}</p>
      </div>
    </div>

    <!-- Stats Row (Moved outside/below cover for now, or can be overlay) -->
    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mt-2">
      <div class="flex items-center gap-1">
        <Hash class="h-3 w-3" />
        <span>{{ book.clippingCount }}</span>
      </div>
      <div class="flex items-center gap-1">
        <Calendar class="h-3 w-3" />
        <span>{{ lastRead }}</span>
      </div>
    </div>
  </router-link>
</template>
