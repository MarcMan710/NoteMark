<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">Welcome to NoteMark</h1>
      <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
        A distraction-free, keyboard-friendly Markdown note-taking application
      </p>
      <button
        @click="notesStore.createNote()"
        class="px-6 py-3 text-lg font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Start Writing
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotesStore } from '~/stores/notes'

const notesStore = useNotesStore()
</script> 