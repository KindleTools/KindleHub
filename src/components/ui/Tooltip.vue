<script setup lang="ts">
/**
 * Tooltip - Lightweight tooltip component using CSS only.
 * Wraps content and shows tooltip on hover.
 */
interface Props {
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

withDefaults(defineProps<Props>(), {
  position: 'top',
  delay: 200
})

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2'
}

const arrowClasses = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700 border-y-transparent border-l-transparent'
}
</script>

<template>
  <div class="relative inline-flex group">
    <slot></slot>
    <div
      role="tooltip"
      :class="[
        'absolute z-50 pointer-events-none',
        'opacity-0 group-hover:opacity-100',
        'transition-opacity duration-150',
        positionClasses[position]
      ]"
      :style="{ transitionDelay: `${delay}ms` }"
    >
      <div class="px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-md shadow-lg whitespace-nowrap">
        {{ text }}
      </div>
      <div
        :class="[
          'absolute w-0 h-0 border-4',
          arrowClasses[position]
        ]"
      ></div>
    </div>
  </div>
</template>
