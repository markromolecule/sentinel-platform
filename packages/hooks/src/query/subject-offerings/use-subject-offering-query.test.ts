import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSubjectOfferingQuery } from './use-subject-offering-query';
import { getSubjectOffering } from '@sentinel/services';
import { useQuery } from '@tanstack/react-query';

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn((options: any) => {
        if (options.enabled !== false && options.queryFn) {
            options.queryFn();
        }
        return { data: 'mock-query-result' };
    }),
}));

vi.mock('@sentinel/services', () => ({
    getSubjectOffering: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useSubjectOfferingQuery Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call getSubjectOffering service with api client and id', () => {
        const id = 'mock-offering-id';
        useSubjectOfferingQuery(id);

        expect(getSubjectOffering).toHaveBeenCalledWith({ mockClient: true }, id);
        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ['subject-offerings', id],
                enabled: true,
            }),
        );
    });

    it('should respect the enabled flag', () => {
        const id = 'mock-offering-id';
        useSubjectOfferingQuery(id, false);

        expect(useQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
        );
    });
});
