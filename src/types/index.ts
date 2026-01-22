export type { Book, StoredClipping } from '@/db/schema'
export * from './batch'

/**
 * Result from importing a file
 */
export interface ImportResult {
  success: boolean
  booksCount: number
  clippingsCount: number
  errors?: string[]
}

/**
 * Export format options
 */
export type ExportFormat = 'markdown' | 'json' | 'csv' | 'obsidian' | 'joplin' | 'html'

/**
 * Export options passed to exporters
 */
export interface ExportOptions {
  format: ExportFormat
  bookIds?: number[]
  includeMetadata?: boolean
  groupByBook?: boolean
  folderStructure?: 'flat' | 'by-book' | 'by-author' | 'by-author-book'
}

/**
 * Search filters for clippings
 */
export interface SearchFilters {
  query?: string
  bookIds?: number[]
  types?: Array<'highlight' | 'note' | 'bookmark'>
  dateRange?: {
    start: Date
    end: Date
  }
}

/**
 * Statistics about clippings
 */
export interface ClippingsStats {
  totalClippings: number
  totalHighlights: number
  totalNotes: number
  totalBookmarks: number
}
