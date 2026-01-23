<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import type { TimelinePoint } from '@/composables/useStatistics'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

use([LineChart, TooltipComponent, GridComponent, CanvasRenderer])

const props = defineProps<{
  data: TimelinePoint[]
}>()

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
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
    axisLine: { lineStyle: { color: '#e5e7eb' } },
    axisTick: { show: false },
    axisLabel: {
      color: '#6b7280',
      fontSize: 10,
      interval: Math.max(0, Math.floor(props.data.length / 6) - 1)
    }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#f3f4f6' } },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: '#9ca3af',
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
  <div class="card">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ $t('stats.activity') }}
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
