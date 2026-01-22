/**
 * Batch Types - Type definitions for the batch processing system.
 *
 * These types define the structure for temporary batch data that exists
 * in memory before being committed to IndexedDB.
 */
import type { Clipping } from 'kindle-tools-ts'

/** Status of a batch in the workflow */
export type BatchStatus = 'pending' | 'imported' | 'exported' | 'discarded'

/** Warning severity levels */
export type WarningSeverity = 'info' | 'warning' | 'error'

/**
 * A parsing warning or error from the import process
 */
export interface BatchWarning {
  id: string
  severity: WarningSeverity
  message: string
  clippingId?: string
  details?: string
}

/**
 * Statistics about a batch
 */
export interface BatchStats {
  totalClippings: number
  totalBooks: number
  duplicatesRemoved: number
  linkedNotes: number
  byType: {
    highlights: number
    notes: number
    bookmarks: number
  }
}

/**
 * A clipping within a batch with additional metadata
 */
export interface BatchClipping extends Clipping {
  /** Unique ID for this clipping within the batch */
  batchClippingId: string
  /** Whether this clipping is selected for bulk actions */
  isSelected: boolean
  /** Whether this clipping has been modified */
  isModified: boolean
  /** Associated warnings for this clipping */
  warnings: string[]
}

/**
 * A book grouping within a batch
 */
export interface BatchBook {
  /** Unique key derived from title + author */
  key: string
  title: string
  author: string
  clippingIds: string[]
  isExpanded: boolean
}

/**
 * The main batch object containing all imported data
 */
export interface Batch {
  /** Unique batch ID (UUID) */
  id: string
  /** When the batch was created */
  createdAt: Date
  /** Original file name */
  fileName: string
  /** File size in bytes */
  fileSize: number
  /** Current batch status */
  status: BatchStatus
  /** All clippings in this batch, keyed by batchClippingId */
  clippings: Map<string, BatchClipping>
  /** Books in this batch, keyed by book key */
  books: Map<string, BatchBook>
  /** Batch statistics */
  stats: BatchStats
  /** Parsing warnings and errors */
  warnings: BatchWarning[]
}

/**
 * Simplified batch metadata for history storage
 */
export interface BatchHistoryEntry {
  id: string
  createdAt: Date
  fileName: string
  fileSize: number
  status: BatchStatus
  clippingCount: number
  bookCount: number
  importedAt?: Date | undefined
  exportedFormat?: string | undefined
}
