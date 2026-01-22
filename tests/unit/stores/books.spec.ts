import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBooksStore } from '@/stores/books'
import * as dbService from '@/services/db.service'

// Mock the DB service
vi.mock('@/services/db.service', () => ({
  getAllBooks: vi.fn(),
  getBookById: vi.fn()
}))

describe('Books Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with empty state', () => {
    const store = useBooksStore()
    expect(store.books).toEqual([])
    expect(store.selectedBook).toBe(null)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBe(null)
  })

  it('computes totalBooks correctly', () => {
    const store = useBooksStore()
    store.books = [
      { id: 1, title: 'Book 1', clippingCount: 5 },
      { id: 2, title: 'Book 2', clippingCount: 3 }
    ] as any // eslint-disable-line @typescript-eslint/no-explicit-any

    expect(store.totalBooks).toBe(2)
  })

  it('computes totalClippings correctly', () => {
    const store = useBooksStore()
    store.books = [
      { id: 1, title: 'Book 1', clippingCount: 5 },
      { id: 2, title: 'Book 2', clippingCount: 3 }
    ] as any // eslint-disable-line @typescript-eslint/no-explicit-any

    expect(store.totalClippings).toBe(8)
  })

  it('loadBooks updates state with data', async () => {
    const store = useBooksStore()
    const mockBooks = [
      { id: 1, title: 'Book 1', author: 'Author 1', clippingCount: 5 },
      { id: 2, title: 'Book 2', author: 'Author 2', clippingCount: 3 }
    ]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(dbService.getAllBooks).mockResolvedValue(mockBooks as any)

    await store.loadBooks()

    expect(store.isLoading).toBe(false)
    expect(store.books).toEqual(mockBooks)
    expect(store.error).toBe(null)
  })

  it('handles errors during loadBooks', async () => {
    const store = useBooksStore()
    const errorMsg = 'DB Error'

    vi.mocked(dbService.getAllBooks).mockRejectedValue(new Error(errorMsg))

    await store.loadBooks()

    expect(store.isLoading).toBe(false)
    expect(store.books).toEqual([])
    expect(store.error).toBe(errorMsg)
  })

  it('selectBook sets selectedBook', async () => {
    const store = useBooksStore()
    const mockBook = { id: 1, title: 'Book 1', author: 'Author 1' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(dbService.getBookById).mockResolvedValue(mockBook as any)

    await store.selectBook(1)

    expect(store.selectedBook).toEqual(mockBook)
    expect(store.error).toBe(null)
  })

  it('selectBook handles missing book', async () => {
    const store = useBooksStore()

    vi.mocked(dbService.getBookById).mockResolvedValue(undefined)

    await store.selectBook(999)

    expect(store.selectedBook).toBe(null)
  })

  it('selectBook handles errors', async () => {
    const store = useBooksStore()
    const errorMsg = 'Book not found'

    vi.mocked(dbService.getBookById).mockRejectedValue(new Error(errorMsg))

    await store.selectBook(1)

    expect(store.isLoading).toBe(false)
    expect(store.error).toBe(errorMsg)
  })

  it('clearSelection resets selectedBook', () => {
    const store = useBooksStore()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.selectedBook = { id: 1, title: 'Book 1' } as any

    store.clearSelection()

    expect(store.selectedBook).toBe(null)
  })
})
