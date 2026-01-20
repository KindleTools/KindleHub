<script setup lang="ts">
import { BookOpen, Upload } from 'lucide-vue-next'

// TODO: Load books from IndexedDB
const books = ref([])
const isLoading = ref(false)
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2">My Library</h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ books.length }} books · 0 highlights
      </p>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && books.length === 0" class="text-center py-16">
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

    <!-- Books Grid (will be populated when data exists) -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Book cards will go here -->
    </div>
  </div>
</template>
