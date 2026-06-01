import { defineConfig } from 'vitest/config';
import 'dotenv/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        testTimeout: 30000,
    },
});
