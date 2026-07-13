import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    environment: 'happy-dom',
    globals: true,
    reporters: ['default', 'vitest-ctrf-json-reporter'],
    outputFile: {
      'vitest-ctrf-json-reporter': 'ctrf/vitest-ctrf-report.json',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
