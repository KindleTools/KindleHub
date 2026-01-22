import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '@/db/schema'

// Mock the database module
vi.mock('@/db/schema', () => ({
  db: {
    books: {
      orderBy: vi.fn().mockReturnThis(),
      reverse: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
      get: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      clear: vi.fn(),
      count: vi.fn(),
      where: vi.fn().mockReturnThis(),
      first: vi.fn(),
      equals: vi.fn().mockReturnThis()
    },
    clippings: {
      orderBy: vi.fn().mockReturnThis(),
      reverse: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
      get: vi.fn(),
      add: vi.fn().mockResolvedValue(123),
      update: vi.fn(),
      bulkAdd: vi.fn(),
      bulkDelete: vi.fn(),
      clear: vi.fn(),
      count: vi.fn(),
      where: vi.fn().mockReturnThis(),
      first: vi.fn(),
      equals: vi.fn().mockReturnThis()
    },
    transaction: vi.fn()
  }
}))

// Import after mocking
import {
  getAllBooks,
  getBookById,
  getAllClippings,
  getClippingsByBookId,
  getClippingById,
  updateClipping,
  addClipping,
  addClippings,
  deleteClippings,
  getStats
} from '@/services/db.service'

describe('DB Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllBooks', () => {
    it('returns books ordered by lastReadDate descending', async () => {
      const mockBooks = [
        { id: 1, title: 'Book 1', author: 'Author 1' },
        { id: 2, title: 'Book 2', author: 'Author 2' }
      ]
      vi.mocked(db.books.toArray).mockResolvedValue(mockBooks as any)

      const result = await getAllBooks()

      expect(db.books.orderBy).toHaveBeenCalledWith('lastReadDate')
      expect(db.books.reverse).toHaveBeenCalled()
      expect(result).toEqual(mockBooks)
    })

    it('returns empty array when no books', async () => {
      vi.mocked(db.books.toArray).mockResolvedValue([])

      const result = await getAllBooks()

      expect(result).toEqual([])
    })
  })

  describe('getBookById', () => {
    it('returns book when found', async () => {
      const mockBook = { id: 1, title: 'Book 1', author: 'Author 1' }
      vi.mocked(db.books.get).mockResolvedValue(mockBook as any)

      const result = await getBookById(1)

      expect(db.books.get).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockBook)
    })

    it('returns undefined when not found', async () => {
      vi.mocked(db.books.get).mockResolvedValue(undefined)

      const result = await getBookById(999)

      expect(result).toBeUndefined()
    })
  })

  describe('getAllClippings', () => {
    it('returns clippings ordered by date descending', async () => {
      const mockClippings = [
        { id: 1, content: 'Clipping 1', type: 'highlight' },
        { id: 2, content: 'Clipping 2', type: 'note' }
      ]
      vi.mocked(db.clippings.toArray).mockResolvedValue(mockClippings as any)

      const result = await getAllClippings()

      expect(db.clippings.orderBy).toHaveBeenCalledWith('date')
      expect(db.clippings.reverse).toHaveBeenCalled()
      expect(result).toEqual(mockClippings)
    })
  })

  describe('getClippingsByBookId', () => {
    it('returns clippings for specific book', async () => {
      const mockClippings = [
        { id: 1, bookId: 1, content: 'Clipping 1' }
      ]
      vi.mocked(db.clippings.toArray).mockResolvedValue(mockClippings as any)

      const result = await getClippingsByBookId(1)

      expect(db.clippings.where).toHaveBeenCalledWith({ bookId: 1 })
      expect(result).toEqual(mockClippings)
    })

    it('returns empty array when no clippings for book', async () => {
      vi.mocked(db.clippings.toArray).mockResolvedValue([])

      const result = await getClippingsByBookId(999)

      expect(result).toEqual([])
    })
  })

  describe('getClippingById', () => {
    it('returns clipping when found', async () => {
      const mockClipping = { id: 1, content: 'Test clipping', type: 'highlight' }
      vi.mocked(db.clippings.get).mockResolvedValue(mockClipping as any)

      const result = await getClippingById(1)

      expect(db.clippings.get).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockClipping)
    })

    it('returns undefined when not found', async () => {
      vi.mocked(db.clippings.get).mockResolvedValue(undefined)

      const result = await getClippingById(999)

      expect(result).toBeUndefined()
    })
  })

  describe('updateClipping', () => {
    it('updates clipping with new data and timestamp', async () => {
      await updateClipping(1, { content: 'Updated content' })

      expect(db.clippings.update).toHaveBeenCalledWith(1, expect.objectContaining({
        content: 'Updated content',
        updatedAt: expect.any(Date)
      }))
    })
  })

  describe('addClipping', () => {
    it('adds clipping and returns new ID', async () => {
      const newClipping = {
        bookId: 1,
        originalId: 'test-123',
        type: 'highlight' as const,
        content: 'New clipping',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await addClipping(newClipping)

      expect(db.clippings.add).toHaveBeenCalledWith(newClipping)
      expect(result).toBe(123) // mocked return value
    })
  })

  describe('addClippings', () => {
    it('adds multiple clippings in bulk', async () => {
      const clippings = [
        { bookId: 1, originalId: 'test-1', type: 'highlight' as const, content: 'Clip 1', date: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { bookId: 1, originalId: 'test-2', type: 'note' as const, content: 'Clip 2', date: new Date(), createdAt: new Date(), updatedAt: new Date() }
      ]

      await addClippings(clippings)

      expect(db.clippings.bulkAdd).toHaveBeenCalledWith(clippings)
    })
  })

  describe('deleteClippings', () => {
    it('deletes multiple clippings by IDs', async () => {
      await deleteClippings([1, 2, 3])

      expect(db.clippings.bulkDelete).toHaveBeenCalledWith([1, 2, 3])
    })

    it('handles empty array', async () => {
      await deleteClippings([])

      expect(db.clippings.bulkDelete).toHaveBeenCalledWith([])
    })
  })

  describe('getStats', () => {
    it('returns correct statistics', async () => {
      vi.mocked(db.books.count).mockResolvedValue(5)
      vi.mocked(db.clippings.count)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(60) // highlights
        .mockResolvedValueOnce(30) // notes
        .mockResolvedValueOnce(10) // bookmarks

      const result = await getStats()

      expect(result).toEqual({
        totalBooks: 5,
        totalClippings: 100,
        totalHighlights: 60,
        totalNotes: 30,
        totalBookmarks: 10
      })
    })

    it('returns zeros when database is empty', async () => {
      vi.mocked(db.books.count).mockResolvedValue(0)
      vi.mocked(db.clippings.count).mockResolvedValue(0)

      const result = await getStats()

      expect(result).toEqual({
        totalBooks: 0,
        totalClippings: 0,
        totalHighlights: 0,
        totalNotes: 0,
        totalBookmarks: 0
      })
    })
  })
})
