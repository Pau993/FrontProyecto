import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['utils/**/*.js'], // ajusta según tus carpetas de código fuente
      exclude: ['**/*.test.js', '**/*.spec.js', 'node_modules']
    }
  }
})