import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotesStore } from './notes'
import type { Note } from './notes' // Assuming Note interface is exported or accessible

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => Math.random().toString(36).substring(2, 15)
})

// Mock persistedState for Pinia persistence plugin
// @ts-ignore
vi.stubGlobal('persistedState', {
  localStorage: {
    getItem: (key: string) => null, // Mock localStorage
    setItem: (key: string, value: string) => {},
    removeItem: (key: string) => {}
  },
  // Add other storage types if used e.g., sessionStorage
});

describe('useNotesStore', () => {
  beforeEach(() => {
    // Use fake timers for controlling Date object instantiation
    vi.useFakeTimers();
    setActivePinia(createPinia())
  })

  afterEach(() => {
    // Restore real timers
    vi.useRealTimers();
  });

  it('initial state is correct', () => {
    const store = useNotesStore()
    expect(store.notes).toEqual([])
    expect(store.currentNote).toBeNull()
    expect(store.searchQuery).toBe('')
    expect(store.selectedTags).toEqual([])
  })

  describe('createNote action', () => {
    it('adds a new note and sets it as current', () => {
      const store = useNotesStore()
      const note = store.createNote()
      expect(store.notes.length).toBe(1)
      // Use toEqual for deep equality comparison for objects
      expect(store.notes[0]).toEqual(note)
      expect(store.currentNote).toEqual(note)
      expect(note.title).toBe('Untitled Note')
      expect(note.content).toBe('')
      expect(note.tags).toEqual([])
      expect(note.id).toBeTypeOf('string')
      expect(note.createdAt).toBeInstanceOf(Date)
      expect(note.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('updateNote action', () => {
    let store: ReturnType<typeof useNotesStore>
    let note1: Note

    beforeEach(() => {
      store = useNotesStore()
      // Set a specific time for note creation
      vi.setSystemTime(new Date(2023, 0, 1, 10, 0, 0));
      note1 = store.createNote() // Create an initial note
      store.currentNote = null // Reset currentNote for specific tests
    })

    it('updates a note properties and updatedAt', () => {
      const initialUpdatedAt = note1.updatedAt
      // Advance time before updating
      vi.advanceTimersByTime(1000); // Advance time by 1 second

      const updates = { title: 'Updated Title', content: 'Updated content', tags: ['newTag'] }
      store.updateNote(note1.id, updates)
      const updatedNote = store.notes.find(n => n.id === note1.id)
      expect(updatedNote?.title).toBe('Updated Title')
      expect(updatedNote?.content).toBe('Updated content')
      expect(updatedNote?.tags).toEqual(['newTag'])
      expect(updatedNote?.updatedAt.getTime()).toBeGreaterThan(initialUpdatedAt.getTime())
    })

    it('updates currentNote if it is the one being updated', () => {
      store.currentNote = note1;
      vi.advanceTimersByTime(1000); // Ensure updatedAt will change
      store.updateNote(note1.id, { title: 'Current Note Update' })
      expect(store.currentNote?.title).toBe('Current Note Update')
      // Also check if currentNote is a new object instance, as the store might replace it
      expect(store.currentNote).not.toBe(note1) // Assuming it's replaced, not mutated
      expect(store.currentNote).toEqual(store.notes.find(n => n.id === note1.id))
    })

    it('does not change store or throw error for non-existent note', () => {
      const initialNotes = [...store.notes]
      store.updateNote('non-existent-id', { title: 'Test' })
      expect(store.notes).toEqual(initialNotes)
    })
  })

  describe('deleteNote action', () => {
    let store: ReturnType<typeof useNotesStore>
    let note1: Note
    let note2: Note

    beforeEach(() => {
      store = useNotesStore()
      note1 = store.createNote()
      note2 = store.createNote()
    })

    it('removes a note from the notes array', () => {
      store.deleteNote(note1.id)
      expect(store.notes.length).toBe(1)
      expect(store.notes.find(n => n.id === note1.id)).toBeUndefined()
      expect(store.notes[0].id).toBe(note2.id)
    })

    it('sets currentNote to null if the deleted note was current', () => {
      store.currentNote = note1
      store.deleteNote(note1.id)
      expect(store.currentNote).toBeNull()
    })

    it('does not change store for non-existent note', () => {
      const initialNotes = [...store.notes]
      store.deleteNote('non-existent-id')
      expect(store.notes).toEqual(initialNotes)
    })
  })

  describe('setCurrentNote action', () => {
    let store: ReturnType<typeof useNotesStore>
    let note1: Note

    beforeEach(() => {
      store = useNotesStore()
      note1 = store.createNote()
    })

    it('sets currentNote to an existing note ID', () => {
      store.setCurrentNote(note1.id)
      expect(store.currentNote).toEqual(note1)
    })

    it('sets currentNote to null', () => {
      store.setCurrentNote(note1.id) // First set to a note
      store.setCurrentNote(null)
      expect(store.currentNote).toBeNull()
    })

    it('sets currentNote to null for non-existent ID', () => {
      store.setCurrentNote('non-existent-id')
      expect(store.currentNote).toBeNull()
    })
  })

  describe('setSearchQuery action', () => {
    it('updates searchQuery state', () => {
      const store = useNotesStore()
      store.setSearchQuery('test query')
      expect(store.searchQuery).toBe('test query')
    })
  })

  describe('toggleTag action', () => {
    it('adds a new tag to selectedTags', () => {
      const store = useNotesStore()
      store.toggleTag('tag1')
      expect(store.selectedTags).toEqual(['tag1'])
    })

    it('removes an existing tag from selectedTags', () => {
      const store = useNotesStore()
      store.toggleTag('tag1') // Add
      store.toggleTag('tag1') // Remove
      expect(store.selectedTags).toEqual([])
    })

    it('handles multiple tags correctly', () => {
      const store = useNotesStore()
      store.toggleTag('tag1')
      store.toggleTag('tag2')
      expect(store.selectedTags).toEqual(['tag1', 'tag2'])
      store.toggleTag('tag1')
      expect(store.selectedTags).toEqual(['tag2'])
    })
  })

  describe('filteredNotes getter', () => {
    let store: ReturnType<typeof useNotesStore>
    let noteA: Note, noteB: Note, noteC: Note

    beforeEach(() => {
      store = useNotesStore()
      // Create notes with specific updatedAt for predictable sorting
      vi.setSystemTime(new Date(2023, 0, 1));
      noteA = { id: 'a', title: 'Alpha Note', content: 'Content about apples', tags: ['fruit', 'food'], createdAt: new Date(), updatedAt: new Date() }

      vi.setSystemTime(new Date(2023, 0, 2));
      noteB = { id: 'b', title: 'Beta Article', content: 'Story of bananas', tags: ['fruit', 'yellow'], createdAt: new Date(), updatedAt: new Date() }

      vi.setSystemTime(new Date(2023, 0, 3));
      noteC = { id: 'c', title: 'Gamma Document', content: 'Details on grapes', tags: ['fruit', 'purple'], createdAt: new Date(), updatedAt: new Date() }

      store.$patch(state => {
        state.notes = [noteA, noteB, noteC] // NoteA, NoteB, NoteC already have distinct, ordered timestamps
      })
    })

    it('returns all notes sorted by updatedAt descending with no filters', () => {
      expect(store.filteredNotes.map(n => n.id)).toEqual(['c', 'b', 'a'])
    })

    it('filters by searchQuery (title match, case-insensitive)', () => {
      store.setSearchQuery('alpha')
      expect(store.filteredNotes.map(n => n.id)).toEqual(['a'])
    })

    it('filters by searchQuery (content match, case-insensitive)', () => {
      store.setSearchQuery('bananas')
      expect(store.filteredNotes.map(n => n.id)).toEqual(['b'])
    })

    it('returns empty with no matching searchQuery', () => {
      store.setSearchQuery('xyz')
      expect(store.filteredNotes).toEqual([])
    })

    it('filters by selectedTags (one tag)', () => {
      store.toggleTag('yellow')
      expect(store.filteredNotes.map(n => n.id)).toEqual(['b'])
    })

    it('filters by selectedTags (multiple tags, AND logic)', () => {
      // Update noteA to have 'yellow' tag as well for this test
      store.$patch(state => {
        const note = state.notes.find(n => n.id === 'a')
        if(note) note.tags.push('yellow')
      })
      store.toggleTag('fruit')
      store.toggleTag('yellow')
      // Should be C, B, A initially. After filter, only A and B (if A has yellow)
      // And sorted by updatedAt. B is newer than A.
      const expectedIds = store.notes
        .filter(n => n.tags.includes('fruit') && n.tags.includes('yellow'))
        .sort((x,y) => y.updatedAt.getTime() - x.updatedAt.getTime())
        .map(n => n.id)
      expect(store.filteredNotes.map(n => n.id)).toEqual(expectedIds)
    })

    it('returns empty with non-matching selectedTags', () => {
      store.toggleTag('nonexistent')
      expect(store.filteredNotes).toEqual([])
    })

    it('filters by selectedTags (partial match - note must have ALL selected tags)', () => {
      store.toggleTag('fruit')
      store.toggleTag('food') // Only noteA has both 'fruit' and 'food'
      expect(store.filteredNotes.map(n => n.id)).toEqual(['a'])
    })

    it('filters by both searchQuery and selectedTags', () => {
      store.setSearchQuery('note') // noteA matches
      store.toggleTag('fruit')    // noteA, noteB, noteC match
      store.toggleTag('food')     // Only noteA matches this tag criteria
      // So, only noteA should be returned
      expect(store.filteredNotes.map(n => n.id)).toEqual(['a'])
    })

    it('maintains sorting by updatedAt with filters', () => {
      // To test sorting reliably, let's explicitly set updatedAt for noteB to be newer
      vi.setSystemTime(new Date(2023, 0, 4)); // New time for update
      store.$patch(state => {
        const noteToUpdate = state.notes.find(n => n.id === 'b');
        if (noteToUpdate) {
          noteToUpdate.updatedAt = new Date(); // Update B to be the most recent
        }
      });

      store.toggleTag('fruit') // All notes have 'fruit'
      // Expected order after B is updated: B, C, A
      // (B is 2023/0/4, C is 2023/0/3, A is 2023/0/1)
      expect(store.filteredNotes.map(n => n.id)).toEqual(['b', 'c', 'a'])
    })
  })

  describe('allTags getter', () => {
    it('returns empty array with no notes', () => {
      const store = useNotesStore()
      expect(store.allTags).toEqual([])
    })

    it('returns unique tags from all notes', () => {
      const store = useNotesStore()
      vi.setSystemTime(new Date(2023, 0, 1));
      const note1_tags = { id: '1', title: 'N1', content: '', tags: ['js', 'ts'], createdAt: new Date(), updatedAt: new Date() };
      vi.setSystemTime(new Date(2023, 0, 2));
      const note2_tags = { id: '2', title: 'N2', content: '', tags: ['ts', 'vue'], createdAt: new Date(), updatedAt: new Date() };
      vi.setSystemTime(new Date(2023, 0, 3));
      const note3_tags = { id: '3', title: 'N3', content: '', tags: ['js', 'react'], createdAt: new Date(), updatedAt: new Date() };

      store.$patch(state => {
        state.notes = [note1_tags, note2_tags, note3_tags];
      })
      // Order is not guaranteed by Set, so sort for consistent testing
      expect(store.allTags.sort()).toEqual(['js', 'react', 'ts', 'vue'])
    })
  })

  // Test $reset if not using createTestingPinia with state option for reset
  it('store can be reset', () => {
    const store = useNotesStore()
    store.createNote()
    store.setSearchQuery('test')
    store.toggleTag('testing')

    store.$reset()

    expect(store.notes).toEqual([])
    expect(store.currentNote).toBeNull()
    expect(store.searchQuery).toBe('')
    expect(store.selectedTags).toEqual([])
  })
})
