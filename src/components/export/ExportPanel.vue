<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Download, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-vue-next'
import type { Clipping, ExporterOptions } from 'kindle-tools-ts'

import {
  type ExportFormat,
  exportClippings,
  previewExport,
  downloadExport
} from '@/services/export.service'
import { useSettingsStore } from '@/stores/settings'
import ExportOptions from './ExportOptions.vue'

interface Props {
  clippings: Clipping[]
}

const props = defineProps<Props>()
const settingsStore = useSettingsStore()
const { exportPreferences } = storeToRefs(settingsStore)

const selectedFormat = ref<ExportFormat>(exportPreferences.value.defaultFormat)
const isExporting = ref(false)
const isPreviewLoading = ref(false)
const showPreview = ref(true)
const preview = ref<string>('')
const error = ref<string | null>(null)

// Build export options from settings
const getExportOptions = (): Partial<ExporterOptions> => {
  const prefs = exportPreferences.value
  return {
    groupByBook: prefs.groupByBook,
    includeMetadata: prefs.includeMetadata,
    templatePreset: prefs.markdownPreset,
    folderStructure: prefs.folderStructure,
    includeStats: prefs.includeStats,
    includeClippingTags: prefs.includeTags,
    noteGranularity: prefs.noteGranularity
  }
}

// Generate preview when format changes
const generatePreview = async () => {
  if (!props.clippings.length) {
    preview.value = 'No clippings to preview'
    return
  }

  isPreviewLoading.value = true
  error.value = null

  try {
    preview.value = await previewExport(props.clippings, selectedFormat.value, getExportOptions())
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate preview'
    preview.value = ''
  } finally {
    isPreviewLoading.value = false
  }
}

// Watch for format changes
watch(selectedFormat, generatePreview, { immediate: true })

// Also regenerate when clippings change
watch(() => props.clippings.length, generatePreview)

// Regenerate when export options change
watch(exportPreferences, generatePreview, { deep: true })

// Export handler
const handleExport = async () => {
  if (!props.clippings.length) return

  isExporting.value = true
  error.value = null

  try {
    const result = await exportClippings(props.clippings, selectedFormat.value, getExportOptions())
    downloadExport(result)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Export failed'
  } finally {
    isExporting.value = false
  }
}

const clippingCount = computed(() => props.clippings.length)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Export Highlights</h2>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {{ clippingCount }} clipping{{ clippingCount !== 1 ? 's' : '' }} ready to export
        </p>
      </div>
    </div>

    <!-- Format Picker -->
    <div>
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Choose Format</h3>
      <ExportFormatPicker v-model="selectedFormat" />
    </div>

    <!-- Export Options -->
    <ExportOptions :format="selectedFormat" />

    <!-- Preview Section -->
    <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <!-- Preview Header -->
      <div class="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 class="font-semibold text-gray-900 dark:text-white">Preview</h3>
        <button
          class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600"
          @click="showPreview = !showPreview"
        >
          <component :is="showPreview ? EyeOff : Eye" class="h-4 w-4" />
          {{ showPreview ? 'Hide' : 'Show' }}
        </button>
      </div>

      <!-- Preview Content -->
      <div v-if="showPreview" class="p-4">
        <!-- Loading -->
        <div v-if="isPreviewLoading" class="flex items-center justify-center py-8">
          <Loader2 class="h-6 w-6 animate-spin text-primary-600" />
          <span class="ml-2 text-gray-600 dark:text-gray-400">Generating preview...</span>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="flex items-center gap-2 text-red-600 dark:text-red-400 py-4">
          <AlertCircle class="h-5 w-5" />
          <span>{{ error }}</span>
        </div>

        <!-- Preview Text -->
        <pre
          v-else
          class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg max-h-96 overflow-auto"
        >{{ preview }}</pre>
      </div>
    </div>

    <!-- Export Button -->
    <div class="flex justify-end">
      <button
        :disabled="isExporting || !clippingCount"
        :class="[
          'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
          isExporting || !clippingCount
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
        ]"
        @click="handleExport"
      >
        <Loader2 v-if="isExporting" class="h-5 w-5 animate-spin" />
        <Download v-else class="h-5 w-5" />
        {{ isExporting ? 'Exporting...' : 'Download Export' }}
      </button>
    </div>
  </div>
</template>
