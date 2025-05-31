<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="flex h-screen">
      <!-- Sidebar -->
      <aside class="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div class="p-4">
          <button
            @click="notesStore.createNote()"
            class="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            New Note
          </button>
        </div>
        
        <div class="px-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search notes..."
            class="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div class="mt-4 px-4">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in notesStore.allTags"
              :key="tag"
              @click="notesStore.toggleTag(tag)"
              :class="[
                'px-2 py-1 text-xs rounded-full',
                notesStore.selectedTags.includes(tag)
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              ]"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <nav class="mt-4">
          <div
            v-for="note in notesStore.filteredNotes"
            :key="note.id"
            @click="notesStore.setCurrentNote(note.id)"
            :class="[
              'px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
              notesStore.currentNote?.id === note.id
                ? 'bg-gray-100 dark:bg-gray-700'
                : ''
            ]"
          >
            <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ note.title }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ new Date(note.updatedAt).toLocaleDateString() }}
            </p>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex">
        <!-- Editor -->
        <div class="w-1/2 border-r border-gray-200 dark:border-gray-700">
          <div v-if="notesStore.currentNote" class="h-full flex flex-col">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <input
                v-model="notesStore.currentNote.title"
                type="text"
                class="w-full text-lg font-medium bg-transparent border-none focus:ring-0 dark:text-white"
                placeholder="Note title"
              />
            </div>
            <div class="flex-1 p-4">
              <MonacoEditor
                v-model="notesStore.currentNote.content"
                language="markdown"
                theme="vs-dark"
                class="h-full"
              />
            </div>
          </div>
          <div v-else class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a note or create a new one
          </div>
        </div>

        <!-- Preview -->
        <div class="w-1/2 p-4 overflow-auto">
          <div v-if="notesStore.currentNote" class="prose dark:prose-invert max-w-none">
            <div v-html="renderedMarkdown"></div>
          </div>
          <div v-else class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            Preview will appear here
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotesStore } from '~/stores/notes'
import { marked } from 'marked'
import { computed, ref } from 'vue'
import MonacoEditor from '~/components/MonacoEditor.vue'

const notesStore = useNotesStore()
const searchQuery = ref('')

// Watch for changes in search query
watch(searchQuery, (newValue) => {
  notesStore.setSearchQuery(newValue)
})

// Compute rendered markdown
const renderedMarkdown = computed(() => {
  if (!notesStore.currentNote) return ''
  return marked(notesStore.currentNote.content)
})
</script>

<style>
.prose {
  @apply text-gray-900 dark:text-gray-100;
}

.prose h1 {
  @apply text-3xl font-bold mb-4;
}

.prose h2 {
  @apply text-2xl font-bold mb-3;
}

.prose h3 {
  @apply text-xl font-bold mb-2;
}

.prose p {
  @apply mb-4;
}

.prose ul {
  @apply list-disc list-inside mb-4;
}

.prose ol {
  @apply list-decimal list-inside mb-4;
}

.prose code {
  @apply bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded;
}

.prose pre {
  @apply bg-gray-100 dark:bg-gray-800 p-4 rounded mb-4 overflow-x-auto;
}
</style> 