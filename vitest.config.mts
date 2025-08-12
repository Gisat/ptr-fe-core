import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		dir: './src',
		silent: false,
		include: ['**/*.test.ts', '**/*.spec.ts'],
		exclude: ['**/node_modules/**', '**/.github/**'],
		testTimeout: 5000, // Default timeout of a test in milliseconds (default: 5000). Use 0 to disable timeout completely.
	},
});
