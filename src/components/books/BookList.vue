<script setup lang="ts">
import { BookOpen, Upload } from 'lucide-vue-next'

import type { Book } from '@/db/schema'

interface Props {
  books: Book[]
  isLoading?: boolean
}

defineProps<Props>()
</script>

<template>
  <!-- Loading State -->
  <div v-if="isLoading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
    <div
      v-for="i in 8"
      :key="i"
      class="animate-pulse"
    >
      <div class="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>

  <!-- Empty State -->
  <div
    v-else-if="books.length === 0"
    class="text-center py-16"
  >
    <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
      <BookOpen class="h-10 w-10 text-gray-400" />
    </div>
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      No books yet
    </h3>
    <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      Import your Kindle highlights to see your library. Your books and clippings will appear here.
    </p>
    <router-link
      to="/import"
      class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
    >
      <Upload class="h-5 w-5" />
      Import Clippings
    </router-link>
  </div>

  <!-- Books Grid -->
  <div
    v-else
    class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
  >
    <BooksBookCard
      v-for="book in books"
      :key="book.id!"
      :book="book"
    />
  </div>
</template>
