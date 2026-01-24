<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { use } from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useI18n } from 'vue-i18n'

use([RadarChart, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{
  data: { name: string, value: number, max: number }[]
}>()

const { t } = useI18n()
const isDark = useDark()

const colors = computed(() => ({
  text: isDark.value ? '#9ca3af' : '#4b5563',
  splitLine: isDark.value ? '#374151' : '#e5e7eb',
  splitArea: isDark.value ? ['#1f2937', '#111827'] : ['#fff', '#f9fafb'],
  axisLine: isDark.value ? '#4b5563' : '#d1d5db',
  areaColor: isDark.value ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.2)',
  lineColor: '#3b82f6'
}))

const chartOption = computed(() => ({
  tooltip: {},
  radar: {
    indicator: props.data.map((d) => ({ name: d.name, max: d.max })),
    splitNumber: 4,
    axisName: {
      color: colors.value.text,
      fontSize: 12
    },
    splitLine: {
      lineStyle: {
        color: colors.value.splitLine
      }
    },
    splitArea: {
      areaStyle: {
        color: colors.value.splitArea
      }
    },
    axisLine: {
      lineStyle: {
        color: colors.value.axisLine
      }
    }
  },
  series: [
    {
      name: 'Reading Profile',
      type: 'radar',
      data: [
        {
          value: props.data.map((d) => d.value),
          name: t('stats.reading_profile', 'Current Profile'),
          areaStyle: {
            color: colors.value.areaColor
          },
          lineStyle: {
            color: colors.value.lineColor,
            width: 2
          },
          itemStyle: {
            color: colors.value.lineColor
          }
        }
      ]
    }
  ]
}))
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ $t('stats.reading_profile', 'Reader Profile') }}
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
