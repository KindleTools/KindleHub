<script setup lang="ts">
import { BookOpen, Upload } from 'lucide-vue-next'

import { useBooksStore } from '@/stores/books'

const booksStore = useBooksStore()

// Load books on mount
onMounted(() => {
  booksStore.loadBooks()
})
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2">My Library</h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ booksStore.totalBooks }} books · {{ booksStore.totalClippings }} highlights
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="booksStore.isLoading" class="text-center py-16">
      <div class="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">Loading your library...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="booksStore.books.length === 0" class="text-center py-16">
      <BookOpen class="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <h2 class="text-2xl font-semibold mb-2">No books yet</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Import your Kindle clippings to get started
      </p>
      <router-link to="/import" class="btn-primary inline-flex items-center gap-2">
        <Upload class="h-5 w-5" />
        Import File
      </router-link>
    </div>

    <!-- Books Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link
        v-for="book in booksStore.books"
        :key="book.id"
        :to="`/books/${book.id}`"
        class="card group hover:shadow-lg transition-all duration-200"
      >
        <!-- Cover with gradient -->
        <div
          class="h-32 rounded-t-lg flex items-center justify-center text-white font-bold text-xl mb-4"
          :style="{ background: `linear-gradient(135deg, ${book.coverColor}, ${book.coverColor}dd)` }"
        >
          <BookOpen class="h-12 w-12 opacity-80" />
        </div>

        <!-- Book Info -->
        <div class="p-4">
          <h3 class="font-semibold text-lg mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
            {{ book.title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-1">
            {{ book.author }}
          </p>
          <div class="flex justify-between items-center text-sm">
            <span class="text-primary-600 font-medium">
              {{ book.clippingCount }} highlights
            </span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>
