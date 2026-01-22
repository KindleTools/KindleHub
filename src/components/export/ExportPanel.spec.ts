import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ExportPanel from './ExportPanel.vue'
import type { Clipping } from 'kindle-tools-ts'
import { exportClippings, previewExport, downloadExport } from '@/services/export.service'

// Mock the export service
vi.mock('@/services/export.service', () => ({
  exportClippings: vi.fn(),
  previewExport: vi.fn(),
  downloadExport: vi.fn()
}))

describe('ExportPanel', () => {
  const mockClippings: Clipping[] = [
    {
      id: '1',
      title: 'Book Title',
      titleRaw: 'Book Title',
      author: 'Author',
      authorRaw: 'Author',
      contentRaw: 'Test content',
      location: { raw: '123', start: 123, end: null },
      page: 1,
      type: 'highlight',
      content: 'Test content',
      dateRaw: 'Sunday',
      isLimitReached: false,
      isEmpty: false,
      date: new Date(),
      language: 'en',
      source: 'kindle',
      wordCount: 10,
      charCount: 50,
      blockIndex: 0
    },
    {
      id: '2',
      title: 'Book Title',
      titleRaw: 'Book Title',
      author: 'Author',
      authorRaw: 'Author',
      contentRaw: 'Another clipping',
      location: { raw: '124', start: 124, end: null },
      page: 2,
      type: 'note',
      content: 'Another clipping',
      dateRaw: 'Monday',
      isLimitReached: false,
      isEmpty: false,
      date: new Date(),
      language: 'en',
      source: 'kindle',
      wordCount: 10,
      charCount: 50,
      blockIndex: 1
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(previewExport).mockResolvedValue('Markdown Preview')
  })

  const createWrapper = (clippings = mockClippings) => {
    return mount(ExportPanel, {
      props: { clippings },
      global: {
        stubs: {
          ExportFormatPicker: {
            props: ['modelValue'],
            template: '<div class="format-picker" @click="$emit(\'update:modelValue\', \'csv\')">Picker</div>'
          },
          Loader2: true,
          Download: true,
          Eye: true,
          EyeOff: true,
          AlertCircle: true
        }
      }
    })
  }

  it('renders clipping count correctly', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('2 clippings ready to export')
  })

  it('loads preview on mount', async () => {
    createWrapper()
    expect(previewExport).toHaveBeenCalledWith(mockClippings, 'markdown')
    await flushPromises()
    expect(previewExport).toHaveBeenCalled()
  })

  it('toggles preview visibility', async () => {
    const wrapper = createWrapper()
    await flushPromises() // Wait for initial preview

    expect(wrapper.find('pre').exists()).toBe(true)

    const toggleBtn = wrapper.find('button.text-gray-600')
    await toggleBtn.trigger('click')

    expect(wrapper.find('pre').exists()).toBe(false)
    expect(wrapper.text()).toContain('Show')
  })

  it('updates preview when format changes', async () => {
    const wrapper = createWrapper()
    await flushPromises()

    // Simulate format change via mock component interaction
    const picker = wrapper.find('.format-picker')
    await picker.trigger('click')

    expect(previewExport).toHaveBeenCalledWith(mockClippings, 'csv')
  })

  it('handles export process correctly', async () => {
    const result = {
      data: 'Export Result',
      filename: 'export.md',
      format: 'markdown',
      content: 'Export Result',
      files: [],
      mimeType: 'text/markdown',
      isMultiFile: false
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(exportClippings).mockResolvedValue(result as any)
    const wrapper = createWrapper()

    const exportBtn = wrapper.find('button.bg-primary-600')
    await exportBtn.trigger('click')

    expect(exportClippings).toHaveBeenCalledWith(mockClippings, 'markdown')
    await flushPromises()
    expect(downloadExport).toHaveBeenCalledWith(result)
  })

  it('handles empty clippings', async () => {
    const wrapper = createWrapper([])

    // Check message
    expect(wrapper.text()).toContain('0 clippings ready to export') // 0 is not 1, so plural 's' is added

    // Check preview
    expect(wrapper.text()).toContain('No clippings to preview')

    // Check button disabled
    const exportBtn = wrapper.find('button.bg-gray-300')
    expect(exportBtn.attributes('disabled')).toBeDefined()
  })

  it('displays error message on export failure', async () => {
    vi.mocked(exportClippings).mockRejectedValue(new Error('Export failed'))
    const wrapper = createWrapper()

    const exportBtn = wrapper.find('button.bg-primary-600')
    await exportBtn.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Export failed')
  })
})
