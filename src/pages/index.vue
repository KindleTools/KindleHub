<script setup lang="ts">
import { BookOpen, Download, Sparkles, Upload } from 'lucide-vue-next'

import { useBooksStore } from '@/stores/books'
import { useClippingsStore } from '@/stores/clippings'

const booksStore = useBooksStore()
const clippingsStore = useClippingsStore()

onMounted(async () => {
  await Promise.all([
    booksStore.loadBooks(),
    clippingsStore.loadStats()
  ])
})

const hasData = computed(() => booksStore.totalBooks > 0)
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-4">
        <i18n-t keypath="app.welcome" tag="span">
          <template #app>
            <span class="text-primary-600">KindleHub</span>
          </template>
        </i18n-t>
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        {{ $t('app.description') }}
      </p>
    </div>

    <!-- Features Grid -->
    <div class="grid md:grid-cols-3 gap-6 mb-12">
      <div class="card text-center">
        <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Upload class="h-6 w-6 text-primary-600" />
        </div>
        <h3 class="font-semibold text-lg mb-2">{{ $t('home.import_title') }}</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          {{ $t('home.import_desc') }}
        </p>
      </div>

      <div class="card text-center">
        <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Sparkles class="h-6 w-6 text-green-600" />
        </div>
        <h3 class="font-semibold text-lg mb-2">{{ $t('home.organize_title') }}</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          {{ $t('home.organize_desc') }}
        </p>
      </div>

      <div class="card text-center">
        <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Download class="h-6 w-6 text-purple-600" />
        </div>
        <h3 class="font-semibold text-lg mb-2">{{ $t('home.export_title') }}</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          {{ $t('home.export_desc') }}
        </p>
      </div>
    </div>

    <!-- CTA Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <router-link to="/import" class="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center gap-2">
        <Upload class="h-5 w-5" />
        {{ $t('home.cta_import') }}
      </router-link>
      <router-link to="/library" class="btn-secondary text-lg px-8 py-3 inline-flex items-center justify-center gap-2">
        <BookOpen class="h-5 w-5" />
        {{ $t('home.cta_library') }}
      </router-link>
    </div>

    <!-- Stats (dynamic) -->
    <div class="mt-16 text-center">
      <div v-if="hasData" class="flex gap-8 justify-center">
        <div class="text-center">
          <div class="text-3xl font-bold text-primary-600">
            {{ booksStore.totalBooks }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('home.stats_books') }}</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-primary-600">
            {{ clippingsStore.stats.totalClippings }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('home.stats_highlights') }}</div>
        </div>
      </div>
      <p v-else class="text-gray-500 dark:text-gray-400 text-sm">
        {{ $t('home.no_data') }}
      </p>
    </div>
  </div>
</template>
