import { AppError } from '@/types/error.types'
import { useToast } from '@/composables/useToast'

export function useErrorHandler() {
  const { addToast } = useToast()
  // Assuming i18n is available globally or we can use it here.
  // If useI18n is used outside setup, it might warn. But usually fine in composables called inside setup/handlers.
  // For global handler, we might need direct access or just fallback strings.

  function handleError(error: unknown) {
    console.error('Captured Error:', error)

    if (error instanceof AppError) {
      addToast(`Error: ${error.code} - ${error.message}`, 'error', 5000)
    } else if (error instanceof Error) {
      addToast(`Unexpected Error: ${error.message}`, 'error', 5000)
    } else {
      addToast('Unknown Error: Something went wrong', 'error', 5000)
    }
  }

  return { handleError }
}
