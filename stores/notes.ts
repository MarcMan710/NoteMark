import { defineStore } from 'pinia'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// Helper function to filter notes by search query
function filterNotesBySearchQuery(notes: Note[], searchQuery: string): Note[] {
  const query = searchQuery.toLowerCase()
  return notes.filter(note =>
    note.title.toLowerCase().includes(query) ||
    note.content.toLowerCase().includes(query)
  )
}

// Helper function to filter notes by selected tags
function filterNotesByTags(notes: Note[], selectedTags: string[]): Note[] {
  return notes.filter(note =>
    selectedTags.every(tag => note.tags.includes(tag))
  )
}

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [] as Note[],
    currentNote: null as Note | null,
    searchQuery: '',
    selectedTags: [] as string[],
  }),

  getters: {
    filteredNotes: (state): Note[] => {
      let filtered = state.notes

      if (state.searchQuery) {
        filtered = filterNotesBySearchQuery(filtered, state.searchQuery)
      }

      if (state.selectedTags.length > 0) {
        filtered = filterNotesByTags(filtered, state.selectedTags)
      }

      return filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    },

    allTags: (state): string[] => {
      const tags = new Set<string>()
      state.notes.forEach(note => {
        note.tags.forEach(tag => tags.add(tag))
      })
      return Array.from(tags)
    }
  },

  actions: {
    createNote(): Note {
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

    updateNote(id: string, updates: Partial<Note>): void {
      const note = this.notes.find(n => n.id === id)
      if (note) {
        Object.assign(note, { ...updates, updatedAt: new Date() })
        if (this.currentNote?.id === id) {
          this.currentNote = { ...note }
        }
      }
    },

    deleteNote(id: string): void {
      const index = this.notes.findIndex(n => n.id === id)
      if (index !== -1) {
        this.notes.splice(index, 1)
        if (this.currentNote?.id === id) {
          this.currentNote = null
        }
      }
    },

    setCurrentNote(id: string | null): void {
      if (id === null) {
        this.currentNote = null
        return
      }
      this.currentNote = this.notes.find(n => n.id === id) || null
    },

    setSearchQuery(query: string): void {
      this.searchQuery = query
    },

    toggleTag(tag: string): void {
      const index = this.selectedTags.indexOf(tag)
      if (index === -1) {
        this.selectedTags.push(tag)
      } else {
        this.selectedTags.splice(index, 1)
      }
    }
  },

  persist: true
}) 