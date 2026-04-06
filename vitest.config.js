import { defineConfig } from 'vitest/config';

const isDebugMode = process.env.NODE_OPTIONS?.includes('--inspect') || process.env.NODE_OPTIONS?.includes('--inspect-brk');

export default defineConfig({
  test: {
    // Global test settings
    globals: true,
    environment: 'node',
    
    // Test file patterns
    include: ['tests/**/*.test.js'],
    
    // Coverage settings
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './tests/coverage',
      clean: true
    },
    
    // Test execution settings	
    testTimeout: 60000, // one min
    hookTimeout: 30000,
    teardownTimeout: 10000,
    
    // Use forks for true process isolation (globals like chanceInitialized don't leak between test files)
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 4,
        minForks: 1
      }
    },
    
    // Reporter settings
	reporters: isDebugMode ? ['verbose'] : ['default'],

    // reporters: isDebugMode ? 'verbose' : 'default',
    
    // Don't watch in CI/test environments
    watch: false,
    
    // Tests within a file can run concurrently (describe.sequential overrides per-suite),
    // but test FILES run sequentially to avoid ./data directory conflicts
    sequence: {
      concurrent: true
    },
    fileParallelism: false
  }
});