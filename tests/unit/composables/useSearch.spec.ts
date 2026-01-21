import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useSearch } from '@/composables/useSearch'

// Mocking the DB schema types is not strictly necessary as we are just passing objects,
// but we need to ensure the objects satisfy the interfaces.

describe('useSearch', () => {
  const mockClippings = [
    {
      id: 1,
      bookId: 101,
      content: 'Vue.js is a progressive framework',
      note: 'My favorite framwork',
      tags: ['web', 'frontend'],
      type: 'highlight',
      date: new Date('2023-01-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
      originalId: '1'
    },
    {
      id: 2,
      bookId: 102,
      content: 'Typescript adds static typing',
      note: '',
      tags: ['ts', 'microsoft'],
      type: 'bookmark',
      date: new Date('2023-02-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
      originalId: '2'
    },
    {
      id: 3,
      bookId: 101,
      content: 'Another Vue clipping',
      note: '',
      tags: [],
      type: 'highlight',
      date: new Date('2023-03-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
      originalId: '3'
    }
  ] as any[]

  const mockBooks = [
    { id: 101, title: 'Vue Book' },
    { id: 102, title: 'TS Book' }
  ] as any[]

  let clippingsRef: any
  let booksRef: any

  beforeEach(() => {
    vi.useFakeTimers()
    clippingsRef = ref([...mockClippings])
    booksRef = ref([...mockBooks])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with empty search state', () => {
    const { query, results, resultCount, hasActiveSearch } = useSearch({
      clippings: clippingsRef,
      books: booksRef
    })

    expect(query.value).toBe('')
    expect(results.value).toEqual([])
    expect(resultCount.value).toBe(0)
    expect(hasActiveSearch.value).toBe(false)
  })

  it('searches by text query (fuzzy search)', async () => {
    const { query, results } = useSearch({
      clippings: clippingsRef,
      books: booksRef
    })

    query.value = 'progressive'
    await nextTick() // Update value
    vi.advanceTimersByTime(350) // Timer fires
    await nextTick() // Reactivity updates results

    expect(results.value.length).toBe(1)
    expect(results.value[0].clipping.id).toBe(1)

    query.value = 'Vue'
    await nextTick()
    vi.advanceTimersByTime(350)
    await nextTick()

    expect(results.value.length).toBe(2) // clippings 1 and 3
  })

  it('filters by book', async () => {
    const { toggleBookFilter, results, hasFilters } = useSearch({
      clippings: clippingsRef,
      books: booksRef
    })

    toggleBookFilter(102)
    // Filters trigger search immediately, but the search function might be async or have side effects waiting for tick
    await nextTick()

    expect(hasFilters.value).toBe(true)
    expect(results.value.length).toBe(1)
    expect(results.value[0].clipping.id).toBe(2)
  })

  it('filters by type', async () => {
    const { toggleTypeFilter, results } = useSearch({
      clippings: clippingsRef,
      books: booksRef
    })

    toggleTypeFilter('highlight')
    await nextTick()

    expect(results.value.length).toBe(2) // 1 and 3
    expect(results.value.every((r) => r.clipping.type === 'highlight')).toBe(true)
  })

  it('combines search and filters', async () => {
    const { query, toggleBookFilter, results } = useSearch({
      clippings: clippingsRef,
      books: booksRef
    })

    // Search for "Vue" (matches 1 and 3)
    query.value = 'Vue'
    await nextTick()
    vi.advanceTimersByTime(350)
    await nextTick()

    // Filter by Book 101 (matches 1 and 3) -> Result should be 2
    toggleBookFilter(101)
    await nextTick()

    expect(results.value.length).toBe(2)

    // Now filter by a book that doesn't have "Vue" matches
    toggleBookFilter(101) // toggle off
    toggleBookFilter(102) // toggle on (Book 102 has TS clipping, no "Vue" clipping)
    await nextTick() // toggle

    expect(results.value.length).toBe(0)
  })

  it('clears all filters and query', async () => {
    const { query, toggleTypeFilter, clearAll, hasActiveSearch } = useSearch({
      clippings: clippingsRef,
      books: booksRef
    })

    query.value = 'Foo'
    toggleTypeFilter('note')
    await nextTick()

    clearAll()
    await nextTick()

    expect(query.value).toBe('')
    expect(hasActiveSearch.value).toBe(false)
  })

  it('utilities: highlightMatches', () => {
    const { highlightMatches } = useSearch({
      clippings: clippingsRef
    })

    const text = 'Hello World'
    const indices: [number, number][] = [[0, 4]] // "Hello"

    const highlighted = highlightMatches(text, indices)
    expect(highlighted).toContain('<mark')
    expect(highlighted).toContain('>Hello</mark>')
    expect(highlighted).toContain(' World')
  })
})
