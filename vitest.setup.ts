import { vi } from 'vitest';

// Mock crypto.randomUUID if it's not available in the test environment (already in spec, but good here too)
if (!global.crypto) {
  global.crypto = {
    // @ts-ignore
    randomUUID: () => Math.random().toString(36).substring(2, 15)
  };
}


// Mock persistedState for Pinia persistence plugin
// This needs to be available globally when the store is defined.
if (!global.persistedState) {
  // @ts-ignore
  global.persistedState = {
    localStorage: {
      getItem: (key: string) => {
        // console.log(`Mock getItem for ${key}`);
        return null;
      },
      setItem: (key: string, value: string) => {
        // console.log(`Mock setItem for ${key} with ${value}`);
      },
      removeItem: (key: string) => {
        // console.log(`Mock removeItem for ${key}`);
      }
    },
    // Add other storage types if used e.g., sessionStorage
    sessionStorage: {
      getItem: (key: string) => null,
      setItem: (key: string, value: string) => {},
      removeItem: (key: string) => {}
    }
  };
}

// You can also mock specific modules if needed, e.g.:
// vi.mock('some-persistence-plugin', () => ({
//   createPersistedState: vi.fn(() => ({ /* mock implementation */ })),
//   persistedState: { /* mock implementation as above */ }
// }));
