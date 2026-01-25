/**
 * Settings Store - User preferences and configuration.
 */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { i18n, type SupportedLocale } from '@/plugins/i18n'

export interface ExportPreferences {
  defaultFormat: 'markdown' | 'json' | 'csv' | 'obsidian' | 'joplin' | 'html'
  includeMetadata: boolean
  groupByBook: boolean
  // Advanced export options
  markdownPreset: 'default' | 'minimal' | 'obsidian' | 'notion' | 'academic' | 'compact' | 'verbose'
  folderStructure: 'flat' | 'by-book' | 'by-author' | 'by-author-book'
  includeStats: boolean
  includeTags: boolean
  noteGranularity: 'per-clipping' | 'per-book'
}

export type SupportedParsingLanguage = 'auto' | 'en' | 'es' | 'pt' | 'de' | 'fr' | 'it' | 'zh' | 'ja' | 'ko' | 'nl' | 'ru'

export interface ImportPreferences {
  language: SupportedParsingLanguage
  mergeOverlapping: boolean
  extractTags: boolean
  highlightsOnly: boolean
  removeUnlinkedNotes: boolean
  tagCase: 'original' | 'uppercase' | 'lowercase' | 'title'
  discardExtractedNotes: boolean
}

export interface AppSettings {
  exportPreferences: ExportPreferences
  importPreferences: ImportPreferences
  language: SupportedLocale
}

const SETTINGS_KEY = 'kindlehub-settings'

const defaultSettings: AppSettings = {
  exportPreferences: {
    defaultFormat: 'markdown',
    includeMetadata: true,
    groupByBook: true,
    markdownPreset: 'default',
    folderStructure: 'by-author',
    includeStats: false,
    includeTags: true,
    noteGranularity: 'per-clipping'
  },
  importPreferences: {
    language: 'auto',
    mergeOverlapping: true,
    extractTags: false,
    highlightsOnly: false,
    removeUnlinkedNotes: false,
    tagCase: 'original',
    discardExtractedNotes: false
  },
  // Default fallback if logic fails or first run (though i18n logic handles first run)
  language: 'en'
}

export const useSettingsStore = defineStore('settings', () => {
  // Load settings from localStorage
  const savedSettings = localStorage.getItem(SETTINGS_KEY)

  // If no saved settings, we want to respect what i18n detected (browser lang)
  // i18n.global.locale is reactive, but for initial state we just grab the value.
  // Note: we need to cast because i18n types can be complex
  const detectedLocale = i18n.global.locale.value as SupportedLocale

  const initialSettings: AppSettings = savedSettings
    ? { ...defaultSettings, ...JSON.parse(savedSettings) }
    : { ...defaultSettings, language: detectedLocale }

  // State
  const exportPreferences = ref<ExportPreferences>(initialSettings.exportPreferences)
  const importPreferences = ref<ImportPreferences>(initialSettings.importPreferences ?? defaultSettings.importPreferences)
  const language = ref<AppSettings['language']>(initialSettings.language)

  // Sync i18n on load (in case localStorage overrides detection)
  if (i18n.global.locale.value !== language.value) {
    i18n.global.locale.value = language.value
  }

  // Persist to localStorage on change
  function saveSettings() {
    const settings: AppSettings = {
      exportPreferences: exportPreferences.value,
      importPreferences: importPreferences.value,
      language: language.value
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }

  watch([exportPreferences, importPreferences, language], saveSettings, { deep: true })

  // Actions
  function updateExportPreferences(prefs: Partial<ExportPreferences>) {
    exportPreferences.value = { ...exportPreferences.value, ...prefs }
  }

  function updateImportPreferences(prefs: Partial<ImportPreferences>) {
    importPreferences.value = { ...importPreferences.value, ...prefs }
  }

  function setLanguage(lang: AppSettings['language']) {
    language.value = lang
    // Update the actual i18n instance
    i18n.global.locale.value = lang
  }

  function resetToDefaults() {
    exportPreferences.value = { ...defaultSettings.exportPreferences }
    importPreferences.value = { ...defaultSettings.importPreferences }
    language.value = defaultSettings.language
    i18n.global.locale.value = defaultSettings.language
  }

  return {
    exportPreferences,
    importPreferences,
    language,
    updateExportPreferences,
    updateImportPreferences,
    setLanguage,
    resetToDefaults
  }
})
