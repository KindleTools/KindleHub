<script setup lang="ts">
import { Clock, FileText, CheckCircle, Download, XCircle, ArrowRight } from 'lucide-vue-next'
import { useBatchesStore } from '@/stores/batches'
import { formatBatchDate, formatFileSize } from '@/services/batch.service'

const batchesStore = useBatchesStore()

const history = computed(() => batchesStore.batchHistory)
const hasHistory = computed(() => history.value.length > 0)

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'imported': return CheckCircle
    case 'exported': return Download
    case 'discarded': return XCircle
    default: return Clock
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'imported': return 'text-green-500 bg-green-50 dark:bg-green-900/20'
    case 'exported': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
    case 'discarded': return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20'
    default: return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'imported': return 'Imported'
    case 'exported': return 'Exported'
    case 'discarded': return 'Discarded'
    default: return 'Pending'
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">Batch History</h1>
      <p class="text-gray-600 dark:text-gray-400">
        View your previous imports and exports
      </p>
    </div>

    <!-- History List -->
    <div v-if="hasHistory" class="space-y-4">
      <div
        v-for="batch in history"
        :key="batch.id"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Status Icon -->
            <div
              class="p-2 rounded-lg"
              :class="getStatusColor(batch.status)"
            >
              <component :is="getStatusIcon(batch.status)" class="h-6 w-6" />
            </div>

            <!-- Details -->
            <div>
              <div class="flex items-center gap-2">
                <FileText class="h-4 w-4 text-gray-400" />
                <span class="font-semibold">{{ batch.fileName }}</span>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ formatBatchDate(batch.createdAt) }}
                <span class="mx-1">•</span>
                {{ formatFileSize(batch.fileSize) }}
                <span class="mx-1">•</span>
                {{ batch.clippingCount }} clippings from {{ batch.bookCount }} books
              </div>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="flex items-center gap-4">
            <span
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="getStatusColor(batch.status)"
            >
              {{ getStatusLabel(batch.status) }}
            </span>
            <span v-if="batch.exportedFormat" class="text-xs text-gray-500">
              → {{ batch.exportedFormat.toUpperCase() }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <Clock class="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h2 class="text-xl font-semibold mb-2">No batch history yet</h2>
      <p class="text-gray-500 mb-6">
        Your import and export history will appear here after you process your first file.
      </p>
      <router-link to="/import" class="btn-primary inline-flex items-center gap-2">
        Import a file
        <ArrowRight class="h-4 w-4" />
      </router-link>
    </div>
  </div>
</template>
