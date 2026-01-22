<script setup lang="ts">
import { computed } from 'vue'
import { Trash2, X } from 'lucide-vue-next'
import { useBatchesStore } from '@/stores/batches'

const batchesStore = useBatchesStore()

const actions = [
  {
    id: 'delete',
    label: 'Delete Selected',
    icon: Trash2,
    variant: 'danger',
    action: () => {
      const ids = batchesStore.selectedClippings.map((c) => c.batchClippingId)
      batchesStore.deleteClippings(ids)
      batchesStore.deselectAll()
    },
    disabled: computed(() => batchesStore.selectionCount === 0)
  }
  // Future actions: Change Author, Change Book Title...
]
</script>

<template>
  <div
    v-if="batchesStore.selectionCount > 0"
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200"
  >
    <div class="flex items-center gap-2 pr-4 border-r border-gray-200 dark:border-gray-700">
      <span class="font-bold text-primary-600">{{ batchesStore.selectionCount }}</span>
      <span class="text-sm text-gray-600 dark:text-gray-400">selected</span>
    </div>

    <div class="flex items-center gap-2">
      <button
        v-for="action in actions"
        :key="action.id"
        class="btn-sm flex items-center gap-2 text-sm font-medium transition-colors"
        :class="{
          'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20': action.variant === 'danger',
          'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700': !action.variant
        }"
        :disabled="action.disabled.value"
        @click="action.action"
      >
        <component :is="action.icon" class="h-4 w-4" />
        {{ action.label }}
      </button>
    </div>

    <div class="pl-4 border-l border-gray-200 dark:border-gray-700">
      <button
        class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-gray-600"
        title="Clear selection"
        @click="batchesStore.deselectAll"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
