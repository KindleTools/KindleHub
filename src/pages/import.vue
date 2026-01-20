<script setup lang="ts">
import { CheckCircle, FileJson, FileText, Table, Upload, XCircle } from 'lucide-vue-next'

type ImportFormat = 'txt' | 'csv' | 'json'

const selectedFormat = ref<ImportFormat>('txt')
const isDragging = ref(false)
const isImporting = ref(false)
const progress = ref(0)
const error = ref<string | null>(null)
const result = ref<{ success: boolean; booksCount: number; clippingsCount: number } | null>(null)

const fileInputRef = ref<HTMLInputElement>()

const formats = [
  { id: 'txt' as const, label: 'Kindle TXT', icon: FileText, accept: '.txt' },
  { id: 'csv' as const, label: 'CSV Export', icon: Table, accept: '.csv' },
  { id: 'json' as const, label: 'JSON Data', icon: FileJson, accept: '.json' }
]

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    await processFile(files[0])
  }
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    await processFile(target.files[0])
  }
}

const processFile = async (file: File) => {
  try {
    isImporting.value = true
    progress.value = 0
    error.value = null
    result.value = null

    // Read file
    progress.value = 20
    const content = await file.text()

    // TODO: Parse with kindle-tools-ts
    progress.value = 50
    console.log('File content length:', content.length)

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 500))
    progress.value = 80

    // TODO: Save to IndexedDB
    progress.value = 100

    result.value = {
      success: true,
      booksCount: 0,
      clippingsCount: 0
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
    result.value = { success: false, booksCount: 0, clippingsCount: 0 }
  } finally {
    isImporting.value = false
  }
}

const reset = () => {
  isImporting.value = false
  progress.value = 0
  error.value = null
  result.value = null
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">Import Kindle Highlights</h1>
      <p class="text-gray-600 dark:text-gray-400">
        Upload your "My Clippings.txt" file to get started
      </p>
    </div>

    <!-- Import State: Idle -->
    <div v-if="!isImporting && !result">
      <!-- Format Selector -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <button
          v-for="format in formats"
          :key="format.id"
          @click="selectedFormat = format.id"
          :class="[
            'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
            selectedFormat === format.id
              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
          ]"
        >
          <component :is="format.icon" class="h-8 w-8" />
          <span class="font-medium">{{ format.label }}</span>
        </button>
      </div>

      <!-- Dropzone -->
      <div
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop="handleDrop"
        :class="[
          'border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-primary-400'
        ]"
        @click="fileInputRef?.click()"
      >
        <Upload class="h-16 w-16 mx-auto mb-4 text-gray-400" />
        
        <h3 class="text-xl font-semibold mb-2">
          Drop your {{ selectedFormat.toUpperCase() }} file here
        </h3>
        
        <p class="text-gray-600 dark:text-gray-400 mb-4">or click to choose a file</p>
        
        <input
          ref="fileInputRef"
          type="file"
          :accept="formats.find(f => f.id === selectedFormat)?.accept"
          class="hidden"
          @change="handleFileSelect"
        />
      </div>

      <!-- Help Box -->
      <div class="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 class="font-semibold mb-2 flex items-center gap-2">
          <FileText class="h-5 w-5" />
          Where to find your file
        </h3>
        <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Connect your Kindle to your computer</li>
          <li>Open the Kindle drive</li>
          <li>Navigate to <code class="bg-white dark:bg-gray-800 px-1 rounded">documents</code> folder</li>
          <li>Find <code class="bg-white dark:bg-gray-800 px-1 rounded">My Clippings.txt</code></li>
        </ol>
      </div>
    </div>

    <!-- Import State: Processing -->
    <div v-else-if="isImporting" class="text-center py-16">
      <div class="animate-spin h-16 w-16 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <h2 class="text-2xl font-semibold mb-2">Processing your file...</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        This may take a moment for large files
      </p>
      
      <!-- Progress bar -->
      <div class="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          class="bg-primary-600 h-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <p class="text-sm text-gray-500 mt-2">{{ progress }}%</p>
    </div>

    <!-- Import State: Success -->
    <div v-else-if="result?.success" class="text-center py-16">
      <CheckCircle class="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h2 class="text-2xl font-semibold mb-2">Import Successful!</h2>
      
      <div class="flex gap-8 justify-center my-8">
        <div class="text-center">
          <div class="text-4xl font-bold text-primary-600">
            {{ result.booksCount }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Books</div>
        </div>
        <div class="text-center">
          <div class="text-4xl font-bold text-primary-600">
            {{ result.clippingsCount }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Highlights</div>
        </div>
      </div>
      
      <div class="flex gap-4 justify-center">
        <router-link to="/library" class="btn-primary">
          View Library
        </router-link>
        <button @click="reset" class="btn-secondary">
          Import Another File
        </button>
      </div>
    </div>

    <!-- Import State: Error -->
    <div v-else-if="error" class="text-center py-16">
      <XCircle class="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h2 class="text-2xl font-semibold mb-2">Import Failed</h2>
      <p class="text-red-600 dark:text-red-400 mb-6">{{ error }}</p>
      
      <button @click="reset" class="btn-primary">
        Try Again
      </button>
    </div>
  </div>
</template>
