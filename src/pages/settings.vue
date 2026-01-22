<script setup lang="ts">
/**
 * Settings Page - User preferences and data management.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Download, Trash2, RotateCcw, Moon, Globe } from 'lucide-vue-next'
import { useDark, useToggle } from '@vueuse/core'

import { useSettingsStore } from '@/stores/settings'
import { useToast } from '@/composables/useToast'
import { clearAllData, getAllBooks, getAllClippings } from '@/services/db.service'
import UiConfirmModal from '@/components/ui/ConfirmModal.vue'

const router = useRouter()
const settingsStore = useSettingsStore()
const toast = useToast()

const isDark = useDark()
const toggleDark = useToggle(isDark)

const isClearing = ref(false)
const isExporting = ref(false)
const showConfirmClear = ref(false)

const formatOptions = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
  { value: 'obsidian', label: 'Obsidian' },
  { value: 'joplin', label: 'Joplin' },
  { value: 'html', label: 'HTML' }
] as const

async function handleClearData() {
  isClearing.value = true
  try {
    await clearAllData()
    showConfirmClear.value = false
    toast.success('Todos los datos han sido eliminados')
    router.push('/')
  } catch (err) {
    console.error('Failed to clear data:', err)
    toast.error('Error al eliminar los datos')
  } finally {
    isClearing.value = false
  }
}

async function handleExportBackup() {
  isExporting.value = true
  try {
    const [books, clippings] = await Promise.all([
      getAllBooks(),
      getAllClippings()
    ])

    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      books,
      clippings
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kindlehub-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Backup exportado correctamente')
  } catch (err) {
    console.error('Failed to export backup:', err)
    toast.error('Error al exportar el backup')
  } finally {
    isExporting.value = false
  }
}

function handleResetSettings() {
  settingsStore.resetToDefaults()
  toast.info('Configuracion restaurada')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-2xl mx-auto px-4 py-4">
        <div class="flex items-center gap-4">
          <button
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            @click="router.push('/')"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">
            Configuración
          </h1>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <!-- Appearance -->
      <section class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Apariencia
        </h2>

        <div class="space-y-4">
          <!-- Dark mode -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Moon class="w-5 h-5 text-gray-500" />
              <span class="text-gray-700 dark:text-gray-300">Modo oscuro</span>
            </div>
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="isDark ? 'bg-primary-600' : 'bg-gray-200'"
              @click="toggleDark()"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="isDark ? 'translate-x-6' : 'translate-x-1'"
              ></span>
            </button>
          </div>

          <!-- Language -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Globe class="w-5 h-5 text-gray-500" />
              <span class="text-gray-700 dark:text-gray-300">Idioma</span>
            </div>
            <select
              :value="settingsStore.language"
              class="text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              @change="settingsStore.setLanguage(($event.target as HTMLSelectElement).value as 'es' | 'en')"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Export Preferences -->
      <section class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Exportación
        </h2>

        <div class="space-y-4">
          <!-- Default format -->
          <div class="flex items-center justify-between">
            <span class="text-gray-700 dark:text-gray-300">Formato por defecto</span>
            <select
              :value="settingsStore.exportPreferences.defaultFormat"
              class="text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              @change="settingsStore.updateExportPreferences({ defaultFormat: ($event.target as HTMLSelectElement).value as any })"
            >
              <option v-for="opt in formatOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Include metadata -->
          <div class="flex items-center justify-between">
            <span class="text-gray-700 dark:text-gray-300">Incluir metadatos</span>
            <input
              type="checkbox"
              :checked="settingsStore.exportPreferences.includeMetadata"
              class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              @change="settingsStore.updateExportPreferences({ includeMetadata: ($event.target as HTMLInputElement).checked })"
            />
          </div>

          <!-- Group by book -->
          <div class="flex items-center justify-between">
            <span class="text-gray-700 dark:text-gray-300">Agrupar por libro</span>
            <input
              type="checkbox"
              :checked="settingsStore.exportPreferences.groupByBook"
              class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              @change="settingsStore.updateExportPreferences({ groupByBook: ($event.target as HTMLInputElement).checked })"
            />
          </div>
        </div>
      </section>

      <!-- Data Management -->
      <section class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Datos
        </h2>

        <div class="space-y-3">
          <!-- Export backup -->
          <button
            :disabled="isExporting"
            class="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors disabled:opacity-50"
            @click="handleExportBackup"
          >
            <Download class="w-5 h-5 text-gray-500" />
            <div>
              <p class="font-medium">Exportar backup</p>
              <p class="text-sm text-gray-500">Guardar todos los datos en un archivo JSON</p>
            </div>
          </button>

          <!-- Reset settings -->
          <button
            class="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            @click="handleResetSettings"
          >
            <RotateCcw class="w-5 h-5 text-gray-500" />
            <div>
              <p class="font-medium">Restaurar configuración</p>
              <p class="text-sm text-gray-500">Volver a los valores por defecto</p>
            </div>
          </button>

          <!-- Clear data -->
          <button
            class="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            @click="showConfirmClear = true"
          >
            <Trash2 class="w-5 h-5" />
            <div>
              <p class="font-medium">Eliminar todos los datos</p>
              <p class="text-sm text-red-500">Esta acción no se puede deshacer</p>
            </div>
          </button>
        </div>
      </section>

      <!-- Confirm Clear Modal -->
      <UiConfirmModal
        :open="showConfirmClear"
        title="¿Eliminar todos los datos?"
        message="Esta accion eliminara todos los libros y clippings almacenados. No se puede deshacer."
        confirm-text="Eliminar"
        variant="danger"
        :loading="isClearing"
        @confirm="handleClearData"
        @cancel="showConfirmClear = false"
      />
    </main>
  </div>
</template>
