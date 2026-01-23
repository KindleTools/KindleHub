<script setup lang="ts">
/**
 * DataTable Component - Editable table for clippings.
 */
import { computed, watch, onMounted, ref, onUnmounted } from 'vue'
import { Trash2, Copy, Plus, Check, X, Edit3, Minimize2, Maximize2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { useLocalStorage } from '@vueuse/core'

import type { StoredClipping } from '@/db/schema'
import { useDataEditor, type EditableClipping } from '@/composables/useDataEditor'
import UiTooltip from '@/components/ui/Tooltip.vue'

const { t } = useI18n()

// View Settings
const density = useLocalStorage<'comfortable' | 'compact'>('datatable-density', 'comfortable')
const visibleColumns = useLocalStorage<string[]>('datatable-columns', ['type', 'content', 'location', 'date'])

const toggleColumn = (col: string) => {
  if (visibleColumns.value.includes(col)) {
    visibleColumns.value = visibleColumns.value.filter((c) => c !== col)
  } else {
    visibleColumns.value.push(col)
  }
}

const toggleDensity = () => {
  density.value = density.value === 'comfortable' ? 'compact' : 'comfortable'
}

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

// Responsive Logic
const isDesktop = ref(window.innerWidth >= 768)
const handleResize = () => {
  isDesktop.value = window.innerWidth >= 768
}
onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))

// Virtualization Refs
const desktopParentRef = ref<HTMLElement | null>(null)
const mobileParentRef = ref<HTMLElement | null>(null)

// Desktop Virtualizer
const desktopRowVirtualizer = useVirtualizer(computed(() => ({
  count: editableClippings.value.length,
  getScrollElement: () => desktopParentRef.value,
  estimateSize: () => density.value === 'compact' ? 40 : 53, // Approximate row height
  overscan: 10
})))
const desktopVirtualRows = computed(() => desktopRowVirtualizer.value.getVirtualItems())
const desktopTotalSize = computed(() => desktopRowVirtualizer.value.getTotalSize())

// Mobile Virtualizer
const mobileRowVirtualizer = useVirtualizer(computed(() => ({
  count: editableClippings.value.length,
  getScrollElement: () => mobileParentRef.value,
  estimateSize: () => 200, // Approximate card height
  overscan: 5
})))
const mobileVirtualRows = computed(() => mobileRowVirtualizer.value.getVirtualItems())
const mobileTotalSize = computed(() => mobileRowVirtualizer.value.getTotalSize())

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

