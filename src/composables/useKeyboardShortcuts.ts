/**
 * useKeyboardShortcuts - Global keyboard shortcuts handler.
 * Provides common shortcuts: Ctrl+F (search), Ctrl+S (save), Escape (close)
 */
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export interface KeyboardShortcutOptions {
  onSave?: () => void | Promise<void>
  onSearch?: () => void
  onEscape?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts(options: KeyboardShortcutOptions = {}) {
  const router = useRouter()
  const { onSave, onSearch, onEscape, enabled = true } = options

  function handleKeydown(event: KeyboardEvent) {
    if (!enabled) return

    // Ignore if user is typing in an input/textarea
    const target = event.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

    // Ctrl/Cmd + S - Save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      if (onSave) {
        onSave()
      }
      return
    }

    // Ctrl/Cmd + F - Search (only if not in input)
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      // Only override default if we have a custom handler or want to navigate to search
      if (onSearch) {
        event.preventDefault()
        onSearch()
      } else if (!isInput) {
        // Navigate to search page
        event.preventDefault()
        router.push('/search')
      }
      return
    }

    // Escape - Close/Cancel (only if not in input, or use custom handler)
    if (event.key === 'Escape') {
      if (onEscape) {
        onEscape()
      }
      return
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    handleKeydown
  }
}

/**
 * useGlobalShortcuts - Register global shortcuts at app level.
 * Call this once in App.vue or main layout.
 */
export function useGlobalShortcuts() {
  const router = useRouter()

  function handleGlobalKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

    // Global: Ctrl/Cmd + K - Quick search (common pattern)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault()
      router.push('/search')
      return
    }

    // Global: ? - Show help (only when not typing)
    if (event.key === '?' && !isInput && !event.ctrlKey && !event.metaKey) {
      // Could show a shortcuts modal in the future
      return
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleGlobalKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleGlobalKeydown)
  })
}
