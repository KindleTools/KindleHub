import Dexie, { type Table } from 'dexie'

/**
 * Book stored in IndexedDB
 */
export interface Book {
  id?: number
  title: string
  author: string
  coverColor?: string
  clippingCount: number
  lastReadDate: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * Clipping stored in IndexedDB
 */
export interface StoredClipping {
  id?: number
  bookId: number
  originalId: string // ID from kindle-tools-ts
  type: 'highlight' | 'note' | 'bookmark'
  content: string
  location?: string
  page?: number
  date: Date
  note?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Batch History stored in IndexedDB
 */
export interface BatchHistoryEntry {
  id: string
  createdAt: Date
  fileName: string
  fileSize: number
  status: 'imported' | 'exported' | 'discarded'
  clippingCount: number
  bookCount: number
  importedAt?: Date
  exportedFormat?: string
}

/**
 * KindleHub Database using Dexie.js
 */
export class KindleHubDB extends Dexie {
  books!: Table<Book>
  clippings!: Table<StoredClipping>
  batchHistory!: Table<BatchHistoryEntry>

  constructor() {
    super('KindleHubDB')

    this.version(1).stores({
      books: '++id, title, author, lastReadDate',
      clippings: '++id, bookId, originalId, type, date, [bookId+type]'
    })

    this.version(2).stores({
      batchHistory: 'id, createdAt, status, fileName'
    })

    this.version(3).stores({
      clippings: '++id, bookId, originalId, type, date, [bookId+type], [bookId+originalId]'
    })
  }
}

export const db = new KindleHubDB()
