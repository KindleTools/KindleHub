/**
 * Settings Store - User preferences and configuration.
 */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface ExportPreferences {
  defaultFormat: 'markdown' | 'json' | 'csv' | 'obsidian' | 'joplin' | 'html'
  includeMetadata: boolean
  groupByBook: boolean
}

export interface AppSettings {
  exportPreferences: ExportPreferences
  language: 'es' | 'en'
}

const SETTINGS_KEY = 'kindlehub-settings'

const defaultSettings: AppSettings = {
  exportPreferences: {
    defaultFormat: 'markdown',
    includeMetadata: true,
    groupByBook: true
  },
  language: 'es'
}

export const useSettingsStore = defineStore('settings', () => {
  // Load settings from localStorage
  const savedSettings = localStorage.getItem(SETTINGS_KEY)
  const initialSettings = savedSettings
    ? { ...defaultSettings, ...JSON.parse(savedSettings) }
    : defaultSettings

  // State
  const exportPreferences = ref<ExportPreferences>(initialSettings.exportPreferences)
  const language = ref<AppSettings['language']>(initialSettings.language)

  // Persist to localStorage on change
  function saveSettings() {
    const settings: AppSettings = {
      exportPreferences: exportPreferences.value,
      language: language.value
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }

  watch([exportPreferences, language], saveSettings, { deep: true })

  // Actions
  function updateExportPreferences(prefs: Partial<ExportPreferences>) {
    exportPreferences.value = { ...exportPreferences.value, ...prefs }
  }

  function setLanguage(lang: AppSettings['language']) {
    language.value = lang
  }

  function resetToDefaults() {
    exportPreferences.value = { ...defaultSettings.exportPreferences }
    language.value = defaultSettings.language
  }

  return {
    exportPreferences,
    language,
    updateExportPreferences,
    setLanguage,
    resetToDefaults
  }
})
