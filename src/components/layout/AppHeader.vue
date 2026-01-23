<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { Moon, Sun, Menu } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import UiTooltip from '@/components/ui/Tooltip.vue'
import MobileMenu from '@/components/layout/MobileMenu.vue'

const { t } = useI18n()
const isDark = useDark()
const toggleDark = useToggle(isDark)
const mobileMenuOpen = ref(false)
const themeTooltip = computed(() => isDark.value ? t('theme.light') : t('theme.dark'))

import { useWindowScroll } from '@vueuse/core'
const { y } = useWindowScroll()
const isScrolled = computed(() => y.value > 10)

</script>

<template>
  <header
    class="sticky top-0 z-50 transition-all duration-300"
    :class="[
      isScrolled
        ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50'
        : 'bg-white dark:bg-gray-800 border-b border-transparent'
    ]"
  >
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3">
          <img
            src="/icon.png"
            alt="Kindle Hub"
            class="h-10 w-auto"
          />
        </router-link>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center gap-6">
          <router-link
            to="/"
            class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ $t('nav.home') }}
          </router-link>
          <router-link
            to="/library"
            class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ $t('nav.library') }}
          </router-link>
          <router-link
            to="/stats"
            class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ $t('nav.stats') }}
          </router-link>
          <router-link
            to="/import"
            class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ $t('nav.import') }}
          </router-link>
          <router-link
            to="/export"
            class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ $t('nav.export') }}
          </router-link>
          <router-link
            to="/editor"
            class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ $t('nav.editor') }}
          </router-link>
          <router-link
            to="/search"
            class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ $t('nav.search') }}
          </router-link>
          <router-link
            to="/settings"
            class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {{ $t('nav.settings') }}
          </router-link>
        </nav>

        <!-- Right Side Actions -->
        <div class="flex items-center gap-4">
          <!-- Theme Toggle -->
          <UiTooltip :text="themeTooltip" position="bottom">
            <button
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              :aria-label="$t('theme.toggle')"
              @click="toggleDark()"
            >
              <Moon v-if="!isDark" class="h-5 w-5 text-gray-600" aria-hidden="true" />
              <Sun v-else class="h-5 w-5 text-yellow-500" aria-hidden="true" />
            </button>
          </UiTooltip>

          <!-- Mobile Menu Button -->
          <button
            class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
            :aria-label="$t('nav.menu')"
            @click="mobileMenuOpen = true"
          >
            <Menu class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
    <MobileMenu :is-open="mobileMenuOpen" @close="mobileMenuOpen = false" />
  </header>
</template>
