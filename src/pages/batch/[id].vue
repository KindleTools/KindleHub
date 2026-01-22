<script setup lang="ts">
import {
  ArrowLeft,
  Book as BookIcon,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Highlighter,
  StickyNote,
  Bookmark,
  Trash2,
  Upload,
  X
} from 'lucide-vue-next'

import { useBatchesStore } from '@/stores/batches'
import { formatFileSize, formatBatchDate } from '@/services/batch.service'

const router = useRouter()
const batchesStore = useBatchesStore()

// Redirect if no batch
onMounted(() => {
  if (!batchesStore.hasBatch) {
    router.push('/import')
  }
})

// Actions
const handleImport = async () => {
  try {
    const result = await batchesStore.commitToDatabase()
    router.push({
      path: '/library',
      query: {
        imported: 'true',
        books: result.booksCount.toString(),
        clippings: result.clippingsCount.toString()
      }
    })
  } catch (err) {
    console.error('Failed to import:', err)
  }
}

const handleDiscard = () => {
  batchesStore.discardBatch()
  router.push('/import')
}

const handleDeleteSelected = () => {
  const ids = batchesStore.selectedClippings.map((c) => c.batchClippingId)
  batchesStore.deleteClippings(ids)
  batchesStore.deselectAll()
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'highlight': return Highlighter
    case 'note': return StickyNote
    case 'bookmark': return Bookmark
    default: return Highlighter
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'highlight': return 'text-yellow-500'
    case 'note': return 'text-blue-500'
    case 'bookmark': return 'text-gray-500'
    default: return 'text-gray-500'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              @click="router.push('/import')"
            >
              <ArrowLeft class="h-5 w-5" />
            </button>
            <div>
              <h1 class="text-xl font-bold">Review Import</h1>
              <p v-if="batchesStore.currentBatch" class="text-sm text-gray-500 dark:text-gray-400">
                {{ batchesStore.currentBatch.fileName }}
                <span class="mx-1">•</span>
                {{ formatFileSize(batchesStore.currentBatch.fileSize) }}
                <span class="mx-1">•</span>
                {{ formatBatchDate(batchesStore.currentBatch.createdAt) }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <button
              class="btn-secondary flex items-center gap-2"
              @click="handleDiscard"
            >
              <X class="h-4 w-4" />
              Discard
            </button>
            <button
              class="btn-primary flex items-center gap-2"
              :disabled="batchesStore.isProcessing"
              @click="handleImport"
            >
              <Upload class="h-4 w-4" />
              Import to Library
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main v-if="batchesStore.currentBatch" class="max-w-7xl mx-auto px-4 py-6">
      <!-- Stats Bar -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <BookIcon class="h-8 w-8 text-primary-500" />
            <div>
              <div class="text-2xl font-bold">{{ batchesStore.currentBatch.stats.totalBooks }}</div>
              <div class="text-sm text-gray-500">Books</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <Highlighter class="h-8 w-8 text-yellow-500" />
            <div>
              <div class="text-2xl font-bold">{{ batchesStore.currentBatch.stats.byType.highlights }}</div>
              <div class="text-sm text-gray-500">Highlights</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <StickyNote class="h-8 w-8 text-blue-500" />
            <div>
              <div class="text-2xl font-bold">{{ batchesStore.currentBatch.stats.byType.notes }}</div>
              <div class="text-sm text-gray-500">Notes</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <Bookmark class="h-8 w-8 text-gray-500" />
            <div>
              <div class="text-2xl font-bold">{{ batchesStore.currentBatch.stats.byType.bookmarks }}</div>
              <div class="text-sm text-gray-500">Bookmarks</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selection Bar (when items selected) -->
      <div
        v-if="batchesStore.selectionCount > 0"
        class="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-6 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <Check class="h-5 w-5 text-primary-600" />
          <span class="font-medium">{{ batchesStore.selectionCount }} items selected</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="btn-secondary text-sm flex items-center gap-1"
            @click="batchesStore.deselectAll"
          >
            Clear selection
          </button>
          <button
            class="btn-danger text-sm flex items-center gap-1"
            @click="handleDeleteSelected"
          >
            <Trash2 class="h-4 w-4" />
            Delete selected
          </button>
        </div>
      </div>

      <!-- Books List -->
      <div class="space-y-4">
        <div
          v-for="book in batchesStore.booksArray"
          :key="book.key"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <!-- Book Header -->
          <button
            class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            @click="batchesStore.toggleBookExpanded(book.key)"
          >
            <div class="flex items-center gap-3">
              <component
                :is="book.isExpanded ? ChevronDown : ChevronRight"
                class="h-5 w-5 text-gray-400"
              />
              <div class="text-left">
                <h3 class="font-semibold">{{ book.title }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ book.author }}</p>
              </div>
            </div>
            <span class="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {{ book.clippingIds.length }} clippings
            </span>
          </button>

          <!-- Clippings -->
          <div v-if="book.isExpanded" class="border-t border-gray-200 dark:border-gray-700">
            <div
              v-for="clippingId in book.clippingIds"
              :key="clippingId"
              class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30"
            >
              <div
                v-if="batchesStore.currentBatch?.clippings.get(clippingId)"
                class="flex items-start gap-3"
              >
                <!-- Selection checkbox -->
                <input
                  type="checkbox"
                  :checked="batchesStore.currentBatch.clippings.get(clippingId)?.isSelected"
                  class="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  @change="batchesStore.toggleSelection(clippingId)"
                />

                <!-- Type icon -->
                <component
                  :is="getTypeIcon(batchesStore.currentBatch.clippings.get(clippingId)?.type ?? 'highlight')"
                  :class="['h-5 w-5 mt-0.5', getTypeColor(batchesStore.currentBatch.clippings.get(clippingId)?.type ?? 'highlight')]"
                />

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <p class="text-gray-800 dark:text-gray-200">
                    {{ batchesStore.currentBatch.clippings.get(clippingId)?.content || '(empty content)' }}
                  </p>
                  <div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span v-if="batchesStore.currentBatch.clippings.get(clippingId)?.location">
                      {{ batchesStore.currentBatch.clippings.get(clippingId)?.location }}
                    </span>
                    <span v-if="batchesStore.currentBatch.clippings.get(clippingId)?.date">
                      {{ batchesStore.currentBatch.clippings.get(clippingId)?.date?.toLocaleDateString?.() ?? '' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Empty State -->
    <div v-else class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <Download class="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 class="text-xl font-semibold mb-2">No batch to review</h2>
        <p class="text-gray-500 mb-4">Import a file first to review your clippings.</p>
        <router-link to="/import" class="btn-primary">
          Go to Import
        </router-link>
      </div>
    </div>
  </div>
</template>
