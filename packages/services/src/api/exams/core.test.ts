import { describe, expect, it, vi } from 'vitest';
import { getExams } from './core';

describe('getExams', () => {
    it('includes the institution id in the query string when provided', async () => {
        const apiClient = vi.fn().mockResolvedValue({ data: [] });

        await getExams(apiClient as any, {
            search: 'physics',
            institutionId: 'institution-1',
        });

        expect(apiClient).toHaveBeenCalledWith('/exams?search=physics&institutionId=institution-1');
    });
});
