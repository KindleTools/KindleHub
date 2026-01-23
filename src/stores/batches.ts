/**
 * Batches Store - Pinia store for managing temporary batch state.
 *
 * This store holds imported clippings in memory before they are committed
 * to IndexedDB. It enables preview, editing, and bulk actions.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Clipping } from 'kindle-tools-ts'

import type {
  Batch,
  BatchClipping,
  BatchBook,
  BatchStats,
  BatchWarning,
  BatchHistoryEntry
} from '@/types/batch'
import { generateBatchId, generateClippingId, createBookKey, arePotentialDuplicates } from '@/services/batch.service'
import { saveClippings, saveBatchHistory, getBatchHistory } from '@/services/db.service'
import { useBooksStore } from '@/stores/books'

export const useBatchesStore = defineStore('batches', () => {
  // Current batch being edited (in memory)
  const currentBatch = ref<Batch | null>(null)

  // History of processed batches (metadata only)
  const batchHistory = ref<BatchHistoryEntry[]>([])

  // Load history on mount
  getBatchHistory().then((history) => {
    batchHistory.value = history
  })

  // UI state
  const isProcessing = ref(false)
  const processingProgress = ref(0)

  // Computed: Get all clippings as array
  const clippingsArray = computed(() => {
    if (!currentBatch.value) return []
    return Array.from(currentBatch.value.clippings.values())
  })

  // Computed: Get all books as array
  const booksArray = computed(() => {
    if (!currentBatch.value) return []
    return Array.from(currentBatch.value.books.values())
  })

  // Computed: Get selected clippings
  const selectedClippings = computed(() => {
    return clippingsArray.value.filter((c) => c.isSelected)
  })

  // Computed: Selection count
  const selectionCount = computed(() => selectedClippings.value.length)

  // Computed: Has current batch
  const hasBatch = computed(() => currentBatch.value !== null)

  /**
   * Create a new batch from parsed clippings.
   */
  function createBatch(
    clippings: Clipping[],
    fileName: string,
    fileSize: number,
    stats: { duplicatesRemoved: number, linkedNotes: number }
  ): string {
    const batchId = generateBatchId()
    const batchClippings = new Map<string, BatchClipping>()
    const batchBooks = new Map<string, BatchBook>()
    const warnings: BatchWarning[] = []

    // Group by type for stats
    let highlights = 0
    let notes = 0
    let bookmarks = 0

    for (const clipping of clippings) {
      const batchClippingId = generateClippingId()
      const bookKey = createBookKey(clipping.title, clipping.author)

      // Create batch clipping
      const batchClipping: BatchClipping = {
        ...clipping,
        batchClippingId,
        isSelected: false,
        isModified: false,
        warnings: []
      }
      batchClippings.set(batchClippingId, batchClipping)

      // Group into books
      if (!batchBooks.has(bookKey)) {
        batchBooks.set(bookKey, {
          key: bookKey,
          title: clipping.title,
          author: clipping.author,
          clippingIds: [],
          isExpanded: true
        })
      }
      batchBooks.get(bookKey)!.clippingIds.push(batchClippingId)

      // Count types
      switch (clipping.type) {
        case 'highlight': highlights++; break
        case 'note': notes++; break
        case 'bookmark': bookmarks++; break
      }

      // Check for potential issues
      if (!clipping.content || clipping.content.trim() === '') {
        const warningId = generateClippingId()
        warnings.push({
          id: warningId,
          severity: 'warning',
          message: 'Empty content',
          clippingId: batchClippingId
        })
        batchClipping.warnings.push(warningId)
      }
    }

    const batchStats: BatchStats = {
      totalClippings: clippings.length,
      totalBooks: batchBooks.size,
      duplicatesRemoved: stats.duplicatesRemoved,
      linkedNotes: stats.linkedNotes,
      byType: { highlights, notes, bookmarks }
    }

    currentBatch.value = {
      id: batchId,
      createdAt: new Date(),
      fileName,
      fileSize,
      status: 'pending',
      clippings: batchClippings,
      books: batchBooks,
      stats: batchStats,
      warnings
    }

    // Detect potential duplicates within the batch
    detectDuplicates()

    return batchId
  }

  /**
   * Update a single clipping's fields.
   */
  function updateClipping(clippingId: string, updates: Partial<Clipping>): void {
    if (!currentBatch.value) return

    const clipping = currentBatch.value.clippings.get(clippingId)
    if (!clipping) return

    // Track if type is changing
    const typeChanged = 'type' in updates && updates.type !== clipping.type

    Object.assign(clipping, updates, { isModified: true })

    // If title or author changed, update book groupings
    if ('title' in updates || 'author' in updates) {
      rebuildBookGroupings()
    }

    // If type changed, recalculate stats
    if (typeChanged) {
      recalculateStats()
    }
  }

  /**
   * Rebuild book groupings after title/author changes.
   * Preserves the isExpanded state of existing books.
   */
  function rebuildBookGroupings(): void {
    if (!currentBatch.value) return

    // Preserve existing expansion state
    const expandedState = new Map<string, boolean>()
    for (const [key, book] of currentBatch.value.books) {
      expandedState.set(key, book.isExpanded)
    }

    const newBooks = new Map<string, BatchBook>()

    for (const clipping of currentBatch.value.clippings.values()) {
      const bookKey = createBookKey(clipping.title, clipping.author)

      if (!newBooks.has(bookKey)) {
        newBooks.set(bookKey, {
          key: bookKey,
          title: clipping.title,
          author: clipping.author,
          clippingIds: [],
          isExpanded: expandedState.get(bookKey) ?? true
        })
      }
      newBooks.get(bookKey)!.clippingIds.push(clipping.batchClippingId)
    }

    currentBatch.value.books = newBooks
    currentBatch.value.stats.totalBooks = newBooks.size
  }

  /**
   * Apply bulk updates to multiple clippings.
   */
  function bulkUpdateClippings(clippingIds: string[], updates: Partial<Clipping>): void {
    if (!currentBatch.value) return

    let needsRebuild = false
    const needsRecalculate = 'type' in updates

    for (const id of clippingIds) {
      const clipping = currentBatch.value.clippings.get(id)
      if (clipping) {
        Object.assign(clipping, updates, { isModified: true })

        if ('title' in updates || 'author' in updates) {
          needsRebuild = true
        }
      }
    }

    if (needsRebuild) {
      rebuildBookGroupings()
    }

    if (needsRecalculate) {
      recalculateStats()
    }
  }

  /**
   * Delete clippings from the batch.
   */
  function deleteClippings(clippingIds: string[]): void {
    if (!currentBatch.value) return

    for (const id of clippingIds) {
      currentBatch.value.clippings.delete(id)
    }

    rebuildBookGroupings()
    recalculateStats()
  }

  /**
   * Recalculate batch statistics.
   */
  function recalculateStats(): void {
    if (!currentBatch.value) return

    let highlights = 0
    let notes = 0
    let bookmarks = 0

    for (const clipping of currentBatch.value.clippings.values()) {
      switch (clipping.type) {
        case 'highlight': highlights++; break
        case 'note': notes++; break
        case 'bookmark': bookmarks++; break
      }
    }

    currentBatch.value.stats.totalClippings = currentBatch.value.clippings.size
    currentBatch.value.stats.byType = { highlights, notes, bookmarks }
  }

  /**
   * Detect potential duplicates within the batch.
   * Compares clippings within the same book using arePotentialDuplicates.
   */
  function detectDuplicates(): void {
    if (!currentBatch.value) return

    const clippings = Array.from(currentBatch.value.clippings.values())
    const byBook = new Map<string, BatchClipping[]>()

    // Group clippings by book for comparison
    for (const clipping of clippings) {
      const bookKey = createBookKey(clipping.title, clipping.author)
      if (!byBook.has(bookKey)) {
        byBook.set(bookKey, [])
      }
      byBook.get(bookKey)!.push(clipping)
    }

    // Compare within each book
    for (const [, bookClippings] of byBook) {
      for (let i = 0; i < bookClippings.length; i++) {
        for (let j = i + 1; j < bookClippings.length; j++) {
          const c1 = bookClippings[i]
          const c2 = bookClippings[j]

          if (arePotentialDuplicates(c1.content, c2.content)) {
            const warningId = generateClippingId()
            currentBatch.value!.warnings.push({
              id: warningId,
              severity: 'warning',
              message: 'Potential duplicate content',
              details: `Similar to another clipping in "${c1.title}"`,
              clippingId: c1.batchClippingId
            })
            c1.warnings.push(warningId)
          }
        }
      }
    }
  }

  /**
   * Toggle selection for a clipping.
   */
  function toggleSelection(clippingId: string): void {
    if (!currentBatch.value) return

    const clipping = currentBatch.value.clippings.get(clippingId)
    if (clipping) {
      clipping.isSelected = !clipping.isSelected
    }
  }

  /**
   * Select all clippings.
   */
  function selectAll(): void {
    if (!currentBatch.value) return

    for (const clipping of currentBatch.value.clippings.values()) {
      clipping.isSelected = true
    }
  }

  /**
   * Deselect all clippings.
   */
  function deselectAll(): void {
    if (!currentBatch.value) return

    for (const clipping of currentBatch.value.clippings.values()) {
      clipping.isSelected = false
    }
  }

  /**
   * Select all clippings for a specific book.
   */
  function selectBook(bookKey: string): void {
    if (!currentBatch.value) return

    const book = currentBatch.value.books.get(bookKey)
    if (!book) return

    for (const id of book.clippingIds) {
      const clipping = currentBatch.value.clippings.get(id)
      if (clipping) clipping.isSelected = true
    }
  }

  /**
   * Toggle book expansion in the UI.
   */
  function toggleBookExpanded(bookKey: string): void {
    if (!currentBatch.value) return

    const book = currentBatch.value.books.get(bookKey)
    if (book) {
      book.isExpanded = !book.isExpanded
    }
  }

  /**
   * Commit the batch to IndexedDB.
   */
  async function commitToDatabase(): Promise<{ booksCount: number, clippingsCount: number }> {
    if (!currentBatch.value) {
      throw new Error('No batch to commit')
    }

    isProcessing.value = true
    processingProgress.value = 0

    try {
      // Convert Map to array of Clipping objects
      const clippings: Clipping[] = Array.from(currentBatch.value.clippings.values())
        .map(({ batchClippingId: _b, isSelected: _s, isModified: _m, warnings: _w, ...clipping }) => clipping)

      processingProgress.value = 30

      // Save to IndexedDB
      const result = await saveClippings(clippings)

      processingProgress.value = 80

      // Update batch status
      currentBatch.value.status = 'imported'

      // Add to history
      await addToHistory('imported')

      // Refresh books store
      const booksStore = useBooksStore()
      await booksStore.loadBooks()

      processingProgress.value = 100

      return result
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Add current batch to history.
   */
  async function addToHistory(
    status: 'imported' | 'exported' | 'discarded',
    exportFormat?: string
  ): Promise<void> {
    if (!currentBatch.value) return

    const entry: BatchHistoryEntry = {
      id: currentBatch.value.id,
      createdAt: currentBatch.value.createdAt,
      fileName: currentBatch.value.fileName,
      fileSize: currentBatch.value.fileSize,
      status,
      clippingCount: currentBatch.value.stats.totalClippings,
      bookCount: currentBatch.value.stats.totalBooks,
      importedAt: status === 'imported' ? new Date() : undefined,
      exportedFormat: exportFormat
    }

    // Update local state
    batchHistory.value.unshift(entry)
    // Cast explicitly to schema type because types are compatible but separate definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await saveBatchHistory(entry as any)
  }

  /**
   * Discard the current batch without saving.
   */
  async function discardBatch(): Promise<void> {
    if (currentBatch.value) {
      currentBatch.value.status = 'discarded'
      await addToHistory('discarded')
    }
    currentBatch.value = null
  }

  /**
   * Clear the current batch (for navigation, etc).
   */
  function clearBatch(): void {
    currentBatch.value = null
  }

  return {
    // State
    currentBatch,
    batchHistory,
    isProcessing,
    processingProgress,

    // Computed
    clippingsArray,
    booksArray,
    selectedClippings,
    selectionCount,
    hasBatch,

    // Actions
    createBatch,
    updateClipping,
    bulkUpdateClippings,
    deleteClippings,
    toggleSelection,
    selectAll,
    deselectAll,
    selectBook,
    toggleBookExpanded,
    commitToDatabase,
    discardBatch,
    clearBatch,
    detectDuplicates
  }
})
