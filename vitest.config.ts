import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      /**
       * `server-only` throws from its default entry by design, so a client
       * bundle cannot pull in server code. Next swaps it for an empty module;
       * the test runner does not, which would make every guarded module
       * untestable and quietly discourage adding the guard at all.
       */
      'server-only': fileURLToPath(new URL('./src/test/server-only-stub.ts', import.meta.url)),
    },
  },
})
