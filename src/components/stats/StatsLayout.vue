<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStatistics } from '@/composables/useStatistics'
// Charts will be imported here as we implement them
import ActivityChart from './ActivityChart.vue'
import TopBooksChart from './TopBooksChart.vue'
import TypeDistributionChart from './TypeDistributionChart.vue'
import HeatmapChart from './HeatmapChart.vue'
import StreakChart from './StreakChart.vue'
import TreemapChart from './TreemapChart.vue'
import MonthlyActivityChart from './MonthlyActivityChart.vue'
import LengthDistributionChart from './LengthDistributionChart.vue'
import BooksScatterChart from './BooksScatterChart.vue'
// import InsightsPanel from './InsightsPanel.vue'
// import TopicCloud from './TopicCloud.vue'
import TagCloud from './TagCloud.vue'
import ReadingRadarChart from './ReadingRadarChart.vue'
import BadgesPanel from './BadgesPanel.vue'

const { t } = useI18n()
const stats = useStatistics()

const overviewCards = computed(() => [
  {
    label: t('stats.total_highlights', 'Total Highlights'),
    value: stats.totalClippings.value,
    icon: '📈'
  },
  {
    label: t('stats.total_books', 'Books'),
    value: stats.totalBooks.value,
    icon: '📚'
  },
  {
    label: t('stats.total_authors', 'Authors'),
    value: stats.totalAuthors.value,
    icon: '✍️'
  },
  {
    label: t('stats.total_tags', 'Tags'),
    value: stats.totalTags.value,
    icon: '🏷️'
  },
  {
    label: t('stats.days_active', 'Active Days'),
    value: stats.daysActive.value,
    icon: '📅'
  }
])
</script>

<template>
  <div class="space-y-6">
    <!-- Overview Cards -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div
        v-for="card in overviewCards"
        :key="card.label"
        class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between"
      >
        <div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ card.label }}</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ card.value }}</p>
        </div>
        <span class="text-3xl filter grayscale opacity-80">{{ card.icon }}</span>
      </div>
    </div>

    <!-- Main Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Activity Chart (Full Width) -->
      <div class="lg:col-span-2">
        <ActivityChart :data="stats.timelineData.value" />
      </div>

      <!-- Top Books & Type Distribution -->
      <div>
        <TopBooksChart :data="stats.topBooks.value" />
      </div>
      <div>
        <TypeDistributionChart :data="stats.typeDistribution.value" />
      </div>

      <!-- Heatmaps -->
      <div>
        <HeatmapChart :data="stats.clippingsStore.clippings" />
      </div>
      <div>
        <StreakChart :data="stats.calendarData.value" />
      </div>

      <!-- Advanced Stats (Full Width) -->
      <div class="lg:col-span-2">
        <h2 class="text-xl font-bold mb-4">{{ t('stats.advanced_stats', 'Advanced Statistics') }}</h2>
      </div>

      <!-- Treemap -->
      <div class="lg:col-span-2">
        <TreemapChart :data="stats.authorStats.value" />
      </div>

      <!-- Monthly Breakdown -->
      <div class="lg:col-span-2">
        <MonthlyActivityChart :data="stats.monthlyBreakdown.value" />
      </div>

      <!-- Length Distribution & Scatter -->
      <div>
        <LengthDistributionChart :data="stats.highlightLengths.value" />
      </div>
      <div>
        <BooksScatterChart :data="stats.bookStats.value" />
      </div>

      <!-- Profiling & Tags -->
      <div>
        <ReadingRadarChart :data="stats.radarMetrics.value" />
      </div>
      <div>
        <TagCloud :data="stats.tagStats.value" />
      </div>

      <!-- Gamification -->
      <div class="lg:col-span-2">
        <BadgesPanel :badges="stats.badges.value" />
      </div>

      <!-- Insights -->
      <!-- <div class="lg:col-span-2">
        <InsightsPanel />
      </div> -->
    </div>
  </div>
</template>
