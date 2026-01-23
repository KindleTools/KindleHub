<script setup lang="ts">
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { use } from 'echarts/core'
import { TreemapChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useI18n } from 'vue-i18n'

import type { AuthorStats } from '@/composables/useStatistics'

use([TreemapChart, TooltipComponent, CanvasRenderer])

const props = defineProps<{
  data: AuthorStats[]
}>()

const { t } = useI18n()
const isDark = useDark()

const colors = computed(() => ({
  tooltipBg: isDark.value ? '#1f2937' : '#fff',
  tooltipBorder: isDark.value ? '#374151' : '#e5e7eb',
  tooltipText: isDark.value ? '#f3f4f6' : '#111827'
}))

// Accessibility
const accessibilitySummary = computed(() => {
  if (props.data.length === 0) return t('stats.no_data')
  return t('stats.treemap_desc')
})

const chartOption = computed(() => ({
  tooltip: {
    backgroundColor: colors.value.tooltipBg,
    borderColor: colors.value.tooltipBorder,
    textStyle: { color: colors.value.tooltipText },
    formatter: (params: any) => {
      const { name, value, treePathInfo } = params
      const path = treePathInfo.map((p: any) => p.name).join(' > ')
      // If leaf node (Book)
      if (treePathInfo.length === 3) { // [Root, Author, Book]
        return `<strong>${name}</strong><br/>${value} highlights`
      }
      // If author node
      return `<strong>${name}</strong><br/>${value} highlights`
    }
  },
  series: [
    {
      type: 'treemap',
      visibleMin: 300,
      label: {
        show: true,
        formatter: '{b}'
      },
      itemStyle: {
        borderColor: isDark.value ? '#1f2937' : '#fff'
      },
      levels: [
        {
          itemStyle: {
            borderWidth: 0,
            gapWidth: 1
          }
        },
        {
          itemStyle: {
            gapWidth: 1
          }
        },
        {
          colorSaturation: [0.35, 0.5],
          itemStyle: {
            gapWidth: 1,
            borderColorSaturation: 0.6
          }
        }
      ],
      data: props.data.map((author) => ({
        name: author.author,
        value: author.count,
        children: author.books.map((book) => ({
          name: book.book,
          value: book.count
        }))
      }))
    }
  ]
}))
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full" role="figure" :aria-label="accessibilitySummary">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
      {{ $t('stats.authors_books') }}
    </h3>
    <VChart
      v-if="data.length > 0"
      :option="chartOption"
      autoresize
      class="h-96"
    />
    <div
      v-else
      class="h-96 flex items-center justify-center text-gray-400 text-sm"
    >
      {{ $t('stats.no_data') }}
    </div>
  </div>
</template>
