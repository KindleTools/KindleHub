/**
 * Clippings Store - Pinia store for managing clippings state.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { StoredClipping } from '@/db/schema'
import type { ClippingsStats } from '@/types'
import { getAllClippings, getClippingsByBookId, getStats } from '@/services/db.service'

export const useClippingsStore = defineStore('clippings', () => {
  const clippings = ref<StoredClipping[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const stats = ref<ClippingsStats>({
    totalClippings: 0,
    totalHighlights: 0,
    totalNotes: 0,
    totalBookmarks: 0
  })

  // Filtered views
  const highlights = computed(() =>
    clippings.value.filter((c) => c.type === 'highlight')
  )

  const notes = computed(() =>
    clippings.value.filter((c) => c.type === 'note')
  )

  const bookmarks = computed(() =>
    clippings.value.filter((c) => c.type === 'bookmark')
  )

  /**
   * Load all clippings from the database.
   */
  async function loadAllClippings() {
    isLoading.value = true
    error.value = null

    try {
      clippings.value = await getAllClippings()
      await loadStats()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load clippings'
      console.error('Failed to load clippings:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load clippings for a specific book.
   */
  async function loadClippingsForBook(bookId: number) {
    isLoading.value = true
    error.value = null

    try {
      clippings.value = await getClippingsByBookId(bookId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load clippings'
      console.error('Failed to load clippings:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load database statistics.
   */
  async function loadStats() {
    try {
      const dbStats = await getStats()
      stats.value = {
        totalClippings: dbStats.totalClippings,
        totalHighlights: dbStats.totalHighlights,
        totalNotes: dbStats.totalNotes,
        totalBookmarks: dbStats.totalBookmarks
      }
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  /**
   * Clear clippings from state (not from DB).
   */
  function clearClippings() {
    clippings.value = []
  }

  return {
    clippings,
    isLoading,
    error,
    stats,
    highlights,
    notes,
    bookmarks,
    loadAllClippings,
    loadClippingsForBook,
    loadStats,
    clearClippings
  }
})
