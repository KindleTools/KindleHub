/**
 * Database Service - IndexedDB operations using Dexie.
 *
 * Provides CRUD operations for books and clippings storage.
 */
import type { Clipping } from 'kindle-tools-ts'

import { db, type Book, type StoredClipping } from '@/db/schema'

/**
 * Generate a deterministic color from book title (for cover gradient).
 */
function generateCoverColor(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    const char = title.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 70%, 50%)`
}

/**
 * Convert Clipping type to StoredClipping type for DB storage.
 */
function toStoredClipping(clipping: Clipping, bookId: number): Omit<StoredClipping, 'id'> {
  return {
    bookId,
    originalId: clipping.id,
    type: clipping.type === 'clip' || clipping.type === 'article' ? 'highlight' : clipping.type,
    content: clipping.content,
    location: clipping.location?.raw,
    page: clipping.page ?? undefined,
    date: clipping.date ?? new Date(),
    note: clipping.note,
    tags: clipping.tags,
    createdAt: new Date(),
    updatedAt: new Date()
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
