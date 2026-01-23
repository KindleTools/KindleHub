<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { Upload } from 'lucide-vue-next'
import EmptyState from '@/components/ui/EmptyState.vue'
import BooksBookCard from '@/components/books/BookCard.vue'
import BooksBookListItem from '@/components/books/BookListItem.vue'

import type { Book } from '@/db/schema'

interface Props {
  books: Book[]
  isLoading?: boolean
  view?: 'grid' | 'list'
}

const props = withDefaults(defineProps<Props>(), {
  view: 'grid'
})

// Container ref for virtualizer
const parentRef = ref<HTMLElement | null>(null)
const windowWidth = ref(window.innerWidth)

// Responsive column calculation
const columns = computed(() => {
  if (props.view === 'list') return 1

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

// Item height estimation
const itemHeight = computed(() => props.view === 'list' ? 96 : 320)

// Initialize virtualizer
const rowVirtualizer = useVirtualizer({
  count: computed(() => rows.value.length) as any,
  getScrollElement: () => parentRef.value,
  estimateSize: () => itemHeight.value,
  overscan: 5
})

// Force update virtualizer when view changes to re-measure
watch(() => props.view, () => {
  rowVirtualizer.value.measure()
})

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())
const totalSize = computed(() => rowVirtualizer.value.getTotalSize())
</script>

<template>
  <div ref="parentRef" class="h-full overflow-y-auto w-full">
    <!-- Loading State -->
    <div v-if="isLoading" class="grid gap-6 pb-6" :class="view === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'">
      <component
        :is="view === 'grid' ? BooksBookCard : BooksBookListItem"
        v-for="i in 8"
        :key="i"
        :loading="true"
        :book="{} as Book"
      />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="books.length === 0"
      type="library"
      :title="$t('library.no_books_title')"
      :description="$t('library.no_books_desc')"
      class="mt-8"
    >
      <template #action>
        <router-link
          to="/import"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Upload class="h-5 w-5" />
          {{ $t('home.cta_import') }}
        </router-link>
      </template>
    </EmptyState>

    <!-- Virtualized Grid/List -->
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
        :key="virtualRow.key.toString()"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
          ...(columns > 1 ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : {})
        }"
        class="grid gap-6 px-1"
        :class="columns > 1 ? '' : 'grid-cols-1'"
      >
        <div
          v-for="book in rows[virtualRow.index]"
          :key="book.id"
          class="h-full"
        >
          <component
            :is="view === 'grid' ? BooksBookCard : BooksBookListItem"
            :book="book"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Removed View Transitions as they conflict with virtualization */
</style>
