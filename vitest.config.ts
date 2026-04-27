/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/declaration.d.ts',
        'src/types.d.ts',
        'src/mocks/**',
        'src/styles/**',
        'src/assets/**',
      ],
      // Start at 10% and increase as we add tests per phase
      // Target: 50% by end of Phase 1, 70% by end of Phase 3
      thresholds: {
        statements: 10,
        branches: 10,
        functions: 5,
        lines: 10,
      },
    },
  },
})
