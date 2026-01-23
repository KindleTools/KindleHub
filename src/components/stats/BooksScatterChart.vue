<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { use } from 'echarts/core'
import { ScatterChart } from 'echarts/charts'
import { TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useI18n } from 'vue-i18n'

import type { BookStats } from '@/composables/useStatistics'

use([ScatterChart, TooltipComponent, GridComponent, CanvasRenderer])

const props = defineProps<{
  data: BookStats[]
}>()

const { t } = useI18n()
const isDark = useDark()

// Theme-aware colors
const colors = computed(() => ({
  axisLine: isDark.value ? '#374151' : '#e5e7eb',
  axisLabel: isDark.value ? '#9ca3af' : '#6b7280',
  splitLine: isDark.value ? '#1f2937' : '#f3f4f6',
  tooltipBg: isDark.value ? '#1f2937' : '#fff',
  tooltipBorder: isDark.value ? '#374151' : '#e5e7eb',
  tooltipText: isDark.value ? '#f3f4f6' : '#111827'
}))

// Accessibility
const accessibilitySummary = computed(() => {
  if (props.data.length === 0) return t('stats.no_data')
  return t('stats.scatter_desc')
})

const chartOption = computed(() => ({
  tooltip: {
    backgroundColor: colors.value.tooltipBg,
    borderColor: colors.value.tooltipBorder,
    textStyle: { color: colors.value.tooltipText },
    formatter: (params: any) => {
      const item = params.data
      // item: [highlights, notes, total, name]
      return `<strong>${item[3]}</strong><br/>Highlights: ${item[0]}<br/>Notes: ${item[1]}<br/>Total: ${item[2]}`
    }
  },
  grid: {
    left: '10%',
    right: '10%',
    bottom: '10%',
    top: '10%'
  },
  xAxis: {
    type: 'value',
    name: 'Highlights',
    splitLine: { lineStyle: { color: colors.value.splitLine } },
    axisLabel: { color: colors.value.axisLabel }
  },
  yAxis: {
    type: 'value',
    name: 'Notes',
    splitLine: { lineStyle: { color: colors.value.splitLine } },
    axisLabel: { color: colors.value.axisLabel }
  },
  series: [
    {
      type: 'scatter',
      symbolSize: function (data: any) {
        // Size based on Total count, scaled
        return Math.sqrt(data[2]) * 5
      },
      data: props.data.map((b) => [b.highlights, b.notes, b.count, b.book]),
      itemStyle: {
        color: '#8b5cf6',
        opacity: 0.7
      }
    }
  ]
}))
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full" role="figure" :aria-label="accessibilitySummary">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ $t('stats.books_scatter') }}
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
