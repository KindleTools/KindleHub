<script setup lang="ts">
/**
 * Search Page - Full-text search across all clippings.
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Filter, X, Book, Calendar, Tag, ArrowLeft } from 'lucide-vue-next'

import type { StoredClipping, Book as BookType } from '@/db/schema'
import { getAllClippings, getAllBooks } from '@/services/db.service'
import { useSearch } from '@/composables/useSearch'

const router = useRouter()

const clippings = ref<StoredClipping[]>([])
const books = ref<BookType[]>([])
const isLoading = ref(true)
const showFilters = ref(false)

const {
  query,
  filters,
  isSearching,
  results,
  hasQuery,
  hasFilters,
  resultCount,
  toggleTypeFilter,
  toggleBookFilter,
  clearFilters,
  highlightMatches
} = useSearch({
  clippings,
  books
})

const typeOptions = [
  { value: 'highlight', label: 'Highlights', icon: '🖍️' },
  { value: 'note', label: 'Notes', icon: '📝' },
  { value: 'bookmark', label: 'Bookmarks', icon: '🔖' }
] as const

async function loadData() {
  isLoading.value = true
  try {
    const [allClippings, allBooks] = await Promise.all([
      getAllClippings(),
      getAllBooks()
    ])
    clippings.value = allClippings
    books.value = allBooks
  } catch (err) {
    console.error('Failed to load data:', err)
  } finally {
    isLoading.value = false
  }
}

function getMatchContent(result: typeof results.value[0]): string {
  const contentMatch = result.matches.find((m) => m.key === 'content')
  if (contentMatch) {
    return highlightMatches(contentMatch.value, contentMatch.indices)
  }
  return result.clipping.content
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(date)
}

onMounted(loadData)
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center gap-4 mb-4">
          <button
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            @click="router.push('/library')"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">
            Buscar Clippings
          </h1>
        </div>

        <!-- Search input -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="query"
            type="search"
            placeholder="Buscar en todos los clippings..."
            class="w-full pl-10 pr-12 py-3 text-lg rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            :class="[
              'absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors',
              hasFilters
                ? 'text-primary-600 bg-primary-100 dark:bg-primary-900/30'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
            @click="showFilters = !showFilters"
          >
            <Filter class="w-5 h-5" />
          </button>
        </div>

        <!-- Filters panel -->
        <div
          v-show="showFilters"
          class="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-4"
        >
          <!-- Type filters -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag class="inline w-4 h-4 mr-1" />
              Tipo
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="type in typeOptions"
                :key="type.value"
                :class="[
                  'px-3 py-1.5 text-sm rounded-full transition-colors',
                  filters.types.includes(type.value)
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                ]"
                @click="toggleTypeFilter(type.value)"
              >
                {{ type.icon }} {{ type.label }}
              </button>
            </div>
          </div>

          <!-- Book filters -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Book class="inline w-4 h-4 mr-1" />
              Libro
            </label>
            <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              <button
                v-for="book in books"
                :key="book.id"
                :class="[
                  'px-3 py-1.5 text-sm rounded-full transition-colors truncate max-w-xs',
                  filters.bookIds.includes(book.id!)
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                ]"
                @click="toggleBookFilter(book.id!)"
              >
                {{ book.title }}
              </button>
            </div>
          </div>

          <!-- Clear filters -->
          <button
            v-if="hasFilters"
            class="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            @click="clearFilters"
          >
            <X class="w-4 h-4" />
            Limpiar filtros
          </button>
        </div>
      </div>
    </header>

    <!-- Results -->
    <main class="max-w-4xl mx-auto px-4 py-6">
      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Results count -->
      <div v-else-if="hasQuery || hasFilters" class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          <span v-if="isSearching">Buscando...</span>
          <span v-else>{{ resultCount }} resultado(s) encontrado(s)</span>
        </p>
      </div>

      <!-- No results -->
      <div
        v-if="!isLoading && (hasQuery || hasFilters) && results.length === 0"
        class="text-center py-12"
      >
        <Search class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Sin resultados
        </h2>
        <p class="text-gray-500 dark:text-gray-400">
          No se encontraron clippings que coincidan con tu búsqueda
        </p>
      </div>

      <!-- Initial state -->
      <div
        v-else-if="!isLoading && !hasQuery && !hasFilters"
        class="text-center py-12"
      >
        <Search class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Busca en tu biblioteca
        </h2>
        <p class="text-gray-500 dark:text-gray-400">
          Escribe algo para buscar entre {{ clippings.length }} clippings
        </p>
      </div>

      <!-- Results list -->
      <div v-else class="space-y-4">
        <div
          v-for="result in results"
          :key="result.clipping.id"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <!-- Book info -->
          <div v-if="result.book" class="flex items-center gap-2 mb-2 text-sm text-gray-500 dark:text-gray-400">
            <Book class="w-4 h-4" />
            <span class="font-medium">{{ result.book.title }}</span>
            <span>•</span>
            <span>{{ result.book.author }}</span>
          </div>

          <!-- Content with highlights -->
          <div
            class="text-gray-900 dark:text-gray-100 prose dark:prose-invert prose-sm max-w-none"
            v-html="getMatchContent(result)"
          ></div>

          <!-- Meta -->
          <div class="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
            <span
              :class="[
                'px-2 py-0.5 rounded-full capitalize',
                result.clipping.type === 'highlight' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                result.clipping.type === 'note' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              ]"
            >
              {{ result.clipping.type }}
            </span>
            <span v-if="result.clipping.location">{{ result.clipping.location }}</span>
            <span class="flex items-center gap-1">
              <Calendar class="w-3 h-3" />
              {{ formatDate(result.clipping.date) }}
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
