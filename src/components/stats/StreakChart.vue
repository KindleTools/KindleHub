<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { use } from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import { TooltipComponent, CalendarComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useI18n } from 'vue-i18n'
import { differenceInDays, parseISO } from 'date-fns'

import type { HeatmapPoint } from '@/composables/useStatistics'

use([HeatmapChart, TooltipComponent, CalendarComponent, VisualMapComponent, CanvasRenderer])

const props = defineProps<{
  data: HeatmapPoint[]
  year: number
}>()

const { t } = useI18n()
const isDark = useDark()

// Theme-aware colors
const colors = computed(() => ({
  border: isDark.value ? '#374151' : '#fff',
  text: isDark.value ? '#9ca3af' : '#4b5563',
  itemBorder: isDark.value ? '#1f2937' : '#fff',
  monthLabel: isDark.value ? '#9ca3af' : '#6b7280',
  dayLabel: isDark.value ? '#6b7280' : '#9ca3af',
  tooltipBg: isDark.value ? '#1f2937' : '#fff',
  tooltipBorder: isDark.value ? '#374151' : '#e5e7eb',
  tooltipText: isDark.value ? '#f3f4f6' : '#111827'
}))

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
      const date = params.value[0]
      const count = params.value[1]
      return `${date}: <strong>${count}</strong> highlights`
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
    range: props.year,
    itemStyle: {
      borderWidth: 2,
      borderColor: colors.value.itemBorder,
      color: 'transparent'
    },
    splitLine: {
      show: false
    },
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
    data: props.data.map((p) => [p.date, p.count])
  }
}))
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full" role="figure" :aria-label="accessibilitySummary">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ $t('stats.consistency') }} ({{ year }})
      </h3>
      <!-- Potential year selector here -->
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
