<script setup lang="ts">
import { FileJson, FileText, Table, Upload, XCircle } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

import ImportOptions from '@/components/import/ImportOptions.vue'
import { parseContent, type ImportFormat } from '@/services/parser.service'
import { useBatchesStore } from '@/stores/batches'
import { useSettingsStore } from '@/stores/settings'

const { t } = useI18n()
const router = useRouter()
const batchesStore = useBatchesStore()
const settingsStore = useSettingsStore()

const selectedFormat = ref<ImportFormat>('txt')
const isDragging = ref(false)
const isImporting = ref(false)
const progress = ref(0)
const error = ref<string | null>(null)

const fileInputRef = ref<HTMLInputElement>()

const formats = computed(() => [
  { id: 'txt' as const, label: t('import.format_txt'), desc: t('import.format_txt_desc'), icon: FileText, accept: '.txt' },
  { id: 'csv' as const, label: t('import.format_csv'), desc: t('import.format_csv_desc'), icon: Table, accept: '.csv' },
  { id: 'json' as const, label: t('import.format_json'), desc: t('import.format_json_desc'), icon: FileJson, accept: '.json' }
])

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    await processFile(files[0]!)
  }
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    await processFile(target.files[0]!)
  }
}

const processFile = async (file: File) => {
  try {
    isImporting.value = true
    progress.value = 0
    error.value = null

    // Read file
    progress.value = 10
    const content = await file.text()
    console.log('File content length:', content.length)

    // Parse with kindle-tools-ts using import preferences
    progress.value = 30
    const { importPreferences } = settingsStore

    // Construct options object carefully to avoid strict type issues with undefined
    const parseOptions: any = {
      mergeOverlapping: importPreferences.mergeOverlapping,
      extractTags: importPreferences.extractTags,
      highlightsOnly: importPreferences.highlightsOnly,
      removeUnlinkedNotes: importPreferences.removeUnlinkedNotes
    }

    if (importPreferences.language && importPreferences.language !== 'auto') {
      parseOptions.language = importPreferences.language
    }

    const parsed = await parseContent(content, selectedFormat.value, parseOptions)
    console.log('Parsed:', parsed.stats)

    // Create batch (in-memory, not saved yet)
    progress.value = 70
    const batchId = batchesStore.createBatch(
      parsed.clippings,
      file.name,
      file.size,
      {
        duplicatesRemoved: parsed.stats.duplicatesRemoved,
        linkedNotes: parsed.stats.linkedNotes,
        mergedHighlights: parsed.stats.mergedHighlights,
        suspiciousFlagged: parsed.stats.suspiciousFlagged,
        tagsExtracted: parsed.stats.tagsExtracted
      },
      parsed.suspiciousIds
    )
    console.log('Created batch:', batchId)

    progress.value = 100

    // Navigate to batch editor for review
    router.push(`/batch/${batchId}`)
  } catch (err) {
    console.error('Import error:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    isImporting.value = false
  }
}

const loadDemoData = async () => {
  try {
    isImporting.value = true
    progress.value = 0
    error.value = null

    progress.value = 10
    const response = await fetch('/demo.txt')
    if (!response.ok) throw new Error('Failed to load demo file')
    const content = await response.text()

    // Create a mock File object
    const file = new File([content], 'My Clippings.txt', { type: 'text/plain' })
    await processFile(file)
  } catch (err) {
    console.error('Demo load error:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error'
    isImporting.value = false
  }
}

const reset = () => {
  isImporting.value = false
  progress.value = 0
  error.value = null
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">{{ $t('import.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ $t('import.subtitle') }}
      </p>
    </div>

    <!-- Import State: Idle -->
    <div v-if="!isImporting && !error">
      <!-- Import Options Panel -->
      <ImportOptions />

      <!-- Format Selector -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <button
          v-for="format in formats"
          :key="format.id"
          :class="[
            'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
            selectedFormat === format.id
              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-primary-400',
          ]"
          @click="selectedFormat = format.id"
        >
          <component :is="format.icon" class="h-8 w-8" aria-hidden="true" />
          <span class="font-medium">{{ format.label }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400 text-center">{{ format.desc }}</span>
        </button>
      </div>

      <!-- Dropzone -->
      <div
        :class="[
          'border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-primary-400',
        ]"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop="handleDrop"
        @click="fileInputRef?.click()"
      >
        <Upload class="h-16 w-16 mx-auto mb-4 text-gray-400" aria-hidden="true" />

        <h3 class="text-xl font-semibold mb-2">
          {{ $t('import.drop_title', { format: selectedFormat.toUpperCase() }) }}
        </h3>

        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ $t('import.drop_subtitle') }}</p>

        <input
          ref="fileInputRef"
          type="file"
          :accept="formats.find((f) => f.id === selectedFormat)?.accept"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>

      <!-- Help Box -->
      <div class="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 class="font-semibold mb-2 flex items-center gap-2">
          <FileText class="h-5 w-5" aria-hidden="true" />
          {{ $t('import.help_title') }}
        </h3>
        <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300 mb-4">
          <li>{{ $t('import.help_step1') }}</li>
          <li>{{ $t('import.help_step2') }}</li>
          <li><i18n-t keypath="import.help_step3" tag="span"><template #folder><code class="bg-white dark:bg-gray-800 px-1 rounded">documents</code></template></i18n-t></li>
          <li><i18n-t keypath="import.help_step4" tag="span"><template #file><code class="bg-white dark:bg-gray-800 px-1 rounded">My Clippings.txt</code></template></i18n-t></li>
        </ol>

        <div class="pt-2 border-t border-blue-100 dark:border-blue-800">
          <button class="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium pb-2" @click="loadDemoData">
            {{ $t('import.load_demo') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Import State: Processing -->
    <div v-else-if="isImporting" class="text-center py-16">
      <div class="animate-spin h-16 w-16 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <h2 class="text-2xl font-semibold mb-2">{{ $t('import.processing_title') }}</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ $t('import.processing_desc') }}
      </p>

      <!-- Progress bar -->
      <div class="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          class="bg-primary-600 h-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <p class="text-sm text-gray-500 mt-2">{{ progress }}%</p>
    </div>

    <!-- Import State: Error -->
    <div v-else-if="error" class="text-center py-16">
      <XCircle class="h-16 w-16 text-red-500 mx-auto mb-4" aria-hidden="true" />
      <h2 class="text-2xl font-semibold mb-2">{{ $t('import.failed') }}</h2>
      <p class="text-red-600 dark:text-red-400 mb-6">{{ error }}</p>

      <button class="btn-primary" @click="reset">
        {{ $t('common.retry') }}
      </button>
    </div>
  </div>
</template>
