<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import StatsLayout from '@/components/stats/StatsLayout.vue'
import { useBooksStore } from '@/stores/books'
import { useClippingsStore } from '@/stores/clippings'

// We will implement charts and import them here
/*
import ActivityChart from '@/components/stats/ActivityChart.vue'
import TopBooksChart from '@/components/stats/TopBooksChart.vue'
import TypeDistributionChart from '@/components/stats/TypeDistributionChart.vue'
import HeatmapChart from '@/components/stats/HeatmapChart.vue'
import StreakChart from '@/components/stats/StreakChart.vue'
import TreemapChart from '@/components/stats/TreemapChart.vue'
import MonthlyActivityChart from '@/components/stats/MonthlyActivityChart.vue'
import LengthDistributionChart from '@/components/stats/LengthDistributionChart.vue'
import BooksScatterChart from '@/components/stats/BooksScatterChart.vue'
// WordCloud is optional/plugin dependant
// import WordCloudChart from '@/components/stats/WordCloudChart.vue'
*/

const { t } = useI18n()
const booksStore = useBooksStore()
const clippingsStore = useClippingsStore()

onMounted(async () => {
  await Promise.all([
    booksStore.loadBooks(),
    clippingsStore.loadStats(),
    clippingsStore.loadAllClippings()
  ])
})

</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ t('stats.title', 'Statistics') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('stats.subtitle', 'Deep dive into your reading habits') }}
      </p>
    </div>

    <!-- Layout will hold the grid of charts -->
    <StatsLayout />
  </div>
</template>
