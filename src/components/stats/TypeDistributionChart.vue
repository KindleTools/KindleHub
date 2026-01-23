<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useI18n } from 'vue-i18n'

import type { TypeDistribution } from '@/composables/useStatistics'

use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

// Expects TypeDistribution object
const props = defineProps<{
  data: TypeDistribution
}>()

const { t } = useI18n()
const isDark = useDark()

// Theme-aware colors
const colors = computed(() => ({
  legendText: isDark.value ? '#9ca3af' : '#6b7280',
  borderColor: isDark.value ? '#1f2937' : '#fff',
  tooltipBg: isDark.value ? '#1f2937' : '#fff',
  tooltipBorder: isDark.value ? '#374151' : '#e5e7eb',
  tooltipText: isDark.value ? '#f3f4f6' : '#111827'
}))

// Accessibility: generate summary text
const accessibilitySummary = computed(() => {
  const { highlights, notes, bookmarks } = props.data
  const total = highlights + notes + bookmarks
  if (total === 0) return t('stats.no_data')

  const hPct = Math.round((highlights / total) * 100)
  const nPct = Math.round((notes / total) * 100)
  const bPct = Math.round((bookmarks / total) * 100)

  return `${t('stats.type_distribution')}: ${t('clipping.highlight')} ${hPct}%, ${t('clipping.note')} ${nPct}%, ${t('clipping.bookmark')} ${bPct}%`
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: colors.value.tooltipBg,
    borderColor: colors.value.tooltipBorder,
    textStyle: { color: colors.value.tooltipText },
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'horizontal',
    bottom: 0,
    textStyle: {
      color: colors.value.legendText
    }
  },
  color: [
    '#f59e0b', // Highlight (Yellow)
    '#10b981', // Note (Green)
    '#6366f1' // Bookmark (Indigo)
  ],
  series: [
    {
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: colors.value.borderColor,
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      data: [
        {
          value: props.data.highlights,
          name: t('clipping.highlight'),
          itemStyle: { color: '#f59e0b' }
        },
        {
          value: props.data.notes,
          name: t('clipping.note'),
          itemStyle: { color: '#10b981' }
        },
        {
          value: props.data.bookmarks,
          name: t('clipping.bookmark'),
          itemStyle: { color: '#6366f1' }
        }
      ]
    }
  ]
}))
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full" role="figure" :aria-label="accessibilitySummary">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ $t('stats.type_distribution') }}
    </h3>
    <VChart
      :option="chartOption"
      autoresize
      class="h-64"
    />
  </div>
</template>
