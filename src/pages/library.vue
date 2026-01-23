<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Grid, List } from 'lucide-vue-next'
import { useBooksStore } from '@/stores/books'
import BooksBookList from '@/components/books/BookList.vue'

const booksStore = useBooksStore()
const view = ref<'grid' | 'list'>('grid')

// Load books on mount
onMounted(() => {
  booksStore.loadBooks()
})
</script>

<template>
  <div class="max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8 flex-shrink-0">
      <div>
        <h1 class="text-4xl font-bold mb-2 text-gray-900 dark:text-white">{{ $t('library.title') }}</h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('library.stats_summary', { books: booksStore.totalBooks, clippings: booksStore.totalClippings }) }}
        </p>
      </div>

      <!-- View Toggle -->
      <div class="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-sm">
        <button
          class="p-2 rounded-md transition-colors"
          :class="view === 'grid' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
          :aria-label="$t('common.grid_view')"
          @click="view = 'grid'"
        >
          <Grid class="h-5 w-5" />
        </button>
        <button
          class="p-2 rounded-md transition-colors"
          :class="view === 'list' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
          :aria-label="$t('common.list_view')"
          @click="view = 'list'"
        >
          <List class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Book List -->
    <div class="flex-1 min-h-0">
      <BooksBookList
        :books="booksStore.books"
        :is-loading="booksStore.isLoading"
        :view="view"
      />
    </div>
  </div>
</template>
