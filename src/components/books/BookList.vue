<script setup lang="ts">
import { Upload } from 'lucide-vue-next'
import EmptyState from '@/components/ui/EmptyState.vue'

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
    <BooksBookCard
      v-for="i in 8"
      :key="i"
      :loading="true"
    />
  </div>

  <!-- Empty State -->
  <!-- Empty State -->
  <EmptyState
    v-else-if="books.length === 0"
    type="library"
    title="No books yet"
    description="Import your Kindle highlights to see your library. Your books and clippings will appear here."
  >
    <template #action>
      <router-link
        to="/import"
        class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        <Upload class="h-5 w-5" />
        Import Clippings
      </router-link>
    </template>
  </EmptyState>

  <!-- Books Grid -->
  <TransitionGroup
    v-else
    tag="div"
    name="book-list"
    class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
  >
    <BooksBookCard
      v-for="(book, index) in books"
      :key="book.id!"
      :book="book"
      :style="{ '--animation-delay': `${index * 50}ms` }"
    />
  </TransitionGroup>
</template>

<style scoped>
/* Staggered list animation */
.book-list-enter-active {
  transition: all 0.3s ease-out;
  transition-delay: var(--animation-delay, 0ms);
}

.book-list-leave-active {
  transition: all 0.2s ease-in;
}

.book-list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.book-list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.book-list-move {
  transition: transform 0.3s ease;
}
</style>
