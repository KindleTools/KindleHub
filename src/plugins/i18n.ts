import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import it from '@/locales/it.json'
import de from '@/locales/de.json'
import fr from '@/locales/fr.json'
import pt from '@/locales/pt.json'

// Definition of supported languages type
export type SupportedLocale = 'en' | 'es' | 'it' | 'de' | 'fr' | 'pt'
export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'es', 'it', 'de', 'fr', 'pt']

// Language detection logic
function detectLanguage(): SupportedLocale {
  // 1. Check LocalStorage (via settings store logic - implemented here simply for init)
  const savedSettings = localStorage.getItem('kindlehub-settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      if (parsed.language && SUPPORTED_LOCALES.includes(parsed.language)) {
        return parsed.language
      }
    } catch (e) {
      console.warn('Failed to parse settings for language detection', e)
    }
  }

  // 2. Check Browser Language
  const browserLang = navigator.language.split('-')[0] as SupportedLocale
  if (SUPPORTED_LOCALES.includes(browserLang)) {
    return browserLang
  }

  // 3. Fallback
  return 'en'
}

export const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: detectLanguage(),
  fallbackLocale: 'en',
  messages: {
    en,
    es,
    it,
    de,
    fr,
    pt
  }
})