function formatLocation(location: string | object | undefined | null): string {
  if (!location) return ''
  if (typeof location === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (location as any).raw || JSON.stringify(location)
  }
  return String(location)
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

function getClipping(index: number) {
  return editableClippings.value[index]!
}

async function handleDelete() {
  if (confirm(t('datatable.delete_confirm', { count: selectedCount.value }))) {
    await deleteSelected()
  }
}
</script>

<template>
  <div class="h-full flex flex-col space-y-4 overflow-hidden">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow shrink-0">
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

        <div class="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

        <!-- Density Toggle -->
        <UiTooltip :text="density === 'comfortable' ? 'Compact view' : 'Comfortable view'" position="top">
          <button
            class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            @click="toggleDensity"
          >
            <Minimize2 v-if="density === 'comfortable'" class="w-4 h-4" />
            <Maximize2 v-else class="w-4 h-4" />
          </button>
        </UiTooltip>

        <!-- Column Visibility (Simple Toggle for now) -->
        <div class="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-1">
          <button
            v-for="col in ['type', 'content', 'location', 'date']"
            :key="col"
            class="px-2 py-0.5 text-xs rounded-md transition-colors capitalize"
            :class="visibleColumns.includes(col) ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'"
            @click="toggleColumn(col)"
          >
            {{ col }}
          </button>
        </div>
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

    <!-- Mobile Cards View (Virtualized) -->
    <div
      v-if="!isDesktop"
      ref="mobileParentRef"
      class="flex-1 overflow-y-auto"
    >
      <div
        class="relative w-full"
        :style="{ height: `${mobileTotalSize}px` }"
      >
        <div
          v-for="virtualRow in mobileVirtualRows"
          :key="virtualRow.index"
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`
          }"
          class="p-1"
        >
          <div
            v-if="getClipping(virtualRow.index)"
            :class="[
              getClipping(virtualRow.index).isSelected ? 'ring-2 ring-primary-500' : '',
              getClipping(virtualRow.index).isEditing ? 'ring-2 ring-blue-500' : ''
            ]"
            class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3 h-full"
          >
            <!-- Header: Checkbox + Type + Actions -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  :checked="getClipping(virtualRow.index).isSelected"
                  :title="$t('datatable.select_clipping')"
                  class="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600"
                  @change="toggleSelect(getClipping(virtualRow.index).id!)"
                />
                <template v-if="getClipping(virtualRow.index).isEditing">
                  <select
                    v-model="getClipping(virtualRow.index).type"
                    class="text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <option value="highlight">{{ $t('clipping.highlight') }}</option>
                    <option value="note">{{ $t('clipping.note') }}</option>
                    <option value="bookmark">{{ $t('clipping.bookmark') }}</option>
                  </select>
                </template>
                <template v-else>
                  <span
                    :class="getTypeColor(getClipping(virtualRow.index).type)"
                    class="px-2 py-0.5 text-xs font-medium rounded-full capitalize"
                  >
                    {{ getClipping(virtualRow.index).type }}
                  </span>
                </template>
              </div>
              <div class="flex items-center gap-1">
                <template v-if="getClipping(virtualRow.index).isEditing">
                  <button
                    :disabled="isSaving"
                    class="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md"
                    :aria-label="$t('common.save')"
                    @click="saveEdit(getClipping(virtualRow.index).id!)"
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
                    @click="startEdit(getClipping(virtualRow.index).id!)"
                  >
                    <Edit3 class="w-5 h-5" />
                  </button>
                </template>
              </div>
            </div>

            <!-- Content -->
            <div>
              <template v-if="getClipping(virtualRow.index).isEditing">
                <textarea
                  v-model="getClipping(virtualRow.index).content"
                  rows="4"
                  class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  :placeholder="$t('datatable.placeholder_content')"
                  @keydown="handleKeydown($event, getClipping(virtualRow.index))"
                ></textarea>
              </template>
              <template v-else>
                <p class="text-sm text-gray-900 dark:text-gray-100">
                  {{ getClipping(virtualRow.index).content || $t('datatable.empty') }}
                </p>
              </template>
            </div>

            <!-- Footer: Location + Date -->
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
              <template v-if="getClipping(virtualRow.index).isEditing">
                <input
                  v-model="getClipping(virtualRow.index).location"
                  type="text"
                  class="w-28 text-xs rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  :placeholder="$t('datatable.location')"
                />
              </template>
              <template v-else>
                <span>{{ formatLocation(getClipping(virtualRow.index).location) || (getClipping(virtualRow.index).page ? `${$t('datatable.page_prefix')} ${getClipping(virtualRow.index).page}` : '-') }}</span>
              </template>
              <span>{{ formatDate(getClipping(virtualRow.index).date) }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Empty State -->
      <div v-if="editableClippings.length === 0" class="flex items-center justify-center h-48">
        <p class="text-gray-500 dark:text-gray-400">{{ $t('datatable.empty') }}</p>
      </div>
    </div>

    <!-- Desktop Table View (Virtualized) -->
    <div
      v-else
      ref="desktopParentRef"
      class="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow"
    >
      <div
        class="relative w-full"
        :style="{ height: `${desktopTotalSize}px` }"
      >
        <table class="w-full relative">
          <thead class="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
            <tr>
              <th class="w-12 px-4 bg-gray-50 dark:bg-gray-700/50" :class="density === 'compact' ? 'py-2' : 'py-3'"></th>
              <th
                v-if="visibleColumns.includes('type')"
                class="px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50"
                :class="density === 'compact' ? 'py-2' : 'py-3'"
              >
                {{ $t('datatable.type') }}
              </th>
              <th
                v-if="visibleColumns.includes('content')"
                class="px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50"
                :class="density === 'compact' ? 'py-2' : 'py-3'"
              >
                {{ $t('datatable.content') }}
              </th>
              <th
                v-if="visibleColumns.includes('location')"
                class="px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50"
                :class="density === 'compact' ? 'py-2' : 'py-3'"
              >
                {{ $t('datatable.location') }}
              </th>
              <th
                v-if="visibleColumns.includes('date')"
                class="px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50"
                :class="density === 'compact' ? 'py-2' : 'py-3'"
              >
                {{ $t('datatable.date') }}
              </th>
              <th class="w-24 px-4 bg-gray-50 dark:bg-gray-700/50" :class="density === 'compact' ? 'py-2' : 'py-3'"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="virtualRow in desktopVirtualRows"
              :key="virtualRow.index"
              :style="{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start - (desktopRowVirtualizer.scrollOffset || 0)}px)`
              }"
              :class="[
                getClipping(virtualRow.index).isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : '',
                getClipping(virtualRow.index).isEditing ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              ]"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors absolute w-full flex items-center"
            >
              <!-- Manual Flex Layout for Table Rows to support absolute positioning -->
              <td class="w-12 px-4 flex-none" :class="density === 'compact' ? 'py-2' : 'py-3'">
                <input
                  type="checkbox"
                  :checked="getClipping(virtualRow.index).isSelected"
                  :title="$t('datatable.select_clipping')"
                  class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  @change="toggleSelect(getClipping(virtualRow.index).id!)"
                />
              </td>

              <!-- Type -->
              <td
                v-if="visibleColumns.includes('type')"
                class="flex-1 px-4 min-w-[120px]"
                :class="density === 'compact' ? 'py-2' : 'py-3'"
              >
                <template v-if="getClipping(virtualRow.index).isEditing">
                  <select
                    v-model="getClipping(virtualRow.index).type"
                    class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
                    :class="density === 'compact' ? 'py-1' : 'py-1.5'"
                  >
                    <option value="highlight">{{ $t('clipping.highlight') }}</option>
                    <option value="note">{{ $t('clipping.note') }}</option>
                    <option value="bookmark">{{ $t('clipping.bookmark') }}</option>
                  </select>
                </template>
                <template v-else>
                  <span
                    class="inline-block px-2 text-xs font-medium rounded-full capitalize"
                    :class="[
                      getTypeColor(getClipping(virtualRow.index).type),
                      density === 'compact' ? 'py-px' : 'py-0.5'
                    ]"
                  >
                    {{ getClipping(virtualRow.index).type }}
                  </span>
                </template>
              </td>

              <!-- Content -->
              <td
                v-if="visibleColumns.includes('content')"
                class="flex-[3] px-4 max-w-md"
                :class="density === 'compact' ? 'py-2' : 'py-3'"
              >
                <template v-if="getClipping(virtualRow.index).isEditing">
                  <textarea
                    v-model="getClipping(virtualRow.index).content"
                    :rows="density === 'compact' ? 1 : 2"
                    class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
                    :placeholder="$t('datatable.placeholder_content')"
                    @keydown="handleKeydown($event, getClipping(virtualRow.index))"
                  ></textarea>
                </template>
                <template v-else>
                  <p class="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                    {{ getClipping(virtualRow.index).content || $t('datatable.empty') }}
                  </p>
                </template>
              </td>

              <!-- Location -->
              <td
                v-if="visibleColumns.includes('location')"
                class="flex-1 px-4 whitespace-nowrap"
                :class="density === 'compact' ? 'py-2' : 'py-3'"
              >
                <template v-if="getClipping(virtualRow.index).isEditing">
                  <input
                    v-model="getClipping(virtualRow.index).location"
                    type="text"
                    class="w-full text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
                    :class="density === 'compact' ? 'py-1' : 'py-1.5'"
                    :placeholder="$t('datatable.placeholder_location')"
                  />
                </template>
                <template v-else>
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatLocation(getClipping(virtualRow.index).location) || (getClipping(virtualRow.index).page ? `${$t('datatable.page_prefix')} ${getClipping(virtualRow.index).page}` : '-') }}
                  </span>
                </template>
              </td>

              <!-- Date -->
              <td
                v-if="visibleColumns.includes('date')"
                class="flex-1 px-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                :class="density === 'compact' ? 'py-2' : 'py-3'"
              >
                {{ formatDate(getClipping(virtualRow.index).date) }}
              </td>

              <!-- Actions -->
              <td class="w-24 px-4 flex-none" :class="density === 'compact' ? 'py-2' : 'py-3'">
                <div class="flex items-center gap-1 justify-end">
                  <template v-if="getClipping(virtualRow.index).isEditing">
                    <UiTooltip :text="$t('datatable.save_tooltip')" position="top">
                      <button
                        :disabled="isSaving"
                        class="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md transition-colors"
                        :aria-label="$t('common.save')"
                        @click="saveEdit(getClipping(virtualRow.index).id!)"
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
                        @click="startEdit(getClipping(virtualRow.index).id!)"
                      >
                        <Edit3 class="w-4 h-4" />
                      </button>
                    </UiTooltip>
                  </template>
                </div>
              </td>
            </tr>
            <!-- Empty state done outside virtualizer loops usually, or conditional render -->
          </tbody>
        </table>
        <div v-if="editableClippings.length === 0" class="flex items-center justify-center h-48">
          <p class="text-gray-500 dark:text-gray-400">{{ $t('datatable.empty') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * We are simulating table with flex rows in the virtualized "desktop" view
 * to allow proper absolute positioning required by the virtualizer.
 * However, the header is real table.
 * To make it line up, we use fixed widths or flex-basis.
 * Simplified approach: Use `display: flex` on `tr` and set widths on `td`s.
 */
</style>
