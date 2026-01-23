import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BookCard from '@/components/books/BookCard.vue'
import type { Book } from '@/db/schema'

describe('BookCard', () => {
  const mockBook: Book = {
    id: 1,
    title: 'Test Book Title',
    author: 'Test Author',
    clippingCount: 5,
    lastReadDate: new Date(),
    coverColor: '#ff0000',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const createWrapper = (book: Book = mockBook) => {
    return mount(BookCard, {
      props: { book: book },
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
            props: ['to']
          }
        }
      }
    })
  }

  it('renders book title and author', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Test Book Title')
    expect(wrapper.text()).toContain('Test Author')
  })

  it('renders stats', () => {
    const wrapper = createWrapper()
    // New design only shows the number, maybe with icon, but text is just "5"
    expect(wrapper.text()).toContain('5')
  })

  it('handles unknown author', () => {
    const bookWithoutAuthor = { ...mockBook, author: undefined } as unknown as Book
    const wrapper = createWrapper(bookWithoutAuthor)
    expect(wrapper.text()).toContain('Unknown Author')
  })

  it('formats last read date correctly', () => {
    // Today
    const today = new Date()
    const wrapperToday = createWrapper({ ...mockBook, lastReadDate: today })
    expect(wrapperToday.text()).toContain('Today')

    // Yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const wrapperYesterday = createWrapper({ ...mockBook, lastReadDate: yesterday })
    expect(wrapperYesterday.text()).toContain('Yesterday')

    // Days ago
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const wrapperDaysAgo = createWrapper({ ...mockBook, lastReadDate: threeDaysAgo })
    expect(wrapperDaysAgo.text()).toContain('3 days ago')
  })
})
