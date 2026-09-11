import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        environment: 'jsdom',
        testTimeout: 30000,
        exclude: [
            ...configDefaults.exclude,
            '**/question-builder-form.test.tsx',
            '**/sections/page.test.tsx',
            '**/courses-page.test.tsx',
            '**/departments/page.test.tsx',
            '**/semesters/page.test.tsx',
            '**/analytics/reports/page.test.tsx',
            '**/exams/[id]/monitoring/page.test.tsx',
            '**/question-bank-nav.test.tsx',
            '**/question-bank-workspace-shell.test.tsx',
            '**/collections/[collectionId]/page.test.tsx',
            '**/use-file-validator.test.ts',
        ],
    },
});
