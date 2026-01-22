import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DataTable from './DataTable.vue'
import type { StoredClipping } from '@/db/schema'
import { ref } from 'vue'

const mockStartEdit = vi.fn()

// Define mock data outside to be accessible in vi.mock if needed,
// using vi.hoisted or just defining behavior inside factory
const { useDataEditorMock } = vi.hoisted(() => {
  return {
    useDataEditorMock: vi.fn()
  }
})

vi.mock('@/composables/useDataEditor', () => ({
  useDataEditor: useDataEditorModule
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDataEditorModule(options: any) {
  // Call the spy to allow tracking/verification if needed, or just return state
  return useDataEditorMock(options)
}

// Mock Tooltip component since it might be global or complex
const TooltipStub = {
  template: '<div><slot /></div>',
  props: ['text', 'position']
}

describe('DataTable', () => {
  const mockClippings: StoredClipping[] = [
    {
      id: 1,
      bookId: 1,
      content: 'Clipping 1',
      location: '100',
      page: 10,
      type: 'highlight',
      date: new Date('2023-01-01'),
      tags: [],
      note: '',
      originalId: 'orig-1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      bookId: 1,
      content: 'Clipping 2',
      location: '200',
      page: 20,
      type: 'note',
      date: new Date('2023-01-02'),
      tags: [],
      note: '',
      originalId: 'orig-2',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  beforeEach(() => {
    mockStartEdit.mockClear()
    useDataEditorMock.mockReturnValue({
      editableClippings: ref(mockClippings.map((c) => ({
        ...c,
        isSelected: false,
        isEditing: false
      }))),
      selectAll: ref(false),
      isSaving: ref(false),
      hasSelection: ref(false),
      selectedCount: ref(0),
      initializeClippings: vi.fn(),
      toggleSelectAll: vi.fn(),
      toggleSelect: vi.fn(),
      startEdit: mockStartEdit,
      cancelEdit: vi.fn(),
      saveEdit: vi.fn(),
      deleteSelected: vi.fn(),
      duplicateSelected: vi.fn(),
      addClipping: vi.fn()
    })
  })

  const createWrapper = (clippings = mockClippings) => {
    return mount(DataTable, {
      props: { clippings, bookId: 1 },
      global: {
        components: {
          UiTooltip: TooltipStub
        },
        stubs: {
          Plus: true,
          Copy: true,
          Trash2: true,
          Edit3: true,
          Check: true,
          X: true
        }
      }
    })
  }

  it('renders table headers', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Tipo')
    expect(wrapper.text()).toContain('Contenido')
    expect(wrapper.text()).toContain('Ubicacion')
    expect(wrapper.text()).toContain('Fecha')
  })

  it('renders clippings rows', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Clipping 1')
    expect(wrapper.text()).toContain('Clipping 2')
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it.skip('calls startEdit when edit button is clicked', async () => {
    const wrapper = createWrapper()

    // Find and click the edit button
    const editIcon = wrapper.findComponent({ name: 'Edit3' })
    expect(editIcon.exists()).toBe(true)
    // Click the button containing the icon
    await editIcon.element.parentElement?.click()

    expect(mockStartEdit).toHaveBeenCalled()
  })
})
