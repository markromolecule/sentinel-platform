import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['dotenv/config', './vitest.setup.ts'],
        testTimeout: 30000,
        fileParallelism: false,
        server: {
            deps: {
                inline: ['@sentinel/db', '@sentinel/shared'],
            },
        },
    },
});
