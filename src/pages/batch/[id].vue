<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ArrowLeft,
  Book as BookIcon,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Download,
  Highlighter,
  StickyNote,
  Upload,
  X
} from 'lucide-vue-next'

import { useBatchesStore } from '@/stores/batches'
import { formatFileSize, formatBatchDate } from '@/services/batch.service'
import BatchClippingCard from '@/components/batch/BatchClippingCard.vue'
import BatchActions from '@/components/batch/BatchActions.vue'
import BatchWarnings from '@/components/batch/BatchWarnings.vue'
import BatchStatsPanel from '@/components/batch/BatchStatsPanel.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

const router = useRouter()
const batchesStore = useBatchesStore()
const { t } = useI18n()

// Leave confirmation state
const showLeaveConfirm = ref(false)
const pendingNavigation = ref<(() => void) | null>(null)

// Check if batch has unsaved modifications
const hasUnsavedChanges = computed(() => {
  if (!batchesStore.currentBatch) return false
  for (const clipping of batchesStore.currentBatch.clippings.values()) {
    if (clipping.isModified) return true
  }
  return false
})

// Navigation guard - prevent accidental data loss
onBeforeRouteLeave((_to, _from, next) => {
  // Allow navigation if no batch or no changes
  if (!batchesStore.hasBatch || !hasUnsavedChanges.value) {
    next()
    return
  }

  // Allow if user already confirmed
  if (pendingNavigation.value) {
    pendingNavigation.value = null
    next()
    return
  }

  // Show confirmation modal
  showLeaveConfirm.value = true
  pendingNavigation.value = () => next()
  next(false)
})

const confirmLeave = () => {
  showLeaveConfirm.value = false
  if (pendingNavigation.value) {
    const nav = pendingNavigation.value
    pendingNavigation.value = null
    nav()
  }
}

const cancelLeave = () => {
  showLeaveConfirm.value = false
  pendingNavigation.value = null
}

// Browser beforeunload handler
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

// Redirect if no batch
onMounted(() => {
  if (!batchesStore.hasBatch) {
    router.push('/import')
    return
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
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

const handleExportOnly = () => {
  // Navigate to export page with batch data
  // The batch data will be used directly without saving to DB
  router.push({ path: '/export', query: { fromBatch: 'true' } })
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
              <h1 class="text-xl font-bold">{{ t('batch.review_title') }}</h1>
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
              @click="handleExportOnly"
            >
              <Download class="h-4 w-4" />
              {{ t('batch.export_only') }}
            </button>
            <button
              class="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              @click="handleDiscard"
            >
              <X class="h-4 w-4" />
              {{ t('batch.discard') }}
            </button>
            <button
              class="btn-primary flex items-center gap-2"
              :disabled="batchesStore.isProcessing"
              @click="handleImport"
            >
              <Upload class="h-4 w-4" />
              {{ t('batch.import_library') }}
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
              <div class="text-sm text-gray-500">{{ t('batch.stats_books') }}</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <Highlighter class="h-8 w-8 text-yellow-500" />
            <div>
              <div class="text-2xl font-bold">{{ batchesStore.currentBatch.stats.byType.highlights }}</div>
              <div class="text-sm text-gray-500">{{ t('batch.stats_highlights') }}</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <StickyNote class="h-8 w-8 text-blue-500" />
            <div>
              <div class="text-2xl font-bold">{{ batchesStore.currentBatch.stats.byType.notes }}</div>
              <div class="text-sm text-gray-500">{{ t('batch.stats_notes') }}</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <Bookmark class="h-8 w-8 text-gray-500" />
            <div>
              <div class="text-2xl font-bold">{{ batchesStore.currentBatch.stats.byType.bookmarks }}</div>
              <div class="text-sm text-gray-500">{{ t('batch.stats_bookmarks') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Processing Stats Panel -->
      <BatchStatsPanel :stats="batchesStore.currentBatch.stats" />

      <!-- Warnings Panel -->
      <BatchWarnings class="mb-6" />

      <!-- Floating Actions Bar -->
      <BatchActions />

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
              {{ t('batch.clippings_count', { count: book.clippingIds.length }) }}
            </span>
          </button>

          <!-- Clippings -->
          <div v-if="book.isExpanded" class="border-t border-gray-200 dark:border-gray-700">
            <div
              v-for="clippingId in book.clippingIds"
              :key="clippingId"
              class="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30"
            >
              <BatchClippingCard
                v-if="batchesStore.currentBatch?.clippings.get(clippingId)"
                :clipping="batchesStore.currentBatch.clippings.get(clippingId)!"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Empty State -->
    <div v-else class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <Download class="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 class="text-xl font-semibold mb-2">{{ t('batch.no_batch_title') }}</h2>
        <p class="text-gray-500 mb-4">{{ t('batch.no_batch_desc') }}</p>
        <router-link to="/import" class="btn-primary">
          {{ t('batch.go_to_import') }}
        </router-link>
      </div>
    </div>

    <!-- Leave Confirmation Modal -->
    <ConfirmModal
      :open="showLeaveConfirm"
      :title="t('batch.leave_title')"
      :message="t('batch.leave_message')"
      :confirm-text="t('batch.leave_confirm')"
      :cancel-text="t('batch.leave_cancel')"
      variant="warning"
      @confirm="confirmLeave"
      @cancel="cancelLeave"
    />
  </div>
</template>
