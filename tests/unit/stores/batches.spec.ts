import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBatchesStore } from '@/stores/batches'
import type { Clipping } from 'kindle-tools-ts'

// Mock dependencies
vi.mock('@/services/db.service', () => ({
  saveClippings: vi.fn().mockResolvedValue({ booksCount: 1, clippingsCount: 1 }),
  saveBatchHistory: vi.fn().mockResolvedValue(undefined),
  getBatchHistory: vi.fn().mockResolvedValue([])
}))

// Mock batch service to avoid random IDs in tests if needed,
// strictly speaking we can use real one as it's a utility, but for consistent IDs we might want to mock.
// For now, using real service is fine as we test behavior not exact IDs usually.
// But valid UUIDs are needed.

describe('Batches Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockClippings: Clipping[] = [
    {
      title: 'Book 1',
      author: 'Author 1',
      content: 'Content 1',
      type: 'highlight',
      page: '10',
      location: '100',
      date: new Date('2023-01-01')
    },
    {
      title: 'Book 1',
      author: 'Author 1',
      content: 'Content 2',
      type: 'note', // Should be counted as note
      page: '11',
      location: '101',
      date: new Date('2023-01-01')
    },
    {
      title: 'Book 2',
      author: 'Author 2',
      content: 'Content 3',
      type: 'bookmark', // Should be counted as bookmark
      page: '20',
      location: '200',
      date: new Date('2023-01-01')
    }
  ]

  it('createBatch should initialize batch with correct structure and stats', () => {
    const store = useBatchesStore()
    const batchId = store.createBatch(mockClippings, 'test.txt', 1024, { duplicatesRemoved: 0, linkedNotes: 0 })

    expect(batchId).toBeDefined()
    expect(store.currentBatch).toBeDefined()
    expect(store.currentBatch?.fileName).toBe('test.txt')
    expect(store.currentBatch?.stats.totalClippings).toBe(3)
    expect(store.currentBatch?.stats.totalBooks).toBe(2)
    // Check type counts
    expect(store.currentBatch?.stats.byType.highlights).toBe(1)
    expect(store.currentBatch?.stats.byType.notes).toBe(1)
    expect(store.currentBatch?.stats.byType.bookmarks).toBe(1)

    // Check initial selection state
    expect(store.selectionCount).toBe(0)
  })

  it('selectAll/deselectAll should toggle all clippings', () => {
    const store = useBatchesStore()
    store.createBatch(mockClippings, 'test.txt', 1024, { duplicatesRemoved: 0, linkedNotes: 0 })

    store.selectAll()
    expect(store.selectionCount).toBe(3)

    store.deselectAll()
    expect(store.selectionCount).toBe(0)
  })

  it('selectBook should select all clippings for that book', () => {
    const store = useBatchesStore()
    store.createBatch(mockClippings, 'test.txt', 1024, { duplicatesRemoved: 0, linkedNotes: 0 })

    // Book 1 has 2 clippings
    // We need to find the key for Book 1.
    // The store exposes books array computed
    const book1 = store.booksArray.find((b) => b.title === 'Book 1')
    expect(book1).toBeDefined()

    if (book1) {
      store.selectBook(book1.key)
      expect(store.selectionCount).toBe(2)

      // Verify specifically those 2 are selected
      const selected = store.selectedClippings
      expect(selected.every((c) => c.title === 'Book 1')).toBe(true)
    }
  })

  it('deleteClippings should remove items and update stats', () => {
    const store = useBatchesStore()
    store.createBatch(mockClippings, 'test.txt', 1024, { duplicatesRemoved: 0, linkedNotes: 0 })

    const clippingToDelete = store.clippingsArray[0]
    store.deleteClippings([clippingToDelete.batchClippingId])

    expect(store.currentBatch?.stats.totalClippings).toBe(2)
    expect(store.clippingsArray.length).toBe(2)

    // Check if book groupings updated?
    // Book 1 should still exist as it had 2 clippings
    expect(store.currentBatch?.stats.totalBooks).toBe(2)
  })

  it('updateClipping should modify clipping and trigger regrouping if needed', () => {
    const store = useBatchesStore()
    store.createBatch(mockClippings, 'test.txt', 1024, { duplicatesRemoved: 0, linkedNotes: 0 })

    const clipping = store.clippingsArray[0] // Book 1

    // Update content only - no regrouping expected (internal optimization check difficult, but output check same)
    store.updateClipping(clipping.batchClippingId, { content: 'New Content' })
    expect(store.currentBatch?.clippings.get(clipping.batchClippingId)?.content).toBe('New Content')
    expect(store.currentBatch?.clippings.get(clipping.batchClippingId)?.isModified).toBe(true)

    // Update Author - should trigger regrouping
    // Currently Book 1 has 2 clippings. If we move 1 to "New Author", we should have 3 books now?
    // Wait, mockClippings[0] is one of two clips for Book 1.
    store.updateClipping(clipping.batchClippingId, { author: 'New Author' })

    // Total books should increase to 3: (Book 1/Author 1 [1 clip], Book 2/Author 2 [1 clip], Book 1/New Author [1 clip])
    expect(store.currentBatch?.stats.totalBooks).toBe(3)
  })

  it('commitToDatabase should save and update history', async () => {
    const store = useBatchesStore()
    store.createBatch(mockClippings, 'test.txt', 1024, { duplicatesRemoved: 0, linkedNotes: 0 })

    await store.commitToDatabase()

    expect(store.isProcessing).toBe(false)
    expect(store.processingProgress).toBe(100)
    expect(store.currentBatch?.status).toBe('imported')
    expect(store.batchHistory.length).toBe(1)
    expect(store.batchHistory[0].status).toBe('imported')
  })
})
