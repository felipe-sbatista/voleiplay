import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.{test,spec}.ts'],
    testTimeout: 10000,
    env: {
      ELASTIC_APM_ACTIVE: 'false',
      NODE_ENV: 'test'
    }
  }
});
