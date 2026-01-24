<script setup lang="ts">
/**
 * Search Page - Full-text search across all clippings.
 * Keyboard shortcuts: / or Ctrl+F to focus search, Esc to clear
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Filter, X, Book, Calendar, Tag, ArrowLeft } from 'lucide-vue-next'

import type { StoredClipping, Book as BookType } from '@/db/schema'
import { getAllClippings, getAllBooks, getAllTags } from '@/services/db.service'
import { useSearch } from '@/composables/useSearch'
import EmptyState from '@/components/ui/EmptyState.vue'
import { Hash } from 'lucide-vue-next'

const router = useRouter()
const searchInputRef = ref<HTMLInputElement | null>(null)

const clippings = ref<StoredClipping[]>([])
const books = ref<BookType[]>([])
const availableTags = ref<string[]>([])
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
  toggleTagFilter,
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
    const [allClippings, allBooks, allTags] = await Promise.all([
      getAllClippings(),
      getAllBooks(),
      getAllTags()
    ])
    clippings.value = allClippings
    books.value = allBooks
    availableTags.value = allTags
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

function focusSearch() {
  searchInputRef.value?.focus()
  searchInputRef.value?.select()
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

  // '/' to focus search (when not in an input)
  if (event.key === '/' && !isInput) {
    event.preventDefault()
    focusSearch()
    return
  }

  // Ctrl/Cmd + F to focus search
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault()
    focusSearch()
    return
  }

  // Escape to clear search (when in search input)
  if (event.key === 'Escape' && target === searchInputRef.value) {
    query.value = ''
    searchInputRef.value?.blur()
    return
  }
}

onMounted(() => {
  loadData()
  // Auto-focus search input on page load
  setTimeout(focusSearch, 100)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
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
            {{ $t('search.title') }}
          </h1>
        </div>

        <!-- Search input -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref="searchInputRef"
            v-model="query"
            type="search"
            :placeholder="$t('search.placeholder')"
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
              {{ $t('search.filter_type') }}
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
              {{ $t('search.filter_book') }}
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

          <!-- Tag filters -->
          <div v-if="availableTags.length > 0">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Hash class="inline w-4 h-4 mr-1" />
              {{ $t('tags.filter_label') }}
            </label>
            <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              <button
                v-for="tag in availableTags"
                :key="tag"
                :class="[
                  'px-3 py-1.5 text-sm rounded-full transition-colors',
                  filters.tags.includes(tag)
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                ]"
                @click="toggleTagFilter(tag)"
              >
                #{{ tag }}
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
            {{ $t('search.clear_filters') }}
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
          <span v-if="isSearching">{{ $t('search.searching') }}</span>
          <span v-else>{{ $t('search.results_found', { count: resultCount }) }}</span>
        </p>
      </div>

      <!-- No results -->
      <EmptyState
        v-if="!isLoading && (hasQuery || hasFilters) && results.length === 0"
        type="search"
        :title="$t('search.no_results')"
        :description="$t('search.no_results')"
      />

      <!-- Initial state -->
      <EmptyState
        v-else-if="!isLoading && !hasQuery && !hasFilters"
        type="search"
        :title="$t('search.empty_state_title')"
        :description="$t('search.empty_state_desc', { count: clippings.length })"
      />

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
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="text-gray-900 dark:text-gray-100 prose dark:prose-invert prose-sm max-w-none"
            v-html="getMatchContent(result)"
          ></div>
          <!-- eslint-enable vue/no-v-html -->

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
