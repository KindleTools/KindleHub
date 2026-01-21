import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useClippingsStore } from '@/stores/clippings'
import * as dbService from '@/services/db.service'

// Mock the DB service
vi.mock('@/services/db.service', () => ({
  getAllClippings: vi.fn(),
  getClippingsByBookId: vi.fn(),
  getStats: vi.fn()
}))

describe('Clippings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with empty state', () => {
    const store = useClippingsStore()
    expect(store.clippings).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBe(null)
  })

  it('loadAllClippings updates state with data', async () => {
    const store = useClippingsStore()
    const mockClippings = [
      { id: 1, content: 'Test Highlight', type: 'highlight' },
      { id: 2, content: 'Test Note', type: 'note' }
    ]

    // Setup mock return
    vi.mocked(dbService.getAllClippings).mockResolvedValue(mockClippings as any)
    vi.mocked(dbService.getStats).mockResolvedValue({
      totalClippings: 2,
      totalHighlights: 1,
      totalNotes: 1,
      totalBookmarks: 0
    })

    await store.loadAllClippings()

    expect(store.isLoading).toBe(false)
    expect(store.clippings).toEqual(mockClippings)
    expect(store.error).toBe(null)
  })

  it('handles errors during loading', async () => {
    const store = useClippingsStore()
    const errorMsg = 'DB Error'

    vi.mocked(dbService.getAllClippings).mockRejectedValue(new Error(errorMsg))

    await store.loadAllClippings()

    expect(store.isLoading).toBe(false)
    expect(store.clippings).toEqual([])
    expect(store.error).toBe(errorMsg)
  })

  it('computes highlights correctly', () => {
    const store = useClippingsStore()
    store.clippings = [
      { id: 1, type: 'highlight' },
      { id: 2, type: 'note' },
      { id: 3, type: 'highlight' }
    ] as any

    expect(store.highlights).toHaveLength(2)
    expect(store.highlights[0].type).toBe('highlight')
  })

  it('computes notes correctly', () => {
    const store = useClippingsStore()
    store.clippings = [
      { id: 1, type: 'highlight' },
      { id: 2, type: 'note' }
    ] as any
    expect(store.notes).toHaveLength(1)
    expect(store.notes[0].type).toBe('note')
  })

  it('computes bookmarks correctly', () => {
    const store = useClippingsStore()
    store.clippings = [
      { id: 1, type: 'highlight' },
      { id: 2, type: 'bookmark' }
    ] as any
    expect(store.bookmarks).toHaveLength(1)
    expect(store.bookmarks[0].type).toBe('bookmark')
  })

  it('clears clippings', () => {
    const store = useClippingsStore()
    store.clippings = [{ id: 1 }] as any
    store.clearClippings()
    expect(store.clippings).toEqual([])
  })
})
