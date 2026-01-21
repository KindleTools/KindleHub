<script setup lang="ts">
/**
 * Editor Page - Full data table editing view.
 */
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Book } from 'lucide-vue-next'

import DataTable from '@/components/editor/DataTable.vue'
import type { StoredClipping, Book as BookType } from '@/db/schema'
import { getAllClippings, getClippingsByBookId, getAllBooks } from '@/services/db.service'

const route = useRoute()
const router = useRouter()

const clippings = ref<StoredClipping[]>([])
const books = ref<BookType[]>([])
const selectedBookId = ref<number | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const selectedBook = computed(() =>
  books.value.find((b) => b.id === selectedBookId.value)
)

async function loadData() {
  isLoading.value = true
  error.value = null

  try {
    books.value = await getAllBooks()

    // Check if we have a book filter from query
    const bookIdParam = route.query.bookId
    if (bookIdParam) {
      selectedBookId.value = Number(bookIdParam)
      clippings.value = await getClippingsByBookId(selectedBookId.value)
    } else {
      clippings.value = await getAllClippings()
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error loading data'
    console.error('Failed to load data:', err)
  } finally {
    isLoading.value = false
  }
}

async function handleBookFilter(bookId: number | null) {
  selectedBookId.value = bookId
  isLoading.value = true

  try {
    if (bookId) {
      clippings.value = await getClippingsByBookId(bookId)
      router.replace({ query: { bookId: String(bookId) } })
    } else {
      clippings.value = await getAllClippings()
      router.replace({ query: {} })
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error filtering'
  } finally {
    isLoading.value = false
  }
}

async function handleRefresh() {
  if (selectedBookId.value) {
    clippings.value = await getClippingsByBookId(selectedBookId.value)
  } else {
    clippings.value = await getAllClippings()
  }
}

function onBookFilterChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value
  handleBookFilter(value ? Number(value) : null)
}

onMounted(loadData)
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              @click="router.push('/kindle-hub/library')"
            >
              <ArrowLeft class="w-5 h-5" />
            </button>
            <div>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                Editor de Datos
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ clippings.length }} clippings
                <span v-if="selectedBook"> en "{{ selectedBook.title }}"</span>
              </p>
            </div>
          </div>

          <!-- Book filter -->
          <div class="flex items-center gap-2">
            <Book class="w-5 h-5 text-gray-400" />
            <select
              :value="selectedBookId ?? ''"
              class="text-sm rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
              @change="onBookFilterChange"
            >
              <option value="">Todos los libros</option>
              <option v-for="book in books" :key="book.id" :value="book.id">
                {{ book.title }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
        <button
          class="mt-4 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 underline"
          @click="loadData"
        >
          Reintentar
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="clippings.length === 0" class="text-center py-12">
        <Book class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No hay clippings
        </h2>
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          Importa un archivo de clippings para empezar a editar
        </p>
        <router-link
          to="/kindle-hub/import"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
        >
          Importar archivo
        </router-link>
      </div>

      <!-- Data table -->
      <DataTable
        v-else
        :clippings="clippings"
        :book-id="selectedBookId ?? undefined"
        @refresh="handleRefresh"
      />
    </main>
  </div>
</template>
