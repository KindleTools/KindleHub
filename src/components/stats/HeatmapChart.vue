<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { use } from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useI18n } from 'vue-i18n'

import type { DayHourPoint } from '@/composables/useStatistics'

use([HeatmapChart, TooltipComponent, GridComponent, VisualMapComponent, CanvasRenderer])

const props = defineProps<{
  data: DayHourPoint[]
}>()

const { t } = useI18n()
const isDark = useDark()

// Theme-aware colors
const colors = computed(() => ({
  text: isDark.value ? '#9ca3af' : '#4b5563',
  splitLine: isDark.value ? '#1f2937' : '#e5e7eb',
  dayLabel: isDark.value ? '#9ca3af' : '#6b7280',
  tooltipBg: isDark.value ? '#1f2937' : '#fff',
  tooltipBorder: isDark.value ? '#374151' : '#e5e7eb',
  tooltipText: isDark.value ? '#f3f4f6' : '#111827'
}))

// ECharts usually maps specific days integers to labels.
// We are using JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
// ECharts default order for 'category' axis is simple string mapping.
const days = computed(() => [
  t('date.weekday_short.sun', 'Sun'),
  t('date.weekday_short.mon', 'Mon'),
  t('date.weekday_short.tue', 'Tue'),
  t('date.weekday_short.wed', 'Wed'),
  t('date.weekday_short.thu', 'Thu'),
  t('date.weekday_short.fri', 'Fri'),
  t('date.weekday_short.sat', 'Sat')
])

const hours = Array.from({ length: 24 }, (_, i) => `${i}`)

// Accessibility: generate summary text
const accessibilitySummary = computed(() => {
  if (props.data.length === 0) return t('stats.no_data')
  // Maybe find peak day/hour?
  return t('stats.heatmap_desc')
})

const chartOption = computed(() => ({
  tooltip: {
    position: 'top',
    backgroundColor: colors.value.tooltipBg,
    borderColor: colors.value.tooltipBorder,
    textStyle: { color: colors.value.tooltipText },
    formatter: (params: any) => {
      const item = params.data
      if (!item) return ''
      // item value is [yIndex, xIndex, count] because we swapped axes for heat map?
      // Actually usually X=Hour, Y=Day
      const day = days.value[item[1]]
      const hour = item[0]
      const count = item[2]
      return `<strong>${day} ${hour}:00</strong><br/>${count} ${t('stats.total_highlights')}`
    }
  },
  grid: {
    height: '70%',
    top: '5%',
    left: '10%',
    right: '5%'
  },
  xAxis: {
    type: 'category',
    data: hours,
    splitArea: {
      show: true
    },
    axisLabel: {
      color: colors.value.text,
      interval: 2 // Show every 3rd hour label roughly
    }
  },
  yAxis: {
    type: 'category',
    data: days.value,
    splitArea: {
      show: true
    },
    axisLabel: {
      color: colors.value.text
    }
  },
  visualMap: {
    min: 0,
    max: Math.max(...props.data.map((p) => p.count), 5),
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '0%',
    show: false, // Hide numeric scale for cleaner UI
    inRange: {
      color: isDark.value
        ? ['#1f2937', '#0c4a6e', '#0284c7', '#38bdf8'] // Dark mode blueish
        : ['#f3f4f6', '#bae6fd', '#38bdf8', '#0284c7'] // Light mode blueish
    }
  },
  series: [
    {
      name: 'Highlights',
      type: 'heatmap',
      data: props.data.map((item) => {
        return [item.hour, item.day, item.count]
      }),
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}))
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full" role="figure" :aria-label="accessibilitySummary">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ $t('stats.reading_patterns') }}
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
