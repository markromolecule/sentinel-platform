import { describe, expect, it } from 'vitest';
import { getPdfJobOptions, PDF_QUEUE_NAME } from './pdf-generation-queue.config';

describe('pdf-generation-queue.config', () => {
    it('uses the expected queue name', () => {
        expect(PDF_QUEUE_NAME).toBe('pdf-generation');
    });

    it('returns retry and cleanup defaults for PDF jobs', () => {
        const options = getPdfJobOptions();

        expect(options.attempts).toBe(3);
        expect(options.backoff).toEqual({
            type: 'exponential',
            delay: 5000,
        });
        expect(options.removeOnComplete).toEqual({
            age: 24 * 3600,
            count: 100,
        });
        expect(options.removeOnFail).toEqual({
            age: 7 * 24 * 3600,
            count: 500,
        });
    });
});
