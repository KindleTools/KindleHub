<script setup lang="ts">
import { BookOpen, Download, Highlighter, Library, Sparkles, Upload, Users } from 'lucide-vue-next'

import { useBooksStore } from '@/stores/books'
import { useClippingsStore } from '@/stores/clippings'
import { useStatistics } from '@/composables/useStatistics'
import {
  StatCard,
  TypeDistributionChart,
  TopBooksChart,
  ActivityChart,
  InsightsPanel
} from '@/components/stats'

const booksStore = useBooksStore()
const clippingsStore = useClippingsStore()
const stats = useStatistics()

onMounted(async () => {
  await Promise.all([
    booksStore.loadBooks(),
    clippingsStore.loadStats(),
    clippingsStore.loadAllClippings()
  ])
})
</script>

<template>
  <div class="max-w-6xl mx-auto py-8 px-4">
    <!-- Hero Section (shown when no data) -->
    <template v-if="!stats.hasData">
      <div class="text-center mb-12">
        <img
          src="/logo.png"
          alt="Kindle Hub"
          class="h-24 w-auto mx-auto mb-6"
        />
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
            <Upload class="h-6 w-6 text-primary-600" aria-hidden="true" />
          </div>
          <h3 class="font-semibold text-lg mb-2">{{ $t('home.import_title') }}</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            {{ $t('home.import_desc') }}
          </p>
        </div>

        <div class="card text-center">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Sparkles class="h-6 w-6 text-green-600" aria-hidden="true" />
          </div>
          <h3 class="font-semibold text-lg mb-2">{{ $t('home.organize_title') }}</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            {{ $t('home.organize_desc') }}
          </p>
        </div>

        <div class="card text-center">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Download class="h-6 w-6 text-purple-600" aria-hidden="true" />
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
          <Upload class="h-5 w-5" aria-hidden="true" />
          {{ $t('home.cta_import') }}
        </router-link>
        <router-link to="/library" class="btn-secondary text-lg px-8 py-3 inline-flex items-center justify-center gap-2">
          <BookOpen class="h-5 w-5" aria-hidden="true" />
          {{ $t('home.cta_library') }}
        </router-link>
      </div>
    </template>

    <!-- Dashboard with Stats (shown when has data) -->
    <template v-else>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {{ $t('stats.dashboard') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('stats.dashboard_desc') }}
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          :value="stats.totalClippings"
          :label="$t('stats.total_highlights')"
          :icon="Highlighter"
          color="primary"
        />
        <StatCard
          :value="stats.totalBooks"
          :label="$t('stats.total_books')"
          :icon="Library"
          color="green"
        />
        <StatCard
          :value="stats.totalAuthors"
          :label="$t('stats.total_authors')"
          :icon="Users"
          color="purple"
        />
        <StatCard
          :value="stats.yearsReading"
          :label="$t('stats.years_reading')"
          :icon="BookOpen"
          color="amber"
        />
      </div>

      <!-- Charts Row 1 -->
      <div class="grid lg:grid-cols-2 gap-6 mb-6">
        <ActivityChart :data="stats.timelineData" />
        <TopBooksChart :data="stats.topBooks" />
      </div>

      <!-- Charts Row 2 -->
      <div class="grid lg:grid-cols-2 gap-6 mb-8">
        <TypeDistributionChart :data="stats.typeDistribution" />
        <InsightsPanel :insights="stats.insights" />
      </div>

      <!-- Quick Actions -->
      <div class="flex flex-wrap gap-4 justify-center">
        <router-link to="/import" class="btn-secondary inline-flex items-center gap-2">
          <Upload class="h-4 w-4" aria-hidden="true" />
          {{ $t('home.cta_import') }}
        </router-link>
        <router-link to="/library" class="btn-secondary inline-flex items-center gap-2">
          <Library class="h-4 w-4" aria-hidden="true" />
          {{ $t('home.cta_library') }}
        </router-link>
        <router-link to="/export" class="btn-secondary inline-flex items-center gap-2">
          <Download class="h-4 w-4" aria-hidden="true" />
          {{ $t('nav.export') }}
        </router-link>
      </div>
    </template>
  </div>
</template>
