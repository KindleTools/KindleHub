<script setup lang="ts">
/**
 * DataTable Component - Editable table for clippings.
 */
import { computed, watch, onMounted } from 'vue'
import { Trash2, Copy, Plus, Check, X, Edit3 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

import type { StoredClipping } from '@/db/schema'
import { useDataEditor, type EditableClipping } from '@/composables/useDataEditor'
import UiTooltip from '@/components/ui/Tooltip.vue'

const { t } = useI18n()

const props = defineProps<{
  clippings: StoredClipping[]
  bookId?: number
}>()

const emit = defineEmits<{
  refresh: []
}>()

const {
  editableClippings,
  selectAll,
  isSaving,
  hasSelection,
  selectedCount,
  initializeClippings,
  toggleSelectAll,
  toggleSelect,
  startEdit,
  cancelEdit,
  saveEdit,
  deleteSelected,
  duplicateSelected,
  addClipping
} = useDataEditor({
  clippings: computed(() => props.clippings),
  onUpdate: async () => emit('refresh')
})

// Initialize and watch for changes
onMounted(() => initializeClippings(props.clippings))
watch(() => props.clippings, initializeClippings)

function formatDate(date: Date): string {
  // Use date-fns or native Intl with proper locale if available globally,
  // focusing on translation now:
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'highlight':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'note':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'bookmark':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

function handleKeydown(event: KeyboardEvent, clipping: EditableClipping) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (clipping.id) saveEdit(clipping.id)
  } else if (event.key === 'Escape') {
    cancelEdit()
  }
}

async function handleAdd() {
  if (props.bookId) {
    await addClipping(props.bookId)
  }
}

