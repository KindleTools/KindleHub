<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { FileDown, BookOpen, Upload } from 'lucide-vue-next'
import type { Clipping, ClippingLocation } from 'kindle-tools-ts'

import { useBooksStore } from '@/stores/books'
import { getClippingsByBookId } from '@/services/db.service'

const booksStore = useBooksStore()

// Convert stored clippings to Clipping format for export
const clippingsForExport = ref<Clipping[]>([])
const isLoading = ref(true)

onMounted(async () => {
  // Load all books and clippings
  await booksStore.loadBooks()

  // Build clippings with book info
  const allClippings: Clipping[] = []

  for (const book of booksStore.books) {
    if (!book.id) continue

    const storedClippings = await getClippingsByBookId(book.id!)

    for (const sc of storedClippings) {
      // Build location object with proper structure
      const location: ClippingLocation = {
        raw: sc.location ?? '',
        start: 0,
        end: null
      }

      allClippings.push({
        id: sc.originalId,
        title: book.title,
        titleRaw: book.title,
        author: book.author,
        authorRaw: book.author,
        type: sc.type,
        content: sc.content,
        contentRaw: sc.content,
        location,
        page: sc.page ?? null,
        date: sc.date,
        dateRaw: sc.date?.toISOString() ?? '',
        note: sc.note,
        tags: sc.tags,
        isLimitReached: false,
        isEmpty: !sc.content,
        language: 'en',
        source: 'kindle',
        wordCount: sc.content?.split(/\s+/).length ?? 0,
        charCount: sc.content?.length ?? 0,
        blockIndex: 0
      } as Clipping)
    }
  }

  clippingsForExport.value = allClippings
  isLoading.value = false
})

const hasClippings = computed(() => clippingsForExport.value.length > 0)
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
        <FileDown class="h-10 w-10 text-primary-600" />
        Export
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Export your highlights to various formats
      </p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-16">
      <div class="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">Loading your highlights...</p>
    </div>

    <!-- No Clippings -->
    <div v-else-if="!hasClippings" class="text-center py-16">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
        <BookOpen class="h-10 w-10 text-gray-400" />
      </div>
      <h2 class="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">No highlights to export</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Import your Kindle clippings first, then come back here to export them in your preferred format.
      </p>
      <router-link
        to="/import"
        class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        <Upload class="h-5 w-5" />
        Import Clippings
      </router-link>
    </div>

    <!-- Export Panel -->
    <ExportExportPanel
      v-else
      :clippings="clippingsForExport"
    />
  </div>
</template>
