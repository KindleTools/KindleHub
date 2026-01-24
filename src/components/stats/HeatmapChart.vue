<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDark } from '@vueuse/core'
import { use } from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import { TooltipComponent, GridComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useI18n } from 'vue-i18n'

use([HeatmapChart, TooltipComponent, GridComponent, VisualMapComponent, CanvasRenderer])

const props = withDefaults(defineProps<{
  data: { date: Date | string }[]
  total?: boolean
}>(), {
  total: false
})

const { t } = useI18n()
const isDark = useDark()

const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)

const availableYears = computed(() => {
  if (props.data.length === 0) return [currentYear]
  const years = new Set(props.data.map((d) => new Date(d.date).getFullYear()))
  return Array.from(years).sort((a, b) => b - a)
})

watch(availableYears, (years) => {
  if (!years.includes(selectedYear.value)) {
    selectedYear.value = years[0] ?? currentYear
  }
}, { immediate: true })

// Theme-aware colors
const colors = computed(() => ({
  text: isDark.value ? '#9ca3af' : '#4b5563',
  splitLine: isDark.value ? '#1f2937' : '#e5e7eb',
  dayLabel: isDark.value ? '#9ca3af' : '#6b7280',
  tooltipBg: isDark.value ? '#1f2937' : '#fff',
  tooltipBorder: isDark.value ? '#374151' : '#e5e7eb',
  tooltipText: isDark.value ? '#f3f4f6' : '#111827',
  buttonText: isDark.value ? '#e5e7eb' : '#374151',
  buttonHover: isDark.value ? '#374151' : '#f3f4f6'
}))

// Labels
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

// Process data locally based on selection
const chartData = computed(() => {
  const points: Record<string, number> = {}
  // Init grid
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      points[`${d}-${h}`] = 0
    }
  }

  const targetData = props.total
    ? props.data
    : props.data.filter((d) => new Date(d.date).getFullYear() === selectedYear.value)

  targetData.forEach((item) => {
    const date = new Date(item.date)
    const day = date.getDay()
    const hour = date.getHours()
    const key = `${day}-${hour}`
    if (points[key] !== undefined) points[key]++
  })

  // ECharts Heatmap format: [x, y, value] -> [hour, day, count]
  return Object.entries(points).map(([key, count]) => {
    const [dStr, hStr] = key.split('-')
    return [Number(hStr), Number(dStr), count]
  })
})

const maxCount = computed(() => {
  if (chartData.value.length === 0) return 0
  return Math.max(...chartData.value.map((item) => item[2]))
})

const accessibilitySummary = computed(() => {
  if (props.data.length === 0) return t('stats.no_data')
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
    splitArea: { show: true },
    axisLabel: {
      color: colors.value.text,
      interval: 2
    }
  },
  yAxis: {
    type: 'category',
    data: days.value,
    splitArea: { show: true },
    axisLabel: { color: colors.value.text }
  },
  visualMap: {
    min: 0,
    max: maxCount.value || 5,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '0%',
    show: false,
    inRange: {
      color: isDark.value
        ? ['#1f2937', '#0c4a6e', '#0284c7', '#38bdf8']
        : ['#f3f4f6', '#bae6fd', '#38bdf8', '#0284c7']
    }
  },
  series: [
    {
      name: 'Highlights',
      type: 'heatmap',
      data: chartData.value,
      label: { show: false },
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
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ $t('stats.reading_patterns') }}
        <span class="text-gray-500 font-normal ml-1">
          ({{ total ? $t('stats.all_time') : selectedYear }})
        </span>
      </h3>

      <!-- Year Selector -->
      <div v-if="!total && availableYears.length > 1" class="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          v-for="year in availableYears"
          :key="year"
          class="px-3 py-1 text-xs rounded-md transition-colors"
          :class="selectedYear === year ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'"
          @click="selectedYear = year"
        >
          {{ year }}
        </button>
      </div>
    </div>

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
