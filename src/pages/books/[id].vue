<script setup lang="ts">
import { ArrowLeft, BookOpen, User, Hash, Calendar } from 'lucide-vue-next'

import { useBooksStore } from '@/stores/books'
import { useClippingsStore } from '@/stores/clippings'

const route = useRoute()
const router = useRouter()

const booksStore = useBooksStore()
const clippingsStore = useClippingsStore()

const bookId = computed(() => Number((route.params as { id: string }).id))

// Load book and clippings
onMounted(async () => {
  await booksStore.selectBook(bookId.value)
  await clippingsStore.loadClippingsForBook(bookId.value)
})

const book = computed(() => booksStore.selectedBook)

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Back Button -->
    <button
      class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6 transition-colors"
      @click="router.push('/library')"
    >
      <ArrowLeft class="h-5 w-5" />
      Back to Library
    </button>

    <!-- Loading -->
    <div v-if="booksStore.isLoading" class="text-center py-16">
      <div class="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">Loading book...</p>
    </div>

    <!-- Book Not Found -->
    <div v-else-if="!book" class="text-center py-16">
      <BookOpen class="h-16 w-16 mx-auto mb-4 text-gray-400" />
      <h2 class="text-2xl font-semibold mb-2">Book not found</h2>
      <router-link to="/library" class="btn-primary">
        Back to Library
      </router-link>
    </div>

    <!-- Book Details -->
    <div v-else>
      <!-- Book Header -->
      <div class="flex flex-col sm:flex-row gap-6 mb-8">
        <!-- Cover -->
        <div
          class="w-32 h-48 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg"
          :style="{ background: `linear-gradient(135deg, ${book.coverColor}, ${book.coverColor}dd)` }"
        >
          <BookOpen class="h-12 w-12 opacity-80" />
        </div>

        <!-- Info -->
        <div class="flex-1">
          <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            {{ book.title }}
          </h1>
          <div class="flex items-center gap-2 text-lg text-gray-600 dark:text-gray-400 mb-4">
            <User class="h-5 w-5" />
            <span>{{ book.author || 'Unknown Author' }}</span>
          </div>
          <div class="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span class="flex items-center gap-1">
              <Hash class="h-4 w-4" />
              {{ clippingsStore.clippings.length }} clippings
            </span>
            <span v-if="book.lastReadDate" class="flex items-center gap-1">
              <Calendar class="h-4 w-4" />
              Last read: {{ formatDate(book.lastReadDate) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Clippings List -->
      <ClippingsClippingList
        :clippings="clippingsStore.clippings"
        :is-loading="clippingsStore.isLoading"
      />
    </div>
  </div>
</template>
