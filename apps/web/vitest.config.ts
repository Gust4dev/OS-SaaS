import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
        exclude: ['node_modules', '.next'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            exclude: ['node_modules', '.next', '**/*.test.ts'],
        },
        setupFiles: ['./vitest.setup.ts'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@filmtech/database': path.resolve(__dirname, '../../packages/database'),
        },
    },
});
