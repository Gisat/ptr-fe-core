import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		dir: './src',
		silent: false,
		include: ['**/*.test.ts', '**/*.spec.ts'],
		exclude: ['**/node_modules/**', '**/.github/**'],
		testTimeout: 50000,
	},
});
