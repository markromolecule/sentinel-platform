import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
    AiJobFileStagingService,
    AI_JOB_STAGING_BASE_DIR,
} from './ai-job-file-staging.service';

describe('AiJobFileStagingService', () => {
    const testJobId = 'test-job-staging-123';
    const testJobDir = path.join(AI_JOB_STAGING_BASE_DIR, testJobId);

    beforeEach(async () => {
        await fs.rm(testJobDir, { recursive: true, force: true });
    });

    afterEach(async () => {
        await fs.rm(testJobDir, { recursive: true, force: true });
    });

    it('stages uploaded files to ephemeral disk and loads them back', async () => {
        const dummyBuffer = Buffer.from('Dummy PDF content for testing');
        const file1 = new File([dummyBuffer], 'lesson1.pdf', { type: 'application/pdf' });
        const file2 = new File([dummyBuffer], 'lesson2.pdf', { type: 'application/pdf' });

        const stagedPaths = await AiJobFileStagingService.stageUploadedFiles(testJobId, [file1, file2]);

        expect(stagedPaths).toHaveLength(2);
        expect(stagedPaths[0]).toContain('0_lesson1.pdf');
        expect(stagedPaths[1]).toContain('1_lesson2.pdf');

        const loadedFiles = await AiJobFileStagingService.loadStagedFiles(testJobId);
        expect(loadedFiles).toHaveLength(2);
        expect(loadedFiles.map((f) => f.name).sort()).toEqual(['lesson1.pdf', 'lesson2.pdf']);

        // Verify content
        const text = await loadedFiles[0].text();
        expect(text).toBe('Dummy PDF content for testing');
    });

    it('cleans up job directory completely', async () => {
        const dummyBuffer = Buffer.from('Content');
        const file = new File([dummyBuffer], 'doc.pdf', { type: 'application/pdf' });

        await AiJobFileStagingService.stageUploadedFiles(testJobId, [file]);
        let loaded = await AiJobFileStagingService.loadStagedFiles(testJobId);
        expect(loaded).toHaveLength(1);

        await AiJobFileStagingService.cleanupJobFiles(testJobId);
        loaded = await AiJobFileStagingService.loadStagedFiles(testJobId);
        expect(loaded).toHaveLength(0);
    });

    it('sweeps stale directories older than threshold and preserves fresh ones', async () => {
        const freshJobId = 'fresh-job-test';
        const staleJobId = 'stale-job-test';
        const freshDir = path.join(AI_JOB_STAGING_BASE_DIR, freshJobId);
        const staleDir = path.join(AI_JOB_STAGING_BASE_DIR, staleJobId);

        await fs.mkdir(freshDir, { recursive: true });
        await fs.mkdir(staleDir, { recursive: true });

        // Artificially change mtime on stale directory to 2 hours ago
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        await fs.utimes(staleDir, twoHoursAgo, twoHoursAgo);

        // Run sweep with 1 hour threshold (3600000ms)
        const swept = await AiJobFileStagingService.sweepStaleJobFiles(3600000);

        expect(swept).toBeGreaterThanOrEqual(1);

        // Verify stale directory was removed
        const staleExists = await fs
            .stat(staleDir)
            .then(() => true)
            .catch(() => false);
        expect(staleExists).toBe(false);

        // Verify fresh directory was preserved
        const freshExists = await fs
            .stat(freshDir)
            .then(() => true)
            .catch(() => false);
        expect(freshExists).toBe(true);

        // Cleanup
        await fs.rm(freshDir, { recursive: true, force: true });
    });
});
