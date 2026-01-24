<script setup lang="ts">
import { X, Plus } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  modelValue: string[]
  placeholder?: string
  maxTags?: number
  suggestions?: string[]
  readonly?: boolean
}>(), {
  placeholder: '',
  maxTags: 10,
  suggestions: () => [],
  readonly: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const { t } = useI18n()

const inputValue = ref('')
const inputRef = ref<HTMLInputElement>()
const showSuggestions = ref(false)

// Filter suggestions based on input
const filteredSuggestions = computed(() => {
  if (!inputValue.value.trim()) return []
  const query = inputValue.value.toLowerCase()
  return props.suggestions
    .filter((s) =>
      s.toLowerCase().includes(query) &&
      !props.modelValue.includes(s)
    )
    .slice(0, 5)
})

// Generate color from tag name (consistent hash-based)
const getTagColor = (tag: string): string => {
  const colors = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
  ]
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const addTag = (tag: string) => {
  const trimmed = tag.trim().toLowerCase()
  if (!trimmed) return
  if (props.modelValue.includes(trimmed)) return
  if (props.modelValue.length >= props.maxTags) return

  emit('update:modelValue', [...props.modelValue, trimmed])
  inputValue.value = ''
  showSuggestions.value = false
}

const removeTag = (index: number) => {
  const newTags = [...props.modelValue]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag(inputValue.value)
  } else if (e.key === 'Backspace' && !inputValue.value && props.modelValue.length > 0) {
    removeTag(props.modelValue.length - 1)
  }
}

const handleInput = () => {
  showSuggestions.value = true
}

const selectSuggestion = (suggestion: string) => {
  addTag(suggestion)
  inputRef.value?.focus()
}
</script>

<template>
  <div class="relative">
    <!-- Tags Container -->
    <div
      class="flex flex-wrap gap-1.5 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 min-h-[42px]"
      :class="{ 'cursor-not-allowed opacity-60': readonly }"
      @click="inputRef?.focus()"
    >
      <!-- Existing Tags -->
      <span
        v-for="(tag, index) in modelValue"
        :key="tag"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
        :class="getTagColor(tag)"
      >
        <span>#{{ tag }}</span>
        <button
          v-if="!readonly"
          type="button"
          class="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
          @click.stop="removeTag(index)"
        >
          <X class="h-3 w-3" />
        </button>
      </span>

      <!-- Input -->
      <input
        v-if="!readonly && modelValue.length < maxTags"
        ref="inputRef"
        v-model="inputValue"
        type="text"
        class="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm placeholder-gray-400"
        :placeholder="modelValue.length === 0 ? (placeholder || t('tags.placeholder')) : ''"
        @keydown="handleKeydown"
        @input="handleInput"
        @blur="showSuggestions = false"
      />
    </div>

    <!-- Suggestions Dropdown -->
    <div
      v-if="showSuggestions && filteredSuggestions.length > 0"
      class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
    >
      <button
        v-for="suggestion in filteredSuggestions"
        :key="suggestion"
        type="button"
        class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
        @mousedown.prevent="selectSuggestion(suggestion)"
      >
        <Plus class="h-4 w-4 text-gray-400" />
        <span class="font-medium">#{{ suggestion }}</span>
      </button>
    </div>
  </div>
</template>
