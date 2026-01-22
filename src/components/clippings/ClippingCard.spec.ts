import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ClippingCard from './ClippingCard.vue'
import type { StoredClipping } from '@/db/schema'

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
      props: { clipping }
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
