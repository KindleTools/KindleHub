/**
 * Toast Composable - Global toast notification system.
 */
import { ref, readonly } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
}

const toasts = ref<Toast[]>([])
let nextId = 1

/**
 * Add a toast notification.
 */
function addToast(message: string, type: ToastType = 'info', duration = 4000): number {
  const id = nextId++
  const toast: Toast = { id, message, type, duration }

  toasts.value.push(toast)

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

/**
 * Remove a toast by ID.
 */
function removeToast(id: number): void {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

/**
 * Clear all toasts.
 */
function clearToasts(): void {
  toasts.value = []
}

// Convenience methods
const success = (message: string, duration?: number) => addToast(message, 'success', duration)
const error = (message: string, duration?: number) => addToast(message, 'error', duration)
const warning = (message: string, duration?: number) => addToast(message, 'warning', duration)
const info = (message: string, duration?: number) => addToast(message, 'info', duration)

export function useToast() {
  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info
  }
}
