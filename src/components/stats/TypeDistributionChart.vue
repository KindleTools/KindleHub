<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useI18n } from 'vue-i18n'

import type { TypeDistribution } from '@/composables/useStatistics'

use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{
  data: TypeDistribution
}>()

const { t } = useI18n()

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'horizontal',
    bottom: 0,
    textStyle: {
      color: '#6b7280'
    }
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
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
  <div class="card">
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
