<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import type { TopBook } from '@/composables/useStatistics'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

use([BarChart, TooltipComponent, GridComponent, CanvasRenderer])

const props = defineProps<{
  data: TopBook[]
}>()

const chartOption = computed(() => {
  const books = props.data.slice(0, 8)
  const maxCount = Math.max(...books.map((b) => b.count), 1)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: { name: string, value: number }[]) => {
        const item = params[0]
        if (!item) return ''
        const book = books.find((b) => b.title === item.name)
        return `<strong>${item.name}</strong><br/>${book?.author || ''}<br/>${item.value} ${t('stats.total_highlights')}`
      }
    },
    grid: {
      left: 8,
      right: 16,
      top: 8,
      bottom: 8,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: maxCount,
      splitLine: { show: false },
      axisLabel: { show: false },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: books.map((b) => b.title).reverse(),
      inverse: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#6b7280',
        width: 120,
        overflow: 'truncate',
        fontSize: 11
      }
    },
    series: [
      {
        type: 'bar',
        data: books.map((b) => b.count).reverse(),
        barWidth: 16,
        itemStyle: {
          color: '#6366f1',
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          color: '#6b7280',
          fontSize: 11
        }
      }
    ]
  }
})
</script>

<template>
  <div class="card">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ $t('stats.top_books') }}
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
