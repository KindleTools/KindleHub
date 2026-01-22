<script setup lang="ts">
/**
 * ConfirmModal - Reusable confirmation dialog.
 */
import { AlertTriangle } from 'lucide-vue-next'

interface Props {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'danger',
  loading: false
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const variantStyles = {
  danger: {
    icon: 'text-red-500',
    button: 'bg-red-600 hover:bg-red-700 text-white'
  },
  warning: {
    icon: 'text-yellow-500',
    button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
  },
  info: {
    icon: 'text-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700 text-white'
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="emit('cancel')"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-150"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="open"
            class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
          >
            <div class="flex items-start gap-4">
              <div :class="['p-2 rounded-full bg-gray-100 dark:bg-gray-700', variantStyles[variant].icon]">
                <AlertTriangle class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ title }}
                </h3>
                <p class="mt-2 text-gray-600 dark:text-gray-400">
                  {{ message }}
                </p>
              </div>
            </div>

            <div class="mt-6 flex gap-3 justify-end">
              <button
                :disabled="loading"
                class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                @click="emit('cancel')"
              >
                {{ cancelText }}
              </button>
              <button
                :disabled="loading"
                :class="['px-4 py-2 rounded-lg transition-colors disabled:opacity-50', variantStyles[variant].button]"
                @click="emit('confirm')"
              >
                {{ loading ? 'Procesando...' : confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
