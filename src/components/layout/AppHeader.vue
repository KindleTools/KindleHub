<script setup lang="ts">
import { computed } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { BookOpen, Moon, Sun } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import UiTooltip from '@/components/ui/Tooltip.vue'

const { t } = useI18n()
const isDark = useDark()
const toggleDark = useToggle(isDark)
const themeTooltip = computed(() => isDark.value ? t('theme.light') : t('theme.dark'))
</script>

<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3">
          <BookOpen class="h-8 w-8 text-primary-600" />
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ $t('app.title') }}
            </h1>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ $t('app.subtitle') }}
            </p>
          </div>
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

        <!-- Theme Toggle -->
        <UiTooltip :text="themeTooltip" position="bottom">
          <button
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :aria-label="$t('theme.toggle')"
            @click="toggleDark()"
          >
            <Moon v-if="!isDark" class="h-5 w-5 text-gray-600" />
            <Sun v-else class="h-5 w-5 text-yellow-500" />
          </button>
        </UiTooltip>
      </div>
    </div>
  </header>
</template>
