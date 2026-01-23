<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useI18n } from 'vue-i18n'
import { parseISO, format } from 'date-fns'

use([BarChart, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{
  data: { month: string, highlights: number, notes: number, bookmarks: number }[]
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
  tooltipText: isDark.value ? '#f3f4f6' : '#111827',
  legendText: isDark.value ? '#9ca3af' : '#6b7280'
}))

// Accessibility
const accessibilitySummary = computed(() => {
  if (props.data.length === 0) return t('stats.no_data')
  return t('stats.monthly_breakdown_desc')
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: colors.value.tooltipBg,
    borderColor: colors.value.tooltipBorder,
    textStyle: { color: colors.value.tooltipText }
  },
  legend: {
    data: [t('clipping.highlight'), t('clipping.note'), t('clipping.bookmark')],
    textStyle: { color: colors.value.legendText },
    bottom: 0
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: props.data.map((d) => format(parseISO(d.month + '-01'), 'MMM yy')),
    axisLine: { lineStyle: { color: colors.value.axisLine } },
    axisLabel: { color: colors.value.axisLabel }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: colors.value.splitLine } },
    axisLabel: { color: colors.value.axisLabel }
  },
  series: [
    {
      name: t('clipping.highlight'),
      type: 'bar',
      stack: 'total',
      emphasis: { focus: 'series' },
      data: props.data.map((d) => d.highlights),
      itemStyle: { color: '#f59e0b' }
    },
    {
      name: t('clipping.note'),
      type: 'bar',
      stack: 'total',
      emphasis: { focus: 'series' },
      data: props.data.map((d) => d.notes),
      itemStyle: { color: '#10b981' }
    },
    {
      name: t('clipping.bookmark'),
      type: 'bar',
      stack: 'total',
      emphasis: { focus: 'series' },
      data: props.data.map((d) => d.bookmarks),
      itemStyle: { color: '#6366f1' }
    }
  ]
}))
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full" role="figure" :aria-label="accessibilitySummary">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ $t('stats.monthly_breakdown') }}
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
