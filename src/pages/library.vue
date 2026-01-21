<script setup lang="ts">
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

    <!-- Book List -->
    <BooksBookList
      :books="booksStore.books"
      :is-loading="booksStore.isLoading"
    />
  </div>
</template>
