<script setup lang="ts">
import { computed, ref } from 'vue'
import { Trash2, X, UserPen, BookOpen } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useBatchesStore } from '@/stores/batches'

const { t } = useI18n()
const batchesStore = useBatchesStore()

// Modal state
const showEditModal = ref(false)
const editType = ref<'author' | 'title'>('author')
const editValue = ref('')

const openEditModal = (type: 'author' | 'title') => {
  editType.value = type
  // Pre-fill with the first selected clipping's value
  const firstSelected = batchesStore.selectedClippings[0]
  if (firstSelected) {
    editValue.value = type === 'author' ? firstSelected.author : firstSelected.title
  }
  showEditModal.value = true
}

const applyBulkEdit = () => {
  const ids = batchesStore.selectedClippings.map((c) => c.batchClippingId)
  const updates = editType.value === 'author'
    ? { author: editValue.value }
    : { title: editValue.value }
  batchesStore.bulkUpdateClippings(ids, updates)
  showEditModal.value = false
  editValue.value = ''
  batchesStore.deselectAll()
}

const cancelEdit = () => {
  showEditModal.value = false
  editValue.value = ''
}

const actions = computed(() => [
  {
    id: 'author',
    label: t('batch.change_author'),
    icon: UserPen,
    variant: '',
    action: () => openEditModal('author'),
    disabled: computed(() => batchesStore.selectionCount === 0)
  },
  {
    id: 'title',
    label: t('batch.change_title'),
    icon: BookOpen,
    variant: '',
    action: () => openEditModal('title'),
    disabled: computed(() => batchesStore.selectionCount === 0)
  },
  {
    id: 'delete',
    label: t('batch.delete'),
    icon: Trash2,
    variant: 'danger',
    action: () => {
      const ids = batchesStore.selectedClippings.map((c) => c.batchClippingId)
      batchesStore.deleteClippings(ids)
      batchesStore.deselectAll()
    },
    disabled: computed(() => batchesStore.selectionCount === 0)
  }
])
</script>

<template>
  <div
    v-if="batchesStore.selectionCount > 0"
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200"
  >
    <div class="flex items-center gap-2 pr-4 border-r border-gray-200 dark:border-gray-700">
      <span class="font-bold text-primary-600">{{ batchesStore.selectionCount }}</span>
      <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('batch.selected') }}</span>
    </div>

    <div class="flex items-center gap-2">
      <button
        v-for="action in actions"
        :key="action.id"
        class="btn-sm flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg"
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
        :title="$t('batch.clear_selection')"
        :aria-label="$t('batch.clear_selection')"
        @click="batchesStore.deselectAll"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  </div>

  <!-- Edit Modal -->
  <Teleport to="body">
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="cancelEdit"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <h3 class="text-lg font-semibold mb-4">
          {{ editType === 'author' ? $t('batch.modal_author_title') : $t('batch.modal_title_title') }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {{ $t('batch.modal_desc', { count: batchesStore.selectionCount }) }}
        </p>
        <input
          v-model="editValue"
          type="text"
          class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-primary-500 focus:ring-primary-500"
          :placeholder="editType === 'author' ? $t('batch.placeholder_author') : $t('batch.placeholder_title')"
          @keyup.enter="applyBulkEdit"
        />
        <div class="flex justify-end gap-3 mt-6">
          <button
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
            @click="cancelEdit"
          >
            {{ $t('batch.cancel') }}
          </button>
          <button
            class="btn-primary px-4 py-2"
            :disabled="!editValue.trim()"
            @click="applyBulkEdit"
          >
            {{ $t('batch.apply', { count: batchesStore.selectionCount }) }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
