import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ExportPanel from '@/components/export/ExportPanel.vue'
import * as exportService from '@/services/export.service'

// Mock services
vi.mock('@/services/export.service', () => ({
  exportClippings: vi.fn(),
  previewExport: vi.fn(),
  downloadExport: vi.fn()
}))

// Mock Date for consistent snapshots if needed (not needed for logic)
// Mock child components
const ExportFormatPickerStub = {
  template: '<div data-testid="format-picker"></div>',
  props: ['modelValue'],
  emits: ['update:modelValue']
}

describe('ExportPanel.vue', () => {
  const mockClippings = [
    {
      id: 1,
      content: 'Test highlight',
      book: 'Test Book',
      author: 'Test Author',
      page: '10',
      location: '100',
      date: new Date('2023-01-01'),
      type: 'highlight'
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any[]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(ExportPanel, {
      props: { clippings: mockClippings },
      global: {
        stubs: { ExportFormatPicker: ExportFormatPickerStub }
      }
    })

    expect(wrapper.text()).toContain('Export Highlights')
    expect(wrapper.text()).toContain('1 clipping ready to export')
    expect(wrapper.find('[data-testid="format-picker"]').exists()).toBe(true)
  })

  it('generates preview on mount', async () => {
    const previewText = '# Test Book\n\n> Test highlight'
    vi.mocked(exportService.previewExport).mockResolvedValue(previewText)

    const wrapper = mount(ExportPanel, {
      props: { clippings: mockClippings },
      global: {
        stubs: { ExportFormatPicker: ExportFormatPickerStub }
      }
    })

    // Wait for async preview generation
    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(exportService.previewExport).toHaveBeenCalledWith(mockClippings, 'markdown')
    expect(wrapper.text()).toContain(previewText)
  })

  it('updates preview when format changes', async () => {
    const wrapper = mount(ExportPanel, {
      props: { clippings: mockClippings },
      global: {
        stubs: { ExportFormatPicker: ExportFormatPickerStub }
      }
    })

    // Simulate format change
    // Using internal ref or triggering emit on stub
    wrapper.findComponent(ExportFormatPickerStub).vm.$emit('update:modelValue', 'json')

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(exportService.previewExport).toHaveBeenLastCalledWith(mockClippings, 'json')
  })

  it('handles export click', async () => {
    const mockExportData = new Blob(['test'], { type: 'text/plain' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(exportService.exportClippings).mockResolvedValue(mockExportData as any)

    const wrapper = mount(ExportPanel, {
      props: { clippings: mockClippings },
      global: {
        stubs: { ExportFormatPicker: ExportFormatPickerStub }
      }
    })

    const exportButton = wrapper.find('button.bg-primary-600') // Adjust selector based on classes
    expect(exportButton.exists()).toBe(true)

    await exportButton.trigger('click')

    expect(exportService.exportClippings).toHaveBeenCalledWith(mockClippings, 'markdown')
    expect(exportService.downloadExport).toHaveBeenCalledWith(mockExportData)
  })

  it('shows error if preview fails', async () => {
    vi.mocked(exportService.previewExport).mockRejectedValue(new Error('Preview failed'))

    const wrapper = mount(ExportPanel, {
      props: { clippings: mockClippings },
      global: {
        stubs: { ExportFormatPicker: ExportFormatPickerStub }
      }
    })

    await new Promise((resolve) => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Preview failed')
  })
})
