<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { use } from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import { TooltipComponent, CalendarComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([HeatmapChart, TooltipComponent, CalendarComponent, VisualMapComponent, CanvasRenderer])

const props = defineProps<{
  data: [string, number][] // [date, count]
  year: number
}>()

const isDark = useDark()

// Theme-aware colors
const colors = computed(() => ({
  border: isDark.value ? '#374151' : '#fff',
  text: isDark.value ? '#9ca3af' : '#4b5563',
  splitLine: isDark.value ? '#1f2937' : '#e5e7eb',
  dayLabel: isDark.value ? '#9ca3af' : '#6b7280',
  monthLabel: isDark.value ? '#d1d5db' : '#374151',
  itemBorder: isDark.value ? '#1f2937' : '#fff'
}))

const chartOption = computed(() => ({
  tooltip: {
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
    orient: 'horizontal',
    left: 'center',
    bottom: 0,
    show: false, // Hide the visual map controller for cleaner look
    inRange: {
      color: isDark.value
        ? ['#1f2937', '#0c4a6e', '#0284c7', '#38bdf8'] // Dark mode blueish
        : ['#f3f4f6', '#bae6fd', '#38bdf8', '#0284c7'] // Light mode blueish
    }
  },
  calendar: {
    top: 30,
    left: 40,
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
      nameMap: 'en' // Or localized ideally
    },
    monthLabel: {
      color: colors.value.monthLabel
    },
    yearLabel: { show: false }
  },
  series: {
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: props.data
  }
}))
</script>

<template>
  <div class="card">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex justify-between items-center">
      <span>{{ $t('stats.activity') }} ({{ year }})</span>
    </h3>
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
