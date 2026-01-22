<script setup lang="ts">
/**
 * Skeleton - Reusable loading placeholder component.
 */
interface Props {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string
  height?: string
  lines?: number
}

withDefaults(defineProps<Props>(), {
  variant: 'text',
  width: '100%',
  height: 'auto',
  lines: 1
})

const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700'

const variantClasses = {
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-none',
  rounded: 'rounded-lg'
}
</script>

<template>
  <div v-if="lines > 1" class="space-y-2">
    <div
      v-for="i in lines"
      :key="i"
      :class="[baseClasses, variantClasses[variant]]"
      :style="{
        width: i === lines ? '75%' : width,
        height: variant === 'text' ? '1em' : height
      }"
    ></div>
  </div>
  <div
    v-else
    :class="[baseClasses, variantClasses[variant]]"
    :style="{
      width,
      height: variant === 'text' ? '1em' : height,
      aspectRatio: variant === 'circular' ? '1' : undefined
    }"
  ></div>
</template>
