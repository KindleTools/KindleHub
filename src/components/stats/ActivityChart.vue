<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useI18n } from 'vue-i18n'

import type { TimelinePoint } from '@/composables/useStatistics'

use([LineChart, TooltipComponent, GridComponent, CanvasRenderer])

const props = defineProps<{
  data: TimelinePoint[]
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

// Accessibility: generate summary text
const accessibilitySummary = computed(() => {
  if (props.data.length === 0) return t('stats.no_data')
  const total = props.data.reduce((sum, p) => sum + p.count, 0)
  const peak = props.data.reduce((max, p) => p.count > max.count ? p : max, { label: '', count: 0, date: new Date() })
  if (!peak) return t('stats.no_data')
  return `${t('stats.activity')}: ${total} ${t('stats.total_highlights')} total. Peak: ${peak.label} (${peak.count})`
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: colors.value.tooltipBg,
    borderColor: colors.value.tooltipBorder,
    textStyle: { color: colors.value.tooltipText },
    formatter: (params: { name: string, value: number }[]) => {
      const item = params[0]
      if (!item) return ''
      return `<strong>${item.name}</strong><br/>${item.value} ${t('stats.total_highlights')}`
    }
  },
  grid: {
    left: 8,
    right: 16,
    top: 16,
    bottom: 8,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: props.data.map((p) => p.label),
    boundaryGap: false,
    axisLine: { lineStyle: { color: colors.value.axisLine } },
    axisTick: { show: false },
    axisLabel: {
      color: colors.value.axisLabel,
      fontSize: 10,
      interval: Math.max(0, Math.floor(props.data.length / 6) - 1)
    }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: colors.value.splitLine } },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: colors.value.axisLabel,
      fontSize: 10
    }
  },
  series: [
    {
      type: 'line',
      data: props.data.map((p) => p.count),
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#6366f1',
        width: 2
      },
      itemStyle: {
        color: '#6366f1'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
            { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
          ]
        }
      }
    }
  ]
}))
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full" role="figure" :aria-label="accessibilitySummary">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ $t('stats.activity') }}
    </h3>
    <VChart
      v-if="data.length > 0"
      :option="chartOption"
      autoresize
      class="h-64 sm:h-64"
    />
    <div
      v-else
      class="h-64 sm:h-64 flex items-center justify-center text-gray-400 text-sm"
    >
      {{ $t('stats.no_data') }}
    </div>
  </div>
</template>
