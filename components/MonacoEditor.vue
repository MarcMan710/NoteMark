<template>
  <div ref="editorContainer" class="h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from '@monaco-editor/loader'

const props = defineProps<{
  modelValue: string
  language?: string
  theme?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editorContainer = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

onMounted(async () => {
  if (!editorContainer.value) return

  // Initialize Monaco
  await monaco.init()

  // Create editor instance
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: props.language || 'markdown',
    theme: props.theme || 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    fontFamily: 'Fira Code, monospace',
    lineNumbers: 'off',
    wordWrap: 'on',
    renderWhitespace: 'selection',
    contextmenu: true,
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    formatOnPaste: true,
    formatOnType: true,
  })

  // Set up change listener
  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || ''
    emit('update:modelValue', value)
  })
})

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (editor && newValue !== editor.getValue()) {
    editor.setValue(newValue)
  }
})

// Watch for theme changes
watch(() => props.theme, (newTheme) => {
  if (editor && newTheme) {
    monaco.editor.setTheme(newTheme)
  }
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})
</script>

<style scoped>
:deep(.monaco-editor) {
  padding: 1rem;
}
</style> 