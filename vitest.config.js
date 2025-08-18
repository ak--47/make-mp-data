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
      reportsDirectory: './coverage'
    },
    
    // Test execution settings	
    testTimeout: 60000, // one min
    hookTimeout: 30000,
    teardownTimeout: 10000,
    
    // Thread pool settings
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1
      }
    },
    
    // Reporter settings
	reporters: isDebugMode ? ['verbose'] : ['default'],

    // reporters: isDebugMode ? 'verbose' : 'default',
    
    // Don't watch in CI/test environments
    watch: false,
    
    // Allow mixed concurrent/sequential execution
    // CLI tests use describe.sequential() due to execSync collisions
    sequence: {
      concurrent: true
    }
  }
});