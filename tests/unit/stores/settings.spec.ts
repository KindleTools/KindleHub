import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSettingsStore } from '@/stores/settings'

describe('Settings Store', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('initializes with default values', () => {
    const store = useSettingsStore()

    expect(store.exportPreferences).toEqual({
      defaultFormat: 'markdown',
      includeMetadata: true,
      groupByBook: true
    })
    expect(store.language).toBe('en')
  })

  it('loads settings from localStorage', () => {
    const savedSettings = {
      exportPreferences: {
        defaultFormat: 'json',
        includeMetadata: false,
        groupByBook: false
      },
      language: 'en'
    }
    localStorage.setItem('kindlehub-settings', JSON.stringify(savedSettings))

    // Create new pinia to trigger fresh load
    setActivePinia(createPinia())
    const store = useSettingsStore()

    expect(store.exportPreferences.defaultFormat).toBe('json')
    expect(store.exportPreferences.includeMetadata).toBe(false)
    expect(store.language).toBe('en')
  })

  it('updateExportPreferences updates partial preferences', () => {
    const store = useSettingsStore()

    store.updateExportPreferences({ defaultFormat: 'csv' })

    expect(store.exportPreferences.defaultFormat).toBe('csv')
    expect(store.exportPreferences.includeMetadata).toBe(true) // unchanged
    expect(store.exportPreferences.groupByBook).toBe(true) // unchanged
  })

  it('updateExportPreferences updates multiple preferences', () => {
    const store = useSettingsStore()

    store.updateExportPreferences({
      defaultFormat: 'obsidian',
      includeMetadata: false
    })

    expect(store.exportPreferences.defaultFormat).toBe('obsidian')
    expect(store.exportPreferences.includeMetadata).toBe(false)
    expect(store.exportPreferences.groupByBook).toBe(true) // unchanged
  })

  it('setLanguage updates language', () => {
    const store = useSettingsStore()

    store.setLanguage('en')

    expect(store.language).toBe('en')
  })

  it('resetToDefaults restores all default values', () => {
    const store = useSettingsStore()

    // Change values
    store.updateExportPreferences({
      defaultFormat: 'json',
      includeMetadata: false,
      groupByBook: false
    })
    store.setLanguage('en')

    // Reset
    store.resetToDefaults()

    expect(store.exportPreferences).toEqual({
      defaultFormat: 'markdown',
      includeMetadata: true,
      groupByBook: true
    })
    expect(store.language).toBe('en')
  })

  it('persists changes to localStorage', async () => {
    const store = useSettingsStore()

    store.updateExportPreferences({ defaultFormat: 'html' })

    // Wait for watch to trigger
    await vi.waitFor(() => {
      const saved = localStorage.getItem('kindlehub-settings')
      expect(saved).not.toBe(null)
      const parsed = JSON.parse(saved!)
      expect(parsed.exportPreferences.defaultFormat).toBe('html')
    })
  })

  it('handles partial localStorage data gracefully', () => {
    // Test with valid but partial data
    localStorage.setItem('kindlehub-settings', JSON.stringify({ language: 'en' }))

    setActivePinia(createPinia())
    const store = useSettingsStore()

    // Should merge with defaults
    expect(store.language).toBe('en')
    expect(store.exportPreferences.defaultFormat).toBe('markdown') // default value
  })
})
