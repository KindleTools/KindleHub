<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { use } from 'echarts/core'
import { BoxplotChart } from 'echarts/charts'
import { TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useI18n } from 'vue-i18n'

use([BoxplotChart, TooltipComponent, GridComponent, CanvasRenderer])

interface BoxPlotData {
  min: number
  q1: number
  median: number
  q3: number
  max: number
  outliers: number[]
}

const props = defineProps<{
  data: BoxPlotData
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
  boxplotBorder: isDark.value ? '#9ca3af' : '#4b5563'
}))

// Accessibility
const accessibilitySummary = computed(() => {
  if (props.data.median === 0) return t('stats.no_data')
  return t('stats.length_distribution_desc')
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: colors.value.tooltipBg,
    borderColor: colors.value.tooltipBorder,
    textStyle: { color: colors.value.tooltipText },
    formatter: (params: any) => {
      // params.data -> [min, q1, median, q3, max]
      const d = params.data
      if (!d || d.length < 5) return ''
      return [
        `<strong>${params.name}</strong>`,
        `Max: ${d[5]}`,
        `Q3: ${d[4]}`,
        `Median: ${d[3]}`,
        `Q1: ${d[2]}`,
        `Min: ${d[1]}`
      ].join('<br/>')
    }
  },
  grid: {
    left: '10%',
    right: '10%',
    bottom: '15%'
  },
  xAxis: {
    type: 'category',
    data: [t('clipping.highlight')],
    axisLine: { lineStyle: { color: colors.value.axisLine } },
    axisLabel: { color: colors.value.axisLabel }
  },
  yAxis: {
    type: 'value',
    name: 'Characters',
    splitLine: { lineStyle: { color: colors.value.splitLine } },
    axisLabel: { color: colors.value.axisLabel }
  },
  series: [
    {
      name: 'Length',
      type: 'boxplot',
      data: [
        [props.data.min, props.data.q1, props.data.median, props.data.q3, props.data.max]
      ],
      itemStyle: {
        borderColor: colors.value.boxplotBorder,
        borderWidth: 2
      }
    }
    // TODO: Add outliers if needed
  ]
}))
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full" role="figure" :aria-label="accessibilitySummary">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ $t('stats.length_distribution') }}
    </h3>
    <VChart
      v-if="data.median > 0"
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
