import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useDataEditor } from '@/composables/useDataEditor'

// Mock the db service module
vi.mock('@/services/db.service', () => ({
  updateClipping: vi.fn(),
  deleteClippings: vi.fn(),
  addClippings: vi.fn(),
  addClipping: vi.fn().mockResolvedValue(123),
  getClippingById: vi.fn().mockResolvedValue({
    id: 123,
    bookId: 1,
    content: '',
    type: 'highlight',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  })
}))

import {
  updateClipping,
  deleteClippings,
  addClippings,
  addClipping as dbAddClipping
} from '@/services/db.service'

describe('useDataEditor', () => {
  const mockClippings = [
    {
      id: 1,
      bookId: 101,
      content: 'Clipping 1',
      date: new Date('2023-01-01'),
      type: 'highlight',
      createdAt: new Date(),
      updatedAt: new Date(),
      originalId: 'orig-1'
    },
    {
      id: 2,
      bookId: 102,
      content: 'Clipping 2',
      date: new Date('2023-01-02'),
      type: 'note',
      createdAt: new Date(),
      updatedAt: new Date(),
      originalId: 'orig-2'
    }
  ] as any[]

  let clippingsRef: any
  let onUpdateMock: any

  beforeEach(() => {
    vi.clearAllMocks()
    clippingsRef = ref([...mockClippings])
    onUpdateMock = vi.fn()
  })

  it('initializes correctly', () => {
    const { editableClippings, initializeClippings } = useDataEditor({
      clippings: clippingsRef
    })

    initializeClippings(clippingsRef.value)

    expect(editableClippings.value.length).toBe(2)
    expect(editableClippings.value[0].isSelected).toBe(false)
    expect(editableClippings.value[0].isEditing).toBe(false)
    expect(editableClippings.value[1].content).toBe('Clipping 2')
  })

  describe('Selection', () => {
    it('toggles selection of a single item', () => {
      const { editableClippings, initializeClippings, toggleSelect } = useDataEditor({
        clippings: clippingsRef
      })
      initializeClippings(clippingsRef.value)

      toggleSelect(1)
      expect(editableClippings.value.find((c) => c.id === 1)?.isSelected).toBe(true)
      expect(editableClippings.value.find((c) => c.id === 2)?.isSelected).toBe(false)

      toggleSelect(1)
      expect(editableClippings.value.find((c) => c.id === 1)?.isSelected).toBe(false)
    })

    it('toggles select all', () => {
      const { editableClippings, initializeClippings, toggleSelectAll, selectAll } = useDataEditor({
        clippings: clippingsRef
      })
      initializeClippings(clippingsRef.value)

      // Select all
      toggleSelectAll()
      expect(selectAll.value).toBe(true)
      expect(editableClippings.value.every((c) => c.isSelected)).toBe(true)

      // Deselect all
      toggleSelectAll()
      expect(selectAll.value).toBe(false)
      expect(editableClippings.value.every((c) => c.isSelected)).toBe(false)
    })

    it('clears selection', () => {
      const { editableClippings, initializeClippings, toggleSelect, clearSelection, hasSelection } = useDataEditor({
        clippings: clippingsRef
      })
      initializeClippings(clippingsRef.value)

      toggleSelect(1)
      expect(hasSelection.value).toBe(true)

      clearSelection()
      expect(hasSelection.value).toBe(false)
      expect(editableClippings.value.find((c) => c.id === 1)?.isSelected).toBe(false)
    })
  })

  describe('Editing', () => {
    it('starts editing and backups original data', () => {
      const { editableClippings, initializeClippings, startEdit } = useDataEditor({
        clippings: clippingsRef
      })
      initializeClippings(clippingsRef.value)

      startEdit(1)
      const editing = editableClippings.value.find((c) => c.id === 1)
      expect(editing?.isEditing).toBe(true)
      expect(editing?.originalData).toBeDefined()
      expect(editing?.originalData?.content).toBe('Clipping 1')
    })

    it('cancels editing and restores data', () => {
      const { editableClippings, initializeClippings, startEdit, cancelEdit } = useDataEditor({
        clippings: clippingsRef
      })
      initializeClippings(clippingsRef.value)

      startEdit(1)
      const editing = editableClippings.value.find((c) => c.id === 1)
      if (editing) editing.content = 'Changed Content'

      cancelEdit()
      expect(editing?.content).toBe('Clipping 1') // Restored
      expect(editing?.isEditing).toBe(false)
      expect(editing?.originalData).toBeNull()
    })

    it('saves editing changes', async () => {
      const { editableClippings, initializeClippings, startEdit, saveEdit } = useDataEditor({
        clippings: clippingsRef,
        onUpdate: onUpdateMock
      })
      initializeClippings(clippingsRef.value)

      startEdit(1)
      const editing = editableClippings.value.find((c) => c.id === 1)
      if (editing) editing.content = 'Updated Content'

      await saveEdit(1)

      expect(updateClipping).toHaveBeenCalledWith(1, expect.objectContaining({
        content: 'Updated Content'
      }))
      expect(editing?.isEditing).toBe(false)
      expect(onUpdateMock).toHaveBeenCalled()
    })
  })

  describe('Bulk Actions', () => {
    it('deletes selected items', async () => {
      const { editableClippings, initializeClippings, toggleSelect, deleteSelected } = useDataEditor({
        clippings: clippingsRef,
        onUpdate: onUpdateMock
      })
      initializeClippings(clippingsRef.value)

      toggleSelect(1)
      await deleteSelected()

      expect(deleteClippings).toHaveBeenCalledWith([1])
      expect(editableClippings.value.length).toBe(1) // Removed from local state
      expect(editableClippings.value.find((c) => c.id === 1)).toBeUndefined()
      expect(onUpdateMock).toHaveBeenCalled()
    })

    it('duplicates selected items', async () => {
      const { initializeClippings, toggleSelect, duplicateSelected } = useDataEditor({
        clippings: clippingsRef,
        onUpdate: onUpdateMock
      })
      initializeClippings(clippingsRef.value)

      toggleSelect(1)
      await duplicateSelected()

      expect(addClippings).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          // Check that it's a copy
          content: 'Clipping 1',
          bookId: 101
        })
      ]))
      expect(onUpdateMock).toHaveBeenCalled()
    })
  })

  describe('Adding', () => {
    it('adds a new clipping', async () => {
      const { addClipping, editableClippings } = useDataEditor({
        clippings: clippingsRef,
        onUpdate: onUpdateMock
      })

      await addClipping(999)

      expect(dbAddClipping).toHaveBeenCalledWith(expect.objectContaining({
        bookId: 999,
        type: 'highlight',
        content: ''
      }))
      expect(onUpdateMock).toHaveBeenCalled()
      // Check if it was added to the start of the list
      expect(editableClippings.value.length).toBe(1)
      expect(editableClippings.value[0].isEditing).toBe(true)
    })
  })
})
