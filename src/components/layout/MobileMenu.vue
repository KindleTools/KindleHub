<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { X } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()

const navigation = [
  { name: 'nav.home', href: '/' },
  { name: 'nav.library', href: '/library' },
  { name: 'nav.stats', href: '/stats' },
  { name: 'nav.import', href: '/import' },
  { name: 'nav.export', href: '/export' },
  { name: 'nav.editor', href: '/editor' },
  { name: 'nav.search', href: '/search' },
  { name: 'nav.settings', href: '/settings' }
]
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50 md:hidden" @close="emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity"></div>
      </TransitionChild>

      <div class="fixed inset-0 flex">
        <TransitionChild
          as="template"
          enter="transition ease-out duration-300 transform"
          enter-from="-translate-x-full"
          enter-to="translate-x-0"
          leave="transition ease-in duration-200 transform"
          leave-from="translate-x-0"
          leave-to="-translate-x-full"
        >
          <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
            <div class="flex h-full w-full flex-col overflow-y-auto bg-white dark:bg-gray-900 shadow-xl">
              <div class="flex px-4 pt-5 pb-2 items-center justify-between">
                <div class="flex items-center gap-3">
                  <img src="/icon.png" alt="KindleHub" class="h-8 w-auto" />
                  <span class="font-bold text-xl text-gray-900 dark:text-white">KindleHub</span>
                </div>
                <button
                  type="button"
                  class="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  @click="emit('close')"
                >
                  <span class="sr-only">{{ t('common.close') }}</span>
                  <X class="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <nav class="flex-1 px-4 py-6 space-y-2">
                <router-link
                  v-for="item in navigation"
                  :key="item.name"
                  :to="item.href"
                  class="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400"
                  active-class="bg-gray-50 dark:bg-gray-800 text-primary-600 dark:text-primary-400"
                  @click="emit('close')"
                >
                  {{ t(item.name) }}
                </router-link>
              </nav>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
