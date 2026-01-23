import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DataTable from '@/components/editor/DataTable.vue'
import { computed, ref } from 'vue'

// Mock composables
const mockStartEdit = vi.fn()
const mockCancelEdit = vi.fn()
const mockSaveEdit = vi.fn()
const mockDeleteSelected = vi.fn()
const mockToggleSelect = vi.fn()
const mockToggleSelectAll = vi.fn()
// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

vi.mock('@/composables/useDataEditor', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useDataEditor: (options: any) => ({
    editableClippings: computed(() => {
      const source = options?.clippings?.value || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return source.map((c: any) => ({
        ...c,
        isSelected: false,
        isEditing: false
      }))
    }),
    selectAll: ref(false),
    isSaving: ref(false),
    error: ref(null),
    hasSelection: computed(() => false),
    selectedCount: computed(() => 0),
    selectedClippings: computed(() => []),
    editingClipping: computed(() => undefined),
    initializeClippings: vi.fn(),
    syncWithSource: vi.fn(),
    toggleSelectAll: mockToggleSelectAll,
    toggleSelect: mockToggleSelect,
    clearSelection: vi.fn(),
    startEdit: mockStartEdit,
    cancelEdit: mockCancelEdit,
    saveEdit: mockSaveEdit,
    deleteSelected: mockDeleteSelected,
    duplicateSelected: vi.fn(),
    addClipping: vi.fn()
  })
}))

// Mock Date formatter since standard mocking might be verbose
vi.mock('@/utils/date.utils', () => ({
  formatDate: (_date: Date) => '2023-01-01'
}))

describe('DataTable.vue', () => {
  const mockClippings = [
    {
      id: 1,
      content: 'Test Content 1',
      book: 'Book 1',
      author: 'Author 1',
      page: '10',
      date: new Date('2023-01-01'),
      type: 'highlight',
      isSelected: false,
      isEditing: false
    },
    {
      id: 2,
      content: 'Test Content 2',
      book: 'Book 1',
      author: 'Author 1',
      page: '11',
      date: new Date('2023-01-02'),
      type: 'note',
      isSelected: false,
      isEditing: false
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any[]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders clippings correctly', () => {
    const wrapper = mount(DataTable, {
      props: { clippings: mockClippings },
      global: {
        mocks: {
          $t: (key: string) => key
        },
        stubs: {
          UiTooltip: { template: '<div><slot /></div>' }
        }
      }
    })

    // Check if component renders anything
    expect(wrapper.element).toBeDefined()

    // Check text content
    expect(wrapper.text()).toContain('Test Content 1')
  })

  it('renders empty state when no clippings', () => {
    const wrapper = mount(DataTable, {
      props: { clippings: [] },
      global: {
        mocks: {
          $t: (key: string) => key
        },
        stubs: {
          UiTooltip: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('datatable.empty')
  })

  it('calls toggleSelect when checkbox clicked', async () => {
    const wrapper = mount(DataTable, {
      props: { clippings: mockClippings },
      global: {
        mocks: {
          $t: (key: string) => key
        },
        stubs: {
          UiTooltip: { template: '<div><slot /></div>' }
        }
      }
    })

    const checkbox = wrapper.find('tbody tr input[type="checkbox"]')
    await checkbox.setValue(true)

    expect(mockToggleSelect).toHaveBeenCalledWith(1)
  })

  it('calls startEdit when edit button clicked', async () => {
    const wrapper = mount(DataTable, {
      props: { clippings: mockClippings },
      global: {
        mocks: {
          $t: (key: string) => key
        },
        stubs: {
          UiTooltip: { template: '<div><slot /></div>' }
        }
      }
    })

    const editBtn = wrapper.find('button[aria-label="common.edit"]')
    await editBtn.trigger('click')

    expect(mockStartEdit).toHaveBeenCalledWith(1)
  })
})
