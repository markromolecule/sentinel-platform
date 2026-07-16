import { describe, expect, it, vi } from 'vitest';
import { getInstitutions } from './institutions';

describe('institutions api', () => {
    it('encodes parent-only filters in the institutions query string', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            message: 'ok',
            data: [
                {
                    id: 'inst-parent',
                    name: 'Parent Institution',
                    code: 'PI',
                    parentInstitutionId: null,
                    institutionKind: 'PARENT',
                    namingConventions: null,
                    createdAt: '2026-07-15T00:00:00.000Z',
                    createdBy: 'System',
                    updatedAt: '2026-07-15T00:00:00.000Z',
                    updatedBy: 'System',
                },
            ],
        });

        const result = await getInstitutions(apiClient as any, {
            institutionKind: 'PARENT',
            parentInstitutionId: 'root-parent',
        });

        expect(apiClient).toHaveBeenCalledWith(
            '/institutions?parentInstitutionId=root-parent&institutionKind=PARENT',
        );
        expect(result).toEqual([
            expect.objectContaining({
                id: 'inst-parent',
                name: 'Parent Institution',
                institutionKind: 'PARENT',
                parentInstitutionId: null,
            }),
        ]);
    });

    it('preserves the legacy unfiltered institutions request', async () => {
        const apiClient = vi.fn().mockResolvedValue({
            message: 'ok',
            data: [],
        });

        await getInstitutions(apiClient as any);

        expect(apiClient).toHaveBeenCalledWith('/institutions');
    });
});
