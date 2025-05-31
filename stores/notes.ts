import { defineStore } from 'pinia'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [] as Note[],
    currentNote: null as Note | null,
    searchQuery: '',
    selectedTags: [] as string[],
  }),

  getters: {
    filteredNotes: (state) => {
      let filtered = state.notes

      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter(note => 
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
        )
      }

      if (state.selectedTags.length > 0) {
        filtered = filtered.filter(note =>
          state.selectedTags.every(tag => note.tags.includes(tag))
        )
      }

      return filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    },

    allTags: (state) => {
      const tags = new Set<string>()
      state.notes.forEach(note => {
        note.tags.forEach(tag => tags.add(tag))
      })
      return Array.from(tags)
    }
  },

  actions: {
    createNote() {
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: 'Untitled Note',
        content: '',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      this.notes.push(newNote)
      this.currentNote = newNote
      return newNote
    },

    updateNote(id: string, updates: Partial<Note>) {
      const note = this.notes.find(n => n.id === id)
      if (note) {
        Object.assign(note, { ...updates, updatedAt: new Date() })
        if (this.currentNote?.id === id) {
          this.currentNote = { ...note }
        }
      }
    },

    deleteNote(id: string) {
      const index = this.notes.findIndex(n => n.id === id)
      if (index !== -1) {
        this.notes.splice(index, 1)
        if (this.currentNote?.id === id) {
          this.currentNote = null
        }
      }
    },

    setCurrentNote(id: string | null) {
      if (id === null) {
        this.currentNote = null
        return
      }
      this.currentNote = this.notes.find(n => n.id === id) || null
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    toggleTag(tag: string) {
      const index = this.selectedTags.indexOf(tag)
      if (index === -1) {
        this.selectedTags.push(tag)
      } else {
        this.selectedTags.splice(index, 1)
      }
    }
  },

  persist: {
    storage: persistedState.localStorage
  }
}) 