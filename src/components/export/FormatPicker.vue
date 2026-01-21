<script setup lang="ts">
import { computed } from 'vue'
import { FileText, Braces, Table, Globe, Diamond, Package, Check } from 'lucide-vue-next'

import { type ExportFormat, EXPORT_FORMATS, getFormatInfo } from '@/services/export.service'

interface Props {
  modelValue: ExportFormat
}

defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: ExportFormat]
}>()

const iconMap = {
  'file-text': FileText,
  braces: Braces,
  table: Table,
  globe: Globe,
  diamond: Diamond,
  package: Package
}

const formats = computed(() => {
  return EXPORT_FORMATS.map((format) => ({
    id: format,
    ...getFormatInfo(format),
    icon: iconMap[getFormatInfo(format).icon as keyof typeof iconMap]
  }))
})
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
    <button
      v-for="format in formats"
      :key="format.id"
      :class="[
        'relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
        modelValue === format.id
          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-md'
          : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
      ]"
      @click="emit('update:modelValue', format.id)"
    >
      <!-- Selected Check -->
      <div
        v-if="modelValue === format.id"
        class="absolute top-2 right-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center"
      >
        <Check class="h-3 w-3 text-white" />
      </div>

      <!-- Icon -->
      <component
        :is="format.icon"
        :class="[
          'h-8 w-8',
          modelValue === format.id
            ? 'text-primary-600'
            : 'text-gray-500 dark:text-gray-400'
        ]"
      />

      <!-- Label -->
      <div class="text-center">
        <h3
          :class="[
            'font-semibold',
            modelValue === format.id
              ? 'text-primary-600'
              : 'text-gray-900 dark:text-white'
          ]"
        >
          {{ format.label }}
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ format.extension }}
        </p>
      </div>
    </button>
  </div>

  <!-- Format Description -->
  <div
    v-if="modelValue"
    class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
  >
    <p class="text-sm text-gray-600 dark:text-gray-400">
      {{ getFormatInfo(modelValue).description }}
    </p>
  </div>
</template>
