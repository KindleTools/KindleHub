<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  value: number | string
  label: string
  icon?: Component
  color?: 'primary' | 'green' | 'purple' | 'amber'
}>()

const colorClasses = {
  primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
}
</script>

<template>
  <div class="card flex items-center gap-4">
    <div
      v-if="icon"
      :class="[
        'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
        colorClasses[color || 'primary']
      ]"
    >
      <component :is="icon" class="h-6 w-6" aria-hidden="true" />
    </div>
    <div class="min-w-0">
      <div class="text-2xl font-bold text-gray-900 dark:text-white truncate">
        {{ value }}
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400 truncate">
        {{ label }}
      </div>
    </div>
  </div>
</template>
