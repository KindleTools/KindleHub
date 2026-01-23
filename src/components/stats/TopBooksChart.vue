<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useI18n } from 'vue-i18n'

import type { TopBook } from '@/composables/useStatistics'

use([BarChart, TooltipComponent, GridComponent, CanvasRenderer])

const props = defineProps<{
  data: TopBook[]
}>()

const { t } = useI18n()
const isDark = useDark()

// Theme-aware colors
const colors = computed(() => ({
  axisLabel: isDark.value ? '#9ca3af' : '#6b7280',
  tooltipBg: isDark.value ? '#1f2937' : '#fff',
  tooltipBorder: isDark.value ? '#374151' : '#e5e7eb',
  tooltipText: isDark.value ? '#f3f4f6' : '#111827'
}))

// Accessibility: generate summary text
const accessibilitySummary = computed(() => {
  if (props.data.length === 0) return t('stats.no_data')
  const books = props.data.slice(0, 8)
  const topBook = books[0]
  return `${t('stats.top_books')}: ${books.length} books. Top: "${topBook.title}" by ${topBook.author} (${topBook.count} ${t('stats.total_highlights')})`
})

const chartOption = computed(() => {
  const books = props.data.slice(0, 8)
  const maxCount = Math.max(...books.map((b) => b.count), 1)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: colors.value.tooltipBg,
      borderColor: colors.value.tooltipBorder,
      textStyle: { color: colors.value.tooltipText },
      formatter: (params: { name: string, value: number }[]) => {
        const item = params[0]
        if (!item) return ''
        const book = books.find((b) => b.title === item.name)
        return `<strong>${item.name}</strong><br/>${book?.author || ''}<br/>${item.value} ${t('stats.total_highlights')}`
      }
    },
    grid: {
      left: 8,
      right: 16,
      top: 8,
      bottom: 8,
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
      data: books.map((b) => b.title).reverse(),
      inverse: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: colors.value.axisLabel,
        width: 120,
        overflow: 'truncate',
        fontSize: 11
      }
    },
    series: [
      {
        type: 'bar',
        data: books.map((b) => b.count).reverse(),
        barWidth: 16,
        itemStyle: {
          color: '#6366f1',
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
  <div class="card" role="figure" :aria-label="accessibilitySummary">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ $t('stats.top_books') }}
    </h3>
    <VChart
      v-if="data.length > 0"
      :option="chartOption"
      autoresize
      class="h-48 sm:h-64"
    />
    <div
      v-else
      class="h-48 sm:h-64 flex items-center justify-center text-gray-400 text-sm"
    >
      {{ $t('stats.no_data') }}
    </div>
  </div>
</template>
