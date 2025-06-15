import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue' // Required for Vue component testing
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(), // To handle .vue files
  ],
  test: {
    globals: true, // Use global APIs like describe, it, expect
    environment: 'jsdom', // Simulate a browser environment (provides localStorage, etc.)
    setupFiles: ['./vitest.setup.ts'],
    // Optionally, if you want to mimic Nuxt's auto-imports for composables in tests:
    // deps: {
    //   inline: ['@nuxt/test-utils-edge'], // Or whatever Nuxt testing utility is used
    // },
    // To resolve aliases like '~/' or '@/' (if not handled by Nuxt/Vite config already for tests)
    // resolve: {
    //   alias: {
    //     '~': resolve(__dirname, '.'),
    //     '@': resolve(__dirname, '.'),
    //     // You might need to add aliases for Nuxt auto-imports if they cause issues
    //     // '#app': resolve(__dirname, './node_modules/nuxt/dist/app'),
    //     // '#imports': resolve(__dirname, './.nuxt/imports.d.ts'),
    //   }
    // }
  },
})
