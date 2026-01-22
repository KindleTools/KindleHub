<script setup lang="ts">
import { ref, watch } from 'vue'
import { Highlighter, StickyNote, Bookmark, Edit2, AlertTriangle, Check } from 'lucide-vue-next'
import type { BatchClipping } from '@/types/batch'
import { useBatchesStore } from '@/stores/batches'

const props = defineProps<{
  clipping: BatchClipping
}>()

const batchesStore = useBatchesStore()
const isEditing = ref(false)
const editForm = ref({
  content: '',
  note: '',
  page: 0,
  location: ''
})

const initEdit = () => {
  editForm.value = {
    content: props.clipping.content,
    note: props.clipping.note || '',
    page: props.clipping.page || 0,
    // ensure location is string, even if source type is loose

    location: (typeof props.clipping.location === 'object'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (props.clipping.location as any)?.raw
      : props.clipping.location) || ''
  }
  isEditing.value = true
}

const saveEdit = () => {
  batchesStore.updateClipping(props.clipping.batchClippingId, {
    content: editForm.value.content,
    note: editForm.value.note || undefined, // undefined to avoid empty string if originally undefined
    page: editForm.value.page || null,
    // Cast to any to satisfy strict type check against library type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    location: (editForm.value.location || undefined) as any
  })
  isEditing.value = false
}

const cancelEdit = () => {
  isEditing.value = false
}

// Watch for external updates (unlikely but good practice)
watch(() => props.clipping, () => {
  if (isEditing.value) {
    // Optional: Warn user or update form? For now, we assume local edit state wins
  }
})

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'highlight': return Highlighter
    case 'note': return StickyNote
    case 'bookmark': return Bookmark
    default: return Highlighter
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'highlight': return 'text-yellow-500'
    case 'note': return 'text-blue-500'
    case 'bookmark': return 'text-gray-500'
    default: return 'text-gray-500'
  }
}

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return ''
  try {
    return new Date(date).toLocaleDateString()
  } catch {
    return ''
  }
}
</script>

<template>
  <div
    class="group relative border rounded-lg transition-all duration-200"
    :class="[
      clipping.isSelected
        ? 'bg-primary-50 border-primary-300 dark:bg-primary-900/10 dark:border-primary-700'
        : 'bg-white border-gray-100 hover:border-gray-200 dark:bg-gray-800 dark:border-gray-700/50 dark:hover:border-gray-600'
    ]"
  >
    <!-- View Mode -->
    <div v-if="!isEditing" class="p-4">
      <div class="flex items-start gap-4">
        <!-- Checkbox with larger hit area -->
        <div class="pt-1 flex-shrink-0">
          <input
            type="checkbox"
            :checked="clipping.isSelected"
            class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
            aria-label="Select"
            @change="batchesStore.toggleSelection(clipping.batchClippingId)"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0" @dblclick="initEdit">
          <div class="flex items-center gap-2 mb-2">
            <component
              :is="getTypeIcon(clipping.type)"
              class="h-4 w-4"
              :class="getTypeColor(clipping.type)"
            />
            <span class="text-xs uppercase font-medium text-gray-500 tracking-wide">
              {{ clipping.type }}
            </span>

            <!-- Metadata badges -->
            <span v-if="clipping.page" class="text-xs text-gray-400">
              Page {{ clipping.page }}
            </span>
            <span v-if="clipping.location" class="text-xs text-gray-400">
              Loc {{ clipping.location }}
            </span>

            <!-- Warning Badge -->
            <div v-if="clipping.warnings.length > 0" class="flex items-center gap-1 text-orange-500 text-xs bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">
              <AlertTriangle class="h-3 w-3" />
              <span>Checking needed</span>
            </div>

            <!-- Modified Badge -->
            <div v-if="clipping.isModified" class="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-1.5 py-0.5 rounded">
              Edited
            </div>

            <div class="flex-1"></div>

            <!-- Quick Actions -->
            <button
              class="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-primary-600 transition-all"
              title="Edit"
              aria-label="Edit clipping"
              @click="initEdit"
            >
              <Edit2 class="h-4 w-4" />
            </button>
          </div>

          <!-- Main Content -->
          <p class="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap font-serif text-lg">
            {{ clipping.content }}
          </p>

          <!-- User Note attached -->
          <div v-if="clipping.note" class="mt-3 pl-3 border-l-2 border-primary-300 dark:border-primary-700">
            <p class="text-sm text-gray-600 dark:text-gray-400 italic">
              <span class="font-medium not-italic mb-1 block text-xs text-gray-500">Note:</span>
              {{ clipping.note }}
            </p>
          </div>

          <div class="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <span>Added {{ formatDate(clipping.date) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Mode -->
    <div v-else class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-primary-500 z-10">
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase mb-1">Content</label>
          <textarea
            v-model="editForm.content"
            rows="4"
            class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:border-primary-500 focus:ring-primary-500"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase mb-1">Private Note</label>
          <textarea
            v-model="editForm.note"
            rows="2"
            class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Add a personal note..."
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase mb-1">Page</label>
            <input
              v-model.number="editForm.page"
              type="number"
              class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 uppercase mb-1">Location</label>
            <input
              v-model="editForm.location"
              type="text"
              class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <button
            class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded"
            @click="cancelEdit"
          >
            Cancel
          </button>
          <button
            class="btn-primary px-3 py-1.5 text-sm flex items-center gap-1"
            @click="saveEdit"
          >
            <Check class="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
