import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ClippingCard from '@/components/clippings/ClippingCard.vue'
import type { StoredClipping } from '@/db/schema'

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (key === 'clipping.page') return `Page ${params?.page}`
      if (key === 'clipping.location') return `Location ${params?.loc}`
      if (key === 'clipping.highlight') return 'Highlight'
      if (key === 'clipping.note') return 'Note'
      if (key === 'clipping.bookmark') return 'Bookmark'
      if (key === 'clipping.your_note') return 'Your note'
      if (key === 'clipping.no_content') return 'No content'
      return key
    }
  })
}))

describe('ClippingCard', () => {
  const mockClipping: StoredClipping = {
    id: 1,
    bookId: 1,
    content: 'Test content',
    location: '123456',
    page: 10,
    type: 'highlight',
    date: new Date('2023-01-01'),
    tags: ['test', 'tag'],
    note: 'My note',
    originalId: 'orig-1',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const createWrapper = (clipping: StoredClipping = mockClipping) => {
    return mount(ClippingCard, {
      props: { clipping },
      global: {
        mocks: {
          $t: (key: string, params?: Record<string, string>) => {
            if (key === 'clipping.page') return `Page ${params?.page}`
            if (key === 'clipping.location') return `Location ${params?.loc}`
            if (key === 'clipping.highlight') return 'Highlight'
            if (key === 'clipping.note') return 'Note'
            if (key === 'clipping.bookmark') return 'Bookmark'
            if (key === 'clipping.your_note') return 'Your note'
            if (key === 'clipping.no_content') return 'No content'
            return key
          }
        }
      }
    })
  }

  it('renders content correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Test content')
  })

  it('renders "No content" when content is empty', () => {
    const emptyClipping = { ...mockClipping, content: '' }
    const wrapper = createWrapper(emptyClipping)
    expect(wrapper.text()).toContain('No content')
  })

  it('renders tags correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('#test')
    expect(wrapper.text()).toContain('#tag')
  })

  it('renders note correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Your note')
    expect(wrapper.text()).toContain('My note')
  })

  it('renders location info', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Page 10')
  })

  it('renders different types with correct labels', async () => {
    // Highlight
    let wrapper = createWrapper()
    expect(wrapper.text()).toContain('Highlight')

    // Note
    wrapper = createWrapper({ ...mockClipping, type: 'note' })
    expect(wrapper.text()).toContain('Note')

    // Bookmark
    wrapper = createWrapper({ ...mockClipping, type: 'bookmark' })
    expect(wrapper.text()).toContain('Bookmark')
  })
})
