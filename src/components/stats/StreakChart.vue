<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDark } from '@vueuse/core'
import { use } from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import { TooltipComponent, CalendarComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useI18n } from 'vue-i18n'

import type { HeatmapPoint } from '@/composables/useStatistics'

use([HeatmapChart, TooltipComponent, CalendarComponent, VisualMapComponent, CanvasRenderer])

const props = withDefaults(defineProps<{
  data: HeatmapPoint[]
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
  return Array.from(years).sort((a, b) => b - a) // Descending
})

// Ensure selected year is valid when data changes
watch(availableYears, (years) => {
  if (!years.includes(selectedYear.value)) {
    selectedYear.value = years[0] ?? currentYear
  }
}, { immediate: true })

// Colors
const colors = computed(() => ({
  border: isDark.value ? '#374151' : '#fff',
  text: isDark.value ? '#9ca3af' : '#4b5563',
  itemBorder: isDark.value ? '#1f2937' : '#fff',
  monthLabel: isDark.value ? '#9ca3af' : '#6b7280',
  dayLabel: isDark.value ? '#6b7280' : '#9ca3af',
  tooltipBg: isDark.value ? '#1f2937' : '#fff',
  tooltipBorder: isDark.value ? '#374151' : '#e5e7eb',
  tooltipText: isDark.value ? '#f3f4f6' : '#111827',
  buttonText: isDark.value ? '#e5e7eb' : '#374151',
  buttonHover: isDark.value ? '#374151' : '#f3f4f6'
}))

// Chart Range
const range = computed(() => {
  if (props.total) return 2000 // Dummy year for aggregation
  return selectedYear.value
})

// Chart Data
const chartData = computed(() => {
  if (props.total) {
    // Aggregate all years to 2000
    const map = new Map<string, number>()
    props.data.forEach((p) => {
      const d = new Date(p.date)
      const key = `2000-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      map.set(key, (map.get(key) || 0) + p.count)
    })
    return Array.from(map.entries()).map(([date, count]) => [date, count])
  } else {
    // Filter by selected year
    return props.data
      .filter((p) => new Date(p.date).getFullYear() === selectedYear.value)
      .map((p) => [p.date, p.count])
  }
})

// Accessibility
const accessibilitySummary = computed(() => {
  if (props.data.length === 0) return t('stats.no_data')
  return t('stats.streak_desc')
})

const chartOption = computed(() => ({
  tooltip: {
    backgroundColor: colors.value.tooltipBg,
    borderColor: colors.value.tooltipBorder,
    textStyle: { color: colors.value.tooltipText },
    formatter: (params: any) => {
      const date = new Date(params.value[0])
      const month = date.toLocaleString('default', { month: 'short' })
      const day = date.getDate()
      const count = params.value[1]
      return `${month} ${day}: <strong>${count}</strong> highlights`
    }
  },
  visualMap: {
    min: 0,
    max: 10,
    calculable: true,
    type: 'piecewise',
    orient: 'horizontal',
    left: 'center',
    bottom: 0,
    inRange: {
      color: isDark.value
        ? ['#1f2937', '#064e3b', '#065f46', '#047857', '#059669', '#10b981'] // Dark mode greens
        : ['#f3f4f6', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981'] // Light mode greens
    },
    pieces: [
      { min: 0, max: 0, label: '0' },
      { min: 1, max: 3, label: '1-3' },
      { min: 4, max: 8, label: '4-8' },
      { min: 9, max: 15, label: '9-15' },
      { min: 16, label: '16+' }
    ],
    textStyle: {
      color: colors.value.text
    }
  },
  calendar: {
    top: 30,
    left: 30,
    right: 30,
    cellSize: ['auto', 16],
    range: range.value,
    itemStyle: {
      borderWidth: 2,
      borderColor: colors.value.itemBorder,
      color: 'transparent'
    },
    splitLine: { show: false },
    dayLabel: {
      color: colors.value.dayLabel,
      nameMap: 'en'
    },
    monthLabel: {
      color: colors.value.monthLabel
    },
    yearLabel: { show: false }
  },
  series: {
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: chartData.value
  }
}))
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full" role="figure" :aria-label="accessibilitySummary">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ $t('stats.consistency') }}
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
      class="h-48"
    />
    <div
      v-else
      class="h-48 flex items-center justify-center text-gray-400 text-sm"
    >
      {{ $t('stats.no_data') }}
    </div>
  </div>
</template>
