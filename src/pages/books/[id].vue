<script setup lang="ts">
import { ArrowLeft, BookOpen, Bookmark, FileText, StickyNote } from 'lucide-vue-next'

import { useBooksStore } from '@/stores/books'
import { useClippingsStore } from '@/stores/clippings'

const route = useRoute()
const router = useRouter()

const booksStore = useBooksStore()
const clippingsStore = useClippingsStore()

const bookId = computed(() => Number(route.params.id))

// Load book and clippings
onMounted(async () => {
  await booksStore.selectBook(bookId.value)
  await clippingsStore.loadClippingsForBook(bookId.value)
})

const book = computed(() => booksStore.selectedBook)

const clippingTypeIcon = (type: string) => {
  switch (type) {
    case 'highlight':
      return FileText
    case 'note':
      return StickyNote
    case 'bookmark':
      return Bookmark
    default:
      return FileText
  }
}

const clippingTypeColor = (type: string) => {
  switch (type) {
    case 'highlight':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    case 'note':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    case 'bookmark':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
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
    <div v-if="booksStore.isLoading || clippingsStore.isLoading" class="text-center py-16">
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
      <div class="flex gap-6 mb-8">
        <!-- Cover -->
        <div
          class="w-32 h-48 rounded-lg flex items-center justify-center text-white flex-shrink-0"
          :style="{ background: `linear-gradient(135deg, ${book.coverColor}, ${book.coverColor}dd)` }"
        >
          <BookOpen class="h-12 w-12 opacity-80" />
        </div>

        <!-- Info -->
        <div class="flex-1">
          <h1 class="text-3xl font-bold mb-2">{{ book.title }}</h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 mb-4">{{ book.author }}</p>
          <div class="flex gap-4 text-sm">
            <span class="text-primary-600 font-medium">
              {{ clippingsStore.clippings.length }} highlights
            </span>
          </div>
        </div>
      </div>

      <!-- Clippings List -->
      <div class="space-y-4">
        <div
          v-for="clipping in clippingsStore.clippings"
          :key="clipping.id"
          class="card"
        >
          <!-- Type Badge -->
          <div class="flex items-center justify-between mb-3">
            <span
              :class="[
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                clippingTypeColor(clipping.type),
              ]"
            >
              <component :is="clippingTypeIcon(clipping.type)" class="h-3 w-3" />
              {{ clipping.type }}
            </span>
            <span v-if="clipping.date" class="text-sm text-gray-500">
              {{ formatDate(clipping.date) }}
            </span>
          </div>

          <!-- Content -->
          <p class="text-gray-800 dark:text-gray-200 leading-relaxed">
            {{ clipping.content }}
          </p>

          <!-- Note (if linked) -->
          <div
            v-if="clipping.note"
            class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400"
          >
            <p class="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> {{ clipping.note }}
            </p>
          </div>

          <!-- Location/Page -->
          <div class="flex gap-4 mt-3 text-xs text-gray-500">
            <span v-if="clipping.location">Location: {{ clipping.location }}</span>
            <span v-if="clipping.page">Page: {{ clipping.page }}</span>
          </div>
        </div>
      </div>

      <!-- Empty Clippings -->
      <div v-if="clippingsStore.clippings.length === 0" class="text-center py-16">
        <FileText class="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p class="text-gray-600 dark:text-gray-400">No clippings for this book</p>
      </div>
    </div>
  </div>
</template>
