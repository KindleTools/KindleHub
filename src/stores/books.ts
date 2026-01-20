/**
 * Books Store - Pinia store for managing books state.
 */
import { defineStore } from 'pinia'

import type { Book } from '@/db/schema'
import { getAllBooks, getBookById } from '@/services/db.service'

export const useBooksStore = defineStore('books', () => {
  const books = ref<Book[]>([])
  const selectedBook = ref<Book | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const totalBooks = computed(() => books.value.length)

  const totalClippings = computed(() =>
    books.value.reduce((sum, book) => sum + book.clippingCount, 0)
  )

  /**
   * Load all books from the database.
   */
  async function loadBooks() {
    isLoading.value = true
    error.value = null

    try {
      books.value = await getAllBooks()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load books'
      console.error('Failed to load books:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Select a book by ID.
   */
  async function selectBook(id: number) {
    isLoading.value = true
    error.value = null

    try {
      const book = await getBookById(id)
      selectedBook.value = book ?? null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load book'
      console.error('Failed to load book:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear selection.
   */
  function clearSelection() {
    selectedBook.value = null
  }

  return {
    books,
    selectedBook,
    isLoading,
    error,
    totalBooks,
    totalClippings,
    loadBooks,
    selectBook,
    clearSelection
  }
})
