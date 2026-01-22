/**
 * Batch Service - Utility functions for batch processing.
 *
 * Provides helper functions for batch operations like ID generation,
 * duplicate detection, and book key creation.
 */

/**
 * Generate a unique batch ID using crypto API.
 */
export function generateBatchId(): string {
  return crypto.randomUUID()
}

/**
 * Generate a unique clipping ID for use within a batch.
 */
export function generateClippingId(): string {
  return crypto.randomUUID()
}

/**
 * Create a unique book key from title and author.
 */
export function createBookKey(title: string, author: string): string {
  const normalizedTitle = title.toLowerCase().trim()
  const normalizedAuthor = author.toLowerCase().trim()
  return `${normalizedTitle}::${normalizedAuthor}`
}

/**
 * Normalize a string for comparison (lowercase, trimmed, single spaces).
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/**
 * Check if two clippings might be duplicates based on content.
 */
export function arePotentialDuplicates(
  content1: string,
  content2: string,
  threshold = 0.9
): boolean {
  const n1 = normalizeString(content1)
  const n2 = normalizeString(content2)

  // Exact match
  if (n1 === n2) return true

  // Length difference too large
  const lenDiff = Math.abs(n1.length - n2.length)
  const maxLen = Math.max(n1.length, n2.length)
  if (lenDiff / maxLen > 1 - threshold) return false

  // Simple similarity check (could use Levenshtein in future)
  const shorter = n1.length < n2.length ? n1 : n2
  const longer = n1.length < n2.length ? n2 : n1

  return longer.includes(shorter)
}

/**
 * Format file size in human readable format.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Format a date for display.
 */
export function formatBatchDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
