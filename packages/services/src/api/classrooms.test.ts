import { describe, expect, it, vi } from 'vitest';
import { getClassrooms } from './classrooms';

describe('getClassrooms', () => {
    it('includes institution scope in the classroom request when provided', async () => {
        const apiClient = vi.fn().mockResolvedValue({ data: [] });

        await getClassrooms(apiClient as any, {
            search: 'biology',
            institutionId: 'institution-1',
        });

        expect(apiClient).toHaveBeenCalledWith(
            '/classrooms?search=biology&institutionId=institution-1',
        );
    });
});
