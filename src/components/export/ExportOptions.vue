<script setup lang="ts">
import { ChevronDown, ChevronRight, Settings2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'
import type { ExportFormat } from '@/types'

const props = defineProps<{
  format: ExportFormat
}>()

const { t } = useI18n()
const settingsStore = useSettingsStore()
const { exportPreferences } = storeToRefs(settingsStore)

const isExpanded = ref(false)

// Markdown presets available
const markdownPresets = [
  { value: 'default', label: t('export.options.preset_default') },
  { value: 'minimal', label: t('export.options.preset_minimal') },
  { value: 'obsidian', label: t('export.options.preset_obsidian') },
  { value: 'notion', label: t('export.options.preset_notion') },
  { value: 'academic', label: t('export.options.preset_academic') },
  { value: 'compact', label: t('export.options.preset_compact') },
  { value: 'verbose', label: t('export.options.preset_verbose') }
]

// Folder structures
const folderStructures = [
  { value: 'flat', label: t('export.options.folder_flat') },
  { value: 'by-book', label: t('export.options.folder_by_book') },
  { value: 'by-author', label: t('export.options.folder_by_author') },
  { value: 'by-author-book', label: t('export.options.folder_by_author_book') }
]

// Note granularity options
const noteGranularities = [
  { value: 'per-clipping', label: t('export.options.granularity_per_clipping') },
  { value: 'per-book', label: t('export.options.granularity_per_book') }
]

// Show options based on format
const showMarkdownPreset = computed(() => ['markdown', 'obsidian', 'joplin'].includes(props.format))
const showFolderStructure = computed(() => ['obsidian', 'joplin'].includes(props.format))
const showGranularity = computed(() => ['obsidian', 'joplin'].includes(props.format))

const updatePreference = <K extends keyof typeof exportPreferences.value>(
  key: K,
  value: typeof exportPreferences.value[K]
) => {
  settingsStore.updateExportPreferences({ [key]: value })
}
</script>

<template>
  <div class="mb-6">
    <!-- Collapsible Header -->
    <button
      type="button"
      class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <Settings2 class="h-5 w-5 text-gray-500" aria-hidden="true" />
        <span class="font-medium">{{ t('export.options.title') }}</span>
      </div>
      <component
        :is="isExpanded ? ChevronDown : ChevronRight"
        class="h-5 w-5 text-gray-400"
        aria-hidden="true"
      />
    </button>

    <!-- Options Panel -->
    <div
      v-if="isExpanded"
      class="mt-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4"
    >
      <!-- Markdown Preset (for markdown-based formats) -->
      <div v-if="showMarkdownPreset" class="flex items-center justify-between">
        <div>
          <label for="markdown-preset" class="font-medium text-sm">
            {{ t('export.options.markdown_preset') }}
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('export.options.markdown_preset_desc') }}
          </p>
        </div>
        <select
          id="markdown-preset"
          :value="exportPreferences.markdownPreset"
          class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
          @change="updatePreference('markdownPreset', ($event.target as HTMLSelectElement).value as typeof exportPreferences.markdownPreset)"
        >
          <option v-for="preset in markdownPresets" :key="preset.value" :value="preset.value">
            {{ preset.label }}
          </option>
        </select>
      </div>

      <!-- Folder Structure (for Obsidian/Joplin) -->
      <div v-if="showFolderStructure" class="flex items-center justify-between">
        <div>
          <label for="folder-structure" class="font-medium text-sm">
            {{ t('export.options.folder_structure') }}
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('export.options.folder_structure_desc') }}
          </p>
        </div>
        <select
          id="folder-structure"
          :value="exportPreferences.folderStructure"
          class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
          @change="updatePreference('folderStructure', ($event.target as HTMLSelectElement).value as typeof exportPreferences.folderStructure)"
        >
          <option v-for="structure in folderStructures" :key="structure.value" :value="structure.value">
            {{ structure.label }}
          </option>
        </select>
      </div>

      <!-- Note Granularity (for Obsidian/Joplin) -->
      <div v-if="showGranularity" class="flex items-center justify-between">
        <div>
          <label for="note-granularity" class="font-medium text-sm">
            {{ t('export.options.note_granularity') }}
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('export.options.note_granularity_desc') }}
          </p>
        </div>
        <select
          id="note-granularity"
          :value="exportPreferences.noteGranularity"
          class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
          @change="updatePreference('noteGranularity', ($event.target as HTMLSelectElement).value as typeof exportPreferences.noteGranularity)"
        >
          <option v-for="granularity in noteGranularities" :key="granularity.value" :value="granularity.value">
            {{ granularity.label }}
          </option>
        </select>
      </div>

      <!-- Include Stats -->
      <div class="flex items-center justify-between">
        <div>
          <label for="include-stats" class="font-medium text-sm">
            {{ t('export.options.include_stats') }}
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('export.options.include_stats_desc') }}
          </p>
        </div>
        <button
          id="include-stats"
          type="button"
          role="switch"
          :aria-checked="exportPreferences.includeStats"
          :class="[
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            exportPreferences.includeStats ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          ]"
          @click="updatePreference('includeStats', !exportPreferences.includeStats)"
        >
          <span
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              exportPreferences.includeStats ? 'translate-x-5' : 'translate-x-0'
            ]"
          ></span>
        </button>
      </div>

      <!-- Include Tags -->
      <div class="flex items-center justify-between">
        <div>
          <label for="include-tags" class="font-medium text-sm">
            {{ t('export.options.include_tags') }}
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('export.options.include_tags_desc') }}
          </p>
        </div>
        <button
          id="include-tags"
          type="button"
          role="switch"
          :aria-checked="exportPreferences.includeTags"
          :class="[
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            exportPreferences.includeTags ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          ]"
          @click="updatePreference('includeTags', !exportPreferences.includeTags)"
        >
          <span
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              exportPreferences.includeTags ? 'translate-x-5' : 'translate-x-0'
            ]"
          ></span>
        </button>
      </div>

      <!-- Group By Book -->
      <div class="flex items-center justify-between">
        <div>
          <label for="group-by-book" class="font-medium text-sm">
            {{ t('settings.group_by_book') }}
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ t('export.options.group_by_book_desc') }}
          </p>
        </div>
        <button
          id="group-by-book"
          type="button"
          role="switch"
          :aria-checked="exportPreferences.groupByBook"
          :class="[
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            exportPreferences.groupByBook ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          ]"
          @click="updatePreference('groupByBook', !exportPreferences.groupByBook)"
        >
          <span
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              exportPreferences.groupByBook ? 'translate-x-5' : 'translate-x-0'
            ]"
          ></span>
        </button>
      </div>
    </div>
  </div>
</template>
