/**
 * useSearch Composable - Full-text search with Fuse.js.
 *
 * Provides fuzzy search across clippings with highlighting.
 */
import Fuse, { type FuseResult, type IFuseOptions } from 'fuse.js'
import { ref, computed, watch, type Ref } from 'vue'

import type { StoredClipping, Book } from '@/db/schema'

export interface SearchResult {
  clipping: StoredClipping
  book: Book | undefined
  matches: Array<{
    key: string
    value: string
    indices: Array<[number, number]>
  }>
  score: number
}

export interface SearchFilters {
  bookIds: number[]
  types: Array<'highlight' | 'note' | 'bookmark'>
  dateRange: {
    start: Date | null
    end: Date | null
  }
}

export interface UseSearchOptions {
  clippings: Ref<StoredClipping[]>
  books?: Ref<Book[]>
}

const getDefaultFilters = (): SearchFilters => ({
  bookIds: [],
  types: [],
  dateRange: {
    start: null,
    end: null
  }
})

const fuseOptions: IFuseOptions<StoredClipping> = {
  keys: [
    { name: 'content', weight: 0.6 },
    { name: 'note', weight: 0.3 },
    { name: 'tags', weight: 0.1 }
  ],
  threshold: 0.4,
  includeMatches: true,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true
}

export function useSearch(options: UseSearchOptions) {
  const { clippings, books } = options

  // State
  const query = ref('')
  const filters = ref<SearchFilters>(getDefaultFilters())
  const isSearching = ref(false)
  const results = ref<SearchResult[]>([])

  // Fuse instance
  let fuseInstance: Fuse<StoredClipping> | null = null

  // Computed
  const hasQuery = computed(() => query.value.trim().length > 0)

  const hasFilters = computed(() =>
    filters.value.bookIds.length > 0 ||
    filters.value.types.length > 0 ||
    filters.value.dateRange.start !== null ||
    filters.value.dateRange.end !== null
  )

  const hasActiveSearch = computed(() => hasQuery.value || hasFilters.value)

  const resultCount = computed(() => results.value.length)

  // Get book by ID helper
  function getBookById(bookId: number): Book | undefined {
    return books?.value.find((b) => b.id === bookId)
  }

  // Initialize Fuse instance when clippings change
  function initializeFuse() {
    fuseInstance = new Fuse(clippings.value, fuseOptions)
  }

  // Apply filters to clippings
  function applyFilters(items: StoredClipping[]): StoredClipping[] {
    let filtered = items

    // Filter by book
    if (filters.value.bookIds.length > 0) {
      filtered = filtered.filter((c) => filters.value.bookIds.includes(c.bookId))
    }

    // Filter by type
    if (filters.value.types.length > 0) {
      filtered = filtered.filter((c) => filters.value.types.includes(c.type))
    }

    // Filter by date range
    if (filters.value.dateRange.start) {
      filtered = filtered.filter((c) => c.date >= filters.value.dateRange.start!)
    }
    if (filters.value.dateRange.end) {
      filtered = filtered.filter((c) => c.date <= filters.value.dateRange.end!)
    }

    return filtered
  }

  // Perform search
  function search() {
    isSearching.value = true

    try {
      let searchResults: SearchResult[]

      if (hasQuery.value && fuseInstance) {
        // Use Fuse.js for text search
        const fuseResults: FuseResult<StoredClipping>[] = fuseInstance.search(query.value.trim())

        searchResults = fuseResults.map((result) => ({
          clipping: result.item,
          book: getBookById(result.item.bookId),
          matches: (result.matches ?? []).map((m) => ({
            key: m.key ?? '',
            value: m.value ?? '',
            indices: m.indices as Array<[number, number]>
          })),
          score: result.score ?? 1
        }))

        // Apply filters after search
        if (hasFilters.value) {
          const filteredClippingIds = new Set(
            applyFilters(searchResults.map((r) => r.clipping)).map((c) => c.id)
          )
          searchResults = searchResults.filter((r) => filteredClippingIds.has(r.clipping.id))
        }
      } else if (hasFilters.value) {
        // Only filters, no text search
        const filtered = applyFilters(clippings.value)
        searchResults = filtered.map((clipping) => ({
          clipping,
          book: getBookById(clipping.bookId),
          matches: [],
          score: 0
        }))
      } else {
        // No search or filters - return all
        searchResults = clippings.value.map((clipping) => ({
          clipping,
          book: getBookById(clipping.bookId),
          matches: [],
          score: 0
        }))
      }

      results.value = searchResults
    } finally {
      isSearching.value = false
    }
  }

  // Update filter
  function setFilter<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    filters.value[key] = value
    search()
  }

  // Toggle type filter
  function toggleTypeFilter(type: 'highlight' | 'note' | 'bookmark') {
    const types = filters.value.types
    const index = types.indexOf(type)
    if (index === -1) {
      types.push(type)
    } else {
      types.splice(index, 1)
    }
    search()
  }

  // Toggle book filter
  function toggleBookFilter(bookId: number) {
    const bookIds = filters.value.bookIds
    const index = bookIds.indexOf(bookId)
    if (index === -1) {
      bookIds.push(bookId)
    } else {
      bookIds.splice(index, 1)
    }
    search()
  }

  // Clear all filters
  function clearFilters() {
    filters.value = getDefaultFilters()
    search()
  }

  // Clear everything
  function clearAll() {
    query.value = ''
    filters.value = getDefaultFilters()
    results.value = []
  }

  // Highlight text with matches
  function highlightMatches(
    text: string,
    indices: Array<[number, number]>
  ): string {
    if (!indices || indices.length === 0) return text

    let highlighted = ''
    let lastIndex = 0

    // Sort indices by start position
    const sortedIndices = [...indices].sort((a, b) => a[0] - b[0])

    for (const [start, end] of sortedIndices) {
      // Add non-matched text
      highlighted += escapeHtml(text.slice(lastIndex, start))
      // Add matched text with highlight
      highlighted += `<mark class="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">${escapeHtml(text.slice(start, end + 1))}</mark>`
      lastIndex = end + 1
    }

    // Add remaining text
    highlighted += escapeHtml(text.slice(lastIndex))

    return highlighted
  }

  function escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // Watch for clippings changes
  watch(clippings, () => {
    initializeFuse()
    if (hasActiveSearch.value) {
      search()
    }
  }, { immediate: true })

  // Debounced search on query change
  let searchTimeout: ReturnType<typeof setTimeout> | null = null
  watch(query, () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      search()
    }, 300)
  })

  return {
    // State
    query,
    filters,
    isSearching,
    results,

    // Computed
    hasQuery,
    hasFilters,
    hasActiveSearch,
    resultCount,

    // Actions
    search,
    setFilter,
    toggleTypeFilter,
    toggleBookFilter,
    clearFilters,
    clearAll,
    highlightMatches
  }
}
