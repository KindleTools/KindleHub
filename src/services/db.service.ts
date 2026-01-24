/**
 * Database Service - IndexedDB operations using Dexie.
 *
 * Provides CRUD operations for books and clippings storage.
 */
import type { Clipping } from 'kindle-tools-ts'

import { db, type Book, type StoredClipping } from '@/db/schema'
import { generateCoverColor } from '@/utils/color.utils'

/**
 * Convert Clipping type to StoredClipping type for DB storage.
 */
function toStoredClipping(clipping: Clipping, bookId: number): Omit<StoredClipping, 'id'> {
  return {
    bookId,
    originalId: clipping.id,
    type: clipping.type === 'clip' || clipping.type === 'article' ? 'highlight' : clipping.type,
    content: clipping.content,
    date: clipping.date ?? new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...(clipping.location?.raw ? { location: clipping.location.raw } : {}),
    ...(clipping.page !== undefined && clipping.page !== null ? { page: clipping.page } : {}),
    ...(clipping.note ? { note: clipping.note } : {}),
    ...(clipping.tags ? { tags: clipping.tags } : {})
  }
}

/**
 * Save clippings to IndexedDB, creating books as needed.
 */
export async function saveClippings(clippings: Clipping[]): Promise<{
  booksCount: number
  clippingsCount: number
}> {
  // Group clippings by book (title + author)
  const bookMap = new Map<string, { title: string, author: string, clippings: Clipping[] }>()

  for (const clipping of clippings) {
    const key = `${clipping.title}::${clipping.author}`
    if (!bookMap.has(key)) {
      bookMap.set(key, {
        title: clipping.title,
        author: clipping.author,
        clippings: []
      })
    }
    bookMap.get(key)!.clippings.push(clipping)
  }

  let booksCount = 0
  let clippingsCount = 0

  // Use transaction for atomic operations
  await db.transaction('rw', [db.books, db.clippings], async () => {
    for (const [, bookData] of bookMap) {
      // Check if book exists
      let book = await db.books
        .where({ title: bookData.title, author: bookData.author })
        .first()

      if (!book) {
        // Create new book
        const latestDate = bookData.clippings
          .map((c) => c.date)
          .filter((d): d is Date => d !== null)
          .sort((a, b) => b.getTime() - a.getTime())[0] ?? new Date()

        const bookId = await db.books.add({
          title: bookData.title,
          author: bookData.author,
          coverColor: generateCoverColor(bookData.title),
          clippingCount: bookData.clippings.length,
          lastReadDate: latestDate,
          createdAt: new Date(),
          updatedAt: new Date()
        })

        book = await db.books.get(bookId)
        booksCount++
      }

      if (!book?.id) continue

      // Save clippings for this book
      const storedClippings = bookData.clippings.map((c) => toStoredClipping(c, book.id!))

      // Check for existing clippings (by originalId) to avoid duplicates
      for (const sc of storedClippings) {
        const existing = await db.clippings
          .where({ bookId: book.id, originalId: sc.originalId })
          .first()

        if (!existing) {
          await db.clippings.add(sc as StoredClipping)
          clippingsCount++
        }
      }

      // Update book clipping count
      const totalClippings = await db.clippings.where({ bookId: book.id }).count()
      await db.books.update(book.id, {
        clippingCount: totalClippings,
        updatedAt: new Date()
      })
    }
  })

  return { booksCount, clippingsCount }
}

/**
 * Get all books from the database.
 */
export async function getAllBooks(): Promise<Book[]> {
  return db.books.orderBy('lastReadDate').reverse().toArray()
}

/**
 * Get a single book by ID.
 */
export async function getBookById(id: number): Promise<Book | undefined> {
  return db.books.get(id)
}

/**
 * Get all clippings for a specific book.
 */
export async function getClippingsByBookId(bookId: number): Promise<StoredClipping[]> {
  return db.clippings.where({ bookId }).toArray()
}

/**
 * Get all clippings from the database.
 */
export async function getAllClippings(): Promise<StoredClipping[]> {
  return db.clippings.orderBy('date').reverse().toArray()
}

/**
 * Get a single clipping by ID.
 */
export async function getClippingById(id: number): Promise<StoredClipping | undefined> {
  return db.clippings.get(id)
}

/**
 * Update a clipping by ID.
 */
export async function updateClipping(id: number, data: Partial<StoredClipping>): Promise<void> {
  await db.clippings.update(id, {
    ...data,
    updatedAt: new Date()
  })
}

/**
 * Add a single clipping to the database.
 */
export async function addClipping(clipping: Omit<StoredClipping, 'id'>): Promise<number> {
  return db.clippings.add(clipping as StoredClipping)
}

/**
 * Add multiple clippings to the database.
 */
export async function addClippings(clippings: Omit<StoredClipping, 'id'>[]): Promise<void> {
  await db.clippings.bulkAdd(clippings as StoredClipping[])
}

/**
 * Delete multiple clippings by IDs.
 */
export async function deleteClippings(ids: number[]): Promise<void> {
  await db.clippings.bulkDelete(ids)
}

/**
 * Clear all data from the database.
 */
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', [db.books, db.clippings], async () => {
    await db.books.clear()
    await db.clippings.clear()
  })
}

/**
 * Get database statistics.
 */
export async function getStats(): Promise<{
  totalBooks: number
  totalClippings: number
  totalHighlights: number
  totalNotes: number
  totalBookmarks: number
}> {
  const [totalBooks, totalClippings, highlights, notes, bookmarks] = await Promise.all([
    db.books.count(),
    db.clippings.count(),
    db.clippings.where('type').equals('highlight').count(),
    db.clippings.where('type').equals('note').count(),
    db.clippings.where('type').equals('bookmark').count()
  ])

  return {
    totalBooks,
    totalClippings,
    totalHighlights: highlights,
    totalNotes: notes,
    totalBookmarks: bookmarks
  }
}

/**
 * Save a batch history entry.
 */
import type { BatchHistoryEntry } from '@/db/schema'

export async function saveBatchHistory(entry: BatchHistoryEntry): Promise<void> {
  await db.batchHistory.put(entry)
}

/**
 * Get batch history sorted by date (newest first).
 */
export async function getBatchHistory(): Promise<BatchHistoryEntry[]> {
  return db.batchHistory.orderBy('createdAt').reverse().toArray()
}

/**
 * Get all unique tags from clippings.
 */
export async function getAllTags(): Promise<string[]> {
  const clippings = await db.clippings.toArray()
  const tagSet = new Set<string>()

  for (const clipping of clippings) {
    if (clipping.tags && Array.isArray(clipping.tags)) {
      for (const tag of clipping.tags) {
        tagSet.add(tag)
      }
    }
  }

  return Array.from(tagSet).sort()
}
