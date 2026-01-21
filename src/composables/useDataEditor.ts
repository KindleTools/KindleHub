/**
 * useDataEditor Composable - Logic for editing clippings in a data table.
 *
 * Provides selection, editing, and bulk action functionality.
 */
import { ref, computed, type Ref } from 'vue'

import { db, type StoredClipping } from '@/db/schema'

export interface EditableClipping extends StoredClipping {
  isSelected: boolean
  isEditing: boolean
  originalData?: Partial<StoredClipping> | null
}

export interface UseDataEditorOptions {
  clippings: Ref<StoredClipping[]>
  onUpdate?: () => Promise<void>
}

export function useDataEditor(options: UseDataEditorOptions) {
  const { clippings, onUpdate } = options

  // State
  const editableClippings = ref<EditableClipping[]>([])
  const selectAll = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const selectedClippings = computed(() =>
    editableClippings.value.filter((c) => c.isSelected)
  )

  const selectedCount = computed(() => selectedClippings.value.length)

  const hasSelection = computed(() => selectedCount.value > 0)

  const editingClipping = computed(() =>
    editableClippings.value.find((c) => c.isEditing)
  )

  // Initialize editable clippings from source
  function initializeClippings(source: StoredClipping[]) {
    editableClippings.value = source.map((c) => ({
      ...c,
      isSelected: false,
      isEditing: false
    }))
    selectAll.value = false
  }

  // Watch for changes in source clippings
  function syncWithSource() {
    initializeClippings(clippings.value)
  }

  // Selection actions
  function toggleSelectAll() {
    selectAll.value = !selectAll.value
    editableClippings.value.forEach((c) => {
      c.isSelected = selectAll.value
    })
  }

  function toggleSelect(id: number) {
    const clipping = editableClippings.value.find((c) => c.id === id)
    if (clipping) {
      clipping.isSelected = !clipping.isSelected
      selectAll.value = editableClippings.value.every((c) => c.isSelected)
    }
  }

  function clearSelection() {
    editableClippings.value.forEach((c) => {
      c.isSelected = false
    })
    selectAll.value = false
  }

  // Editing actions
  function startEdit(id: number) {
    // Cancel any existing edit first
    cancelEdit()

    const clipping = editableClippings.value.find((c) => c.id === id)
    if (clipping) {
      clipping.isEditing = true
      // Store only defined values to avoid exactOptionalPropertyTypes issues
      const data: Partial<StoredClipping> = {
        content: clipping.content,
        type: clipping.type
      }
      if (clipping.location !== undefined) data.location = clipping.location
      if (clipping.page !== undefined) data.page = clipping.page
      if (clipping.note !== undefined) data.note = clipping.note
      if (clipping.tags) data.tags = [...clipping.tags]
      clipping.originalData = data
    }
  }

  function cancelEdit() {
    const editing = editableClippings.value.find((c) => c.isEditing)
    if (editing && editing.originalData) {
      // Restore original values
      Object.assign(editing, editing.originalData)
      editing.isEditing = false
      editing.originalData = null
    }
  }

  async function saveEdit(id: number) {
    const clipping = editableClippings.value.find((c) => c.id === id)
    if (!clipping || !clipping.id) return

    isSaving.value = true
    error.value = null

    try {
      // Build update object, excluding undefined values
      const updateData: Partial<StoredClipping> = {
        content: clipping.content,
        type: clipping.type,
        updatedAt: new Date()
      }
      if (clipping.location !== undefined) updateData.location = clipping.location
      if (clipping.page !== undefined) updateData.page = clipping.page
      if (clipping.note !== undefined) updateData.note = clipping.note
      if (clipping.tags !== undefined) updateData.tags = clipping.tags

      await db.clippings.update(clipping.id, updateData)

      clipping.isEditing = false
      clipping.originalData = null

      if (onUpdate) await onUpdate()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save'
      console.error('Failed to save clipping:', err)
    } finally {
      isSaving.value = false
    }
  }

  // Bulk actions
  async function deleteSelected() {
    if (!hasSelection.value) return

    isSaving.value = true
    error.value = null

    try {
      const idsToDelete = selectedClippings.value
        .map((c) => c.id)
        .filter((id): id is number => id !== undefined)

      await db.clippings.bulkDelete(idsToDelete)

      // Remove from local state
      editableClippings.value = editableClippings.value.filter(
        (c) => !idsToDelete.includes(c.id!)
      )
      selectAll.value = false

      if (onUpdate) await onUpdate()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete'
      console.error('Failed to delete clippings:', err)
    } finally {
      isSaving.value = false
    }
  }

  async function duplicateSelected() {
    if (!hasSelection.value) return

    isSaving.value = true
    error.value = null

    try {
      const clippingsToDuplicate = selectedClippings.value.map((c) => ({
        bookId: c.bookId,
        originalId: `${c.originalId}-copy-${Date.now()}`,
        type: c.type,
        content: c.content,
        location: c.location,
        page: c.page,
        date: c.date,
        note: c.note,
        tags: c.tags,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      await db.clippings.bulkAdd(clippingsToDuplicate as StoredClipping[])
      clearSelection()

      if (onUpdate) await onUpdate()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to duplicate'
      console.error('Failed to duplicate clippings:', err)
    } finally {
      isSaving.value = false
    }
  }

  // Add new clipping
  async function addClipping(bookId: number) {
    isSaving.value = true
    error.value = null

    try {
      const newClipping: Omit<StoredClipping, 'id'> = {
        bookId,
        originalId: `new-${Date.now()}`,
        type: 'highlight',
        content: '',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const id = await db.clippings.add(newClipping as StoredClipping)

      // Add to local state and start editing
      const stored = await db.clippings.get(id)
      if (stored) {
        const editable: EditableClipping = {
          ...stored,
          isSelected: false,
          isEditing: true,
          originalData: { content: '' }
        }
        editableClippings.value.unshift(editable)
      }

      if (onUpdate) await onUpdate()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add'
      console.error('Failed to add clipping:', err)
    } finally {
      isSaving.value = false
    }
  }

  return {
    // State
    editableClippings,
    selectAll,
    isSaving,
    error,

    // Computed
    selectedClippings,
    selectedCount,
    hasSelection,
    editingClipping,

    // Actions
    initializeClippings,
    syncWithSource,
    toggleSelectAll,
    toggleSelect,
    clearSelection,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteSelected,
    duplicateSelected,
    addClipping
  }
}
