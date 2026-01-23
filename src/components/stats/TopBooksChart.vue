<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useI18n } from 'vue-i18n'

import type { BookStats } from '@/composables/useStatistics'

use([BarChart, TooltipComponent, GridComponent, CanvasRenderer])

const props = defineProps<{
  data: BookStats[]
}>()

const { t } = useI18n()
const isDark = useDark()

// Theme-aware colors
const colors = computed(() => ({
  axisLabel: isDark.value ? '#9ca3af' : '#6b7280',
  tooltipBg: isDark.value ? '#1f2937' : '#fff',
  tooltipBorder: isDark.value ? '#374151' : '#e5e7eb',
  tooltipText: isDark.value ? '#f3f4f6' : '#111827',
  barColor: '#6366f1'
}))

// Accessibility: generate summary text
const accessibilitySummary = computed(() => {
  if (props.data.length === 0) return t('stats.no_data')
  // const books = props.data.slice(0, 8)
  const topBook = props.data[0]
  if (!topBook) return t('stats.no_data')
  return `${t('stats.top_books')}: ${props.data.length} books. Top: "${topBook.book}" by ${topBook.author} (${topBook.count} ${t('stats.total_highlights')})`
})

const chartOption = computed(() => {
  // Use prop data directly as useStatistics already slices it or we can slice here just in case
  const books = props.data.slice(0, 10).reverse() // Reverse for horizontal bar to show top on top
  const maxCount = Math.max(...books.map((b) => b.count), 1)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: colors.value.tooltipBg,
      borderColor: colors.value.tooltipBorder,
      textStyle: { color: colors.value.tooltipText },
      formatter: (params: any) => {
        const item = params[0]
        if (!item) return ''
        const book = books.find((b) => b.book === item.name)
        if (!book) return ''

        return [
          `<strong>${item.name}</strong>`,
          book.author,
          `${t('clipping.highlight', 2)}: ${book.highlights}`,
          `${t('clipping.note', 2)}: ${book.notes}`,
          `Total: ${book.count}`
        ].join('<br/>')
      }
    },
    grid: {
      left: 10,
      right: 20,
      top: 10,
      bottom: 10,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: maxCount,
      splitLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: books.map((b) => b.book),
      inverse: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: colors.value.axisLabel,
        width: 140,
        overflow: 'truncate',
        fontSize: 11
      }
    },
    series: [
      {
        type: 'bar',
        data: books.map((b) => b.count),
        barWidth: 16,
        itemStyle: {
          color: colors.value.barColor,
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          color: colors.value.axisLabel,
          fontSize: 11
        }
      }
    ]
  }
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full" role="figure" :aria-label="accessibilitySummary">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ $t('stats.top_books') }}
    </h3>
    <VChart
      v-if="data.length > 0"
      :option="chartOption"
      autoresize
      class="h-64"
    />
    <div
      v-else
      class="h-64 flex items-center justify-center text-gray-400 text-sm"
    >
      {{ $t('stats.no_data') }}
    </div>
  </div>
</template>
