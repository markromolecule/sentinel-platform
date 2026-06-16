import { describe, expect, it, vi } from 'vitest';
import { getUsers } from './users';

describe('getUsers', () => {
    it('includes institution-wide search flag when requested', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            message: 'ok',
            data: [],
        });

        await getUsers(apiClient as any, {
            search: 'ma',
            institutionId: '11111111-1111-4111-8111-111111111111',
            includeInstitutionUsers: true,
        });

        expect(apiClient).toHaveBeenCalledWith(
            expect.stringContaining('include_institution_users=true'),
        );
    });
});
