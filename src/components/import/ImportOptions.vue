<script setup lang="ts">
import { ChevronDown, ChevronRight, Settings2 } from 'lucide-vue-next'
import { useSettingsStore, type SupportedParsingLanguage } from '@/stores/settings'

const settingsStore = useSettingsStore()
const { importPreferences } = storeToRefs(settingsStore)

const isExpanded = ref(false)
const showAdvanced = ref(false)

const languages: { value: SupportedParsingLanguage, label: string }[] = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'it', label: 'Italiano' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'ru', label: 'Русский' }
]

const updatePreference = <K extends keyof typeof importPreferences.value>(
  key: K,
  value: typeof importPreferences.value[K]
) => {
  settingsStore.updateImportPreferences({ [key]: value })
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
        <span class="font-medium">{{ $t('import.options.title') }}</span>
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
      <!-- Language Selector -->
      <div class="flex items-center justify-between">
        <div>
          <label for="parsing-language" class="font-medium text-sm">
            {{ $t('import.options.language') }}
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t('import.options.language_desc') }}
          </p>
        </div>
        <select
          id="parsing-language"
          :value="importPreferences.language"
          class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"
          @change="updatePreference('language', ($event.target as HTMLSelectElement).value as SupportedParsingLanguage)"
        >
          <option v-for="lang in languages" :key="lang.value" :value="lang.value">
            {{ lang.label }}
          </option>
        </select>
      </div>

      <!-- Merge Overlapping -->
      <div class="flex items-center justify-between">
        <div>
          <label for="merge-overlapping" class="font-medium text-sm">
            {{ $t('import.options.merge_overlapping') }}
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t('import.options.merge_overlapping_desc') }}
          </p>
        </div>
        <button
          id="merge-overlapping"
          type="button"
          role="switch"
          :aria-checked="importPreferences.mergeOverlapping"
          :class="[
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            importPreferences.mergeOverlapping ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          ]"
          @click="updatePreference('mergeOverlapping', !importPreferences.mergeOverlapping)"
        >
          <span
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              importPreferences.mergeOverlapping ? 'translate-x-5' : 'translate-x-0'
            ]"
          ></span>
        </button>
      </div>

      <!-- Extract Tags -->
      <div class="flex items-center justify-between">
        <div>
          <label for="extract-tags" class="font-medium text-sm">
            {{ $t('import.options.extract_tags') }}
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t('import.options.extract_tags_desc') }}
          </p>
        </div>
        <button
          id="extract-tags"
          type="button"
          role="switch"
          :aria-checked="importPreferences.extractTags"
          :class="[
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            importPreferences.extractTags ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          ]"
          @click="updatePreference('extractTags', !importPreferences.extractTags)"
        >
          <span
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              importPreferences.extractTags ? 'translate-x-5' : 'translate-x-0'
            ]"
          ></span>
        </button>
      </div>

      <!-- Highlights Only -->
      <div class="flex items-center justify-between">
        <div>
          <label for="highlights-only" class="font-medium text-sm">
            {{ $t('import.options.highlights_only') }}
          </label>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t('import.options.highlights_only_desc') }}
          </p>
        </div>
        <button
          id="highlights-only"
          type="button"
          role="switch"
          :aria-checked="importPreferences.highlightsOnly"
          :class="[
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            importPreferences.highlightsOnly ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
          ]"
          @click="updatePreference('highlightsOnly', !importPreferences.highlightsOnly)"
        >
          <span
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              importPreferences.highlightsOnly ? 'translate-x-5' : 'translate-x-0'
            ]"
          ></span>
        </button>
      </div>

      <!-- Advanced Options Toggle -->
      <button
        type="button"
        class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        @click="showAdvanced = !showAdvanced"
      >
        {{ showAdvanced ? $t('import.options.hide_advanced') : $t('import.options.show_advanced') }}
      </button>

      <!-- Advanced Options -->
      <div v-if="showAdvanced" class="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-4">
        <!-- Remove Unlinked Notes -->
        <div class="flex items-center justify-between">
          <div>
            <label for="remove-unlinked" class="font-medium text-sm">
              {{ $t('import.options.remove_unlinked') }}
            </label>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ $t('import.options.remove_unlinked_desc') }}
            </p>
          </div>
          <button
            id="remove-unlinked"
            type="button"
            role="switch"
            :aria-checked="importPreferences.removeUnlinkedNotes"
            :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              importPreferences.removeUnlinkedNotes ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
            ]"
            @click="updatePreference('removeUnlinkedNotes', !importPreferences.removeUnlinkedNotes)"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                importPreferences.removeUnlinkedNotes ? 'translate-x-5' : 'translate-x-0'
              ]"
            ></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