async function handleDelete() {
  if (confirm(t('datatable.delete_confirm', { count: selectedCount.value }))) {
    await deleteSelected()
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          :checked="selectAll"
          :title="$t('datatable.select_all')"
          class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
          @change="toggleSelectAll"
        />
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('datatable.selected', { count: selectedCount }) }}
        </span>
      </div>

      <div class="flex gap-2 ml-auto">
        <button
          v-if="bookId"
          :disabled="isSaving"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 transition-colors"
          @click="handleAdd"
        >
          <Plus class="w-4 h-4" />
          {{ $t('datatable.add') }}
        </button>

        <button
          v-if="hasSelection"
          :disabled="isSaving"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 transition-colors"
          @click="duplicateSelected"
        >
          <Copy class="w-4 h-4" />
          {{ $t('datatable.duplicate') }}
        </button>

        <button
          v-if="hasSelection"
          :disabled="isSaving"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
          @click="handleDelete"
        >
          <Trash2 class="w-4 h-4" />
          {{ $t('datatable.delete') }}
        </button>
      </div>
    </div>

    <!-- Mobile Cards View -->
    <TransitionGroup
      tag="div"
      name="card-list"
      class="md:hidden space-y-3"
    >
      <div
        v-for="clipping in editableClippings"
        :key="'mobile-' + clipping.id"
        :class="[
          clipping.isSelected ? 'ring-2 ring-primary-500' : '',
          clipping.isEditing ? 'ring-2 ring-blue-500' : ''
        ]"
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3 transition-all duration-200"
      >
        <!-- Header: Checkbox + Type + Actions -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              :checked="clipping.isSelected"
              title="Select clipping"
              class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600"
              @change="toggleSelect(clipping.id!)"
            />
            <template v-if="clipping.isEditing">
              <select
                v-model="clipping.type"
                class="text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="highlight">{{ $t('clipping.highlight') }}</option>
                <option value="note">{{ $t('clipping.note') }}</option>
                <option value="bookmark">{{ $t('clipping.bookmark') }}</option>
              </select>
            </template>
            <template v-else>
              <span
                :class="getTypeColor(clipping.type)"
                class="px-2 py-0.5 text-xs font-medium rounded-full capitalize"
              >
                {{ clipping.type }}
              </span>
            </template>
          </div>
          <div class="flex items-center gap-1">
            <template v-if="clipping.isEditing">
              <button
                :disabled="isSaving"
                class="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md"
                :aria-label="$t('common.save')"
                @click="saveEdit(clipping.id!)"
              >
                <Check class="w-5 h-5" />
              </button>
              <button
                class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md"
                :aria-label="$t('common.cancel')"
                @click="cancelEdit"
              >
                <X class="w-5 h-5" />
              </button>
            </template>
            <template v-else>
              <button
                class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                :aria-label="$t('common.edit')"
                @click="startEdit(clipping.id!)"
              >
                <Edit3 class="w-5 h-5" />
              </button>
            </template>
          </div>
        </div>

        <!-- Content -->
        <div>
          <template v-if="clipping.isEditing">
            <textarea
              v-model="clipping.content"
              rows="4"
              class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              :placeholder="$t('datatable.placeholder_content')"
              @keydown="handleKeydown($event, clipping)"
            ></textarea>
          </template>
          <template v-else>
            <p class="text-sm text-gray-900 dark:text-gray-100">
              {{ clipping.content || $t('datatable.empty') }}
            </p>
          </template>
        </div>

        <!-- Footer: Location + Date -->
        <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
          <template v-if="clipping.isEditing">
            <input
              v-model="clipping.location"
              type="text"
              class="w-28 text-xs rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              :placeholder="$t('datatable.location')"
            />
          </template>
          <template v-else>
            <span>{{ clipping.location || (clipping.page ? `${$t('datatable.page_prefix')} ${clipping.page}` : '-') }}</span>
          </template>
          <span>{{ formatDate(clipping.date) }}</span>
        </div>
      </div>

      <!-- Empty state mobile -->
      <div v-if="editableClippings.length === 0" key="empty-mobile" class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <p class="text-gray-500 dark:text-gray-400">{{ $t('datatable.empty') }}</p>
      </div>
    </TransitionGroup>

    <!-- Desktop Table View -->
    <div class="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th class="w-12 px-4 py-3"></th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ $t('datatable.type') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ $t('datatable.content') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ $t('datatable.location') }}
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {{ $t('datatable.date') }}
            </th>
            <th class="w-24 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="clipping in editableClippings"
            :key="clipping.id"
            :class="[
              clipping.isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : '',
              clipping.isEditing ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            ]"
            class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <!-- Checkbox -->
            <td class="px-4 py-3">
              <input
                type="checkbox"
                :checked="clipping.isSelected"
                title="Select clipping"
                class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                @change="toggleSelect(clipping.id!)"
              />
            </td>

            <!-- Type -->
            <td class="px-4 py-3">
              <template v-if="clipping.isEditing">
                <select
                  v-model="clipping.type"
                  class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="highlight">{{ $t('clipping.highlight') }}</option>
                  <option value="note">{{ $t('clipping.note') }}</option>
                  <option value="bookmark">{{ $t('clipping.bookmark') }}</option>
                </select>
              </template>
              <template v-else>
                <span
                  :class="getTypeColor(clipping.type)"
                  class="inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize"
                >
                  {{ clipping.type }}
                </span>
              </template>
            </td>

            <!-- Content -->
            <td class="px-4 py-3 max-w-md">
              <template v-if="clipping.isEditing">
                <textarea
                  v-model="clipping.content"
                  rows="3"
                  class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
                  :placeholder="$t('datatable.placeholder_content')"
                  @keydown="handleKeydown($event, clipping)"
                ></textarea>
              </template>
              <template v-else>
                <p class="text-sm text-gray-900 dark:text-gray-100 line-clamp-3">
                  {{ clipping.content || '(vacío)' }}
                </p>
              </template>
            </td>

            <!-- Location -->
            <td class="px-4 py-3 whitespace-nowrap">
              <template v-if="clipping.isEditing">
                <input
                  v-model="clipping.location"
                  type="text"
                  class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
                  :placeholder="$t('datatable.placeholder_location')"
                />
              </template>
              <template v-else>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ clipping.location || clipping.page ? `${$t('datatable.page_prefix')} ${clipping.page}` : '-' }}
                </span>
              </template>
            </td>

            <!-- Date -->
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(clipping.date) }}
            </td>

            <!-- Actions -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-1 justify-end">
                <template v-if="clipping.isEditing">
                  <UiTooltip :text="$t('datatable.save_tooltip')" position="top">
                    <button
                      :disabled="isSaving"
                      class="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md transition-colors"
                      :aria-label="$t('common.save')"
                      @click="saveEdit(clipping.id!)"
                    >
                      <Check class="w-4 h-4" />
                    </button>
                  </UiTooltip>
                  <UiTooltip :text="$t('datatable.cancel_tooltip')" position="top">
                    <button
                      class="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                      :aria-label="$t('common.cancel')"
                      @click="cancelEdit"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </UiTooltip>
                </template>
                <template v-else>
                  <UiTooltip :text="$t('datatable.edit_tooltip')" position="top">
                    <button
                      class="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      :aria-label="$t('common.edit')"
                      @click="startEdit(clipping.id!)"
                    >
                      <Edit3 class="w-4 h-4" />
                    </button>
                  </UiTooltip>
                </template>
              </div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="editableClippings.length === 0">
            <td colspan="6" class="px-4 py-12 text-center">
              <p class="text-gray-500 dark:text-gray-400">
                {{ $t('datatable.empty') }}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Card list animations */
.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.25s ease;
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.card-list-move {
  transition: transform 0.25s ease;
}
</style>
