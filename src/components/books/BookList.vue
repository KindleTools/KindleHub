<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { Upload } from 'lucide-vue-next'
import EmptyState from '@/components/ui/EmptyState.vue'
import BooksBookCard from '@/components/books/BookCard.vue'

import type { Book } from '@/db/schema'

interface Props {
  books: Book[]
  isLoading?: boolean
}

const props = defineProps<Props>()

// Container ref for virtualizer
const parentRef = ref<HTMLElement | null>(null)

// Responsive column calculation
const windowWidth = ref(window.innerWidth)
const columns = computed(() => {
  const w = windowWidth.value
  if (w >= 1280) return 5 // xl
  if (w >= 1024) return 4 // lg
  if (w >= 768) return 3 // md
  return 2 // default
})

function handleResize() {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Group books into rows
const rows = computed(() => {
  const result = []
  for (let i = 0; i < props.books.length; i += columns.value) {
    result.push(props.books.slice(i, i + columns.value))
  }
  return result
})

// Initialize virtualizer
const rowVirtualizer = useVirtualizer({
  count: computed(() => rows.value.length), // Must be a computed/ref
  getScrollElement: () => parentRef.value,
  estimateSize: () => 320, // Approximate height of a book card row + gap
  overscan: 5
})

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())
const totalSize = computed(() => rowVirtualizer.value.getTotalSize())
</script>

<template>
  <div ref="parentRef" class="h-full overflow-y-auto w-full">
    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-6">
      <BooksBookCard
        v-for="i in 8"
        :key="i"
        :loading="true"
      />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="books.length === 0"
      type="library"
      title="No books yet"
      description="Import your Kindle highlights to see your library. Your books and clippings will appear here."
      class="mt-8"
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

    <!-- Virtualized Grid -->
    <div
      v-else
      :style="{
        height: `${totalSize}px`,
        width: '100%',
        position: 'relative'
      }"
    >
      <div
        v-for="virtualRow in virtualRows"
        :key="virtualRow.key"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`
        }"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-1"
      >
        <div
          v-for="book in rows[virtualRow.index]"
          :key="book.id"
          class="h-full"
        >
          <BooksBookCard :book="book" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Removed View Transitions as they conflict with virtualization */
</style>
