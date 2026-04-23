import { describe, expect, it } from 'vitest';
import { readMultipartFiles } from '../../lib/gemini/services/multipart-parser/readers';

describe('Gemini multipart parser', () => {
    it('accepts file-like multipart values when the runtime does not expose global File', () => {
        const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'File');
        const fileLike = {
            name: 'lesson.pdf',
            type: 'application/pdf',
            size: 123,
            arrayBuffer: async () => new ArrayBuffer(0),
        } as unknown as File;

        try {
            Object.defineProperty(globalThis, 'File', {
                configurable: true,
                value: undefined,
            });

            expect(readMultipartFiles(fileLike)).toEqual([fileLike]);
        } finally {
            if (originalDescriptor) {
                Object.defineProperty(globalThis, 'File', originalDescriptor);
            } else {
                Reflect.deleteProperty(globalThis, 'File');
            }
        }
    });
});
