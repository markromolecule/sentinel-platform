import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useExaminationConfigurationDefaultsQuery } from './use-examination-configuration-defaults-query';

const mockUseQuery = vi.fn();
const mockUseApi = vi.fn();
const mockUseAuthenticatedQueryEnabled = vi.fn();
const mockGetExaminationConfigurationDefaults = vi.fn();

vi.mock('@tanstack/react-query', () => ({
    useQuery: (...args: any[]) => mockUseQuery(...args),
}));

vi.mock('@sentinel/services', () => ({
    getExaminationConfigurationDefaults: (...args: any[]) =>
        mockGetExaminationConfigurationDefaults(...args),
}));

vi.mock('../../api-provider', () => ({
    useApi: () => mockUseApi(),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: () => mockUseAuthenticatedQueryEnabled(),
}));

describe('useExaminationConfigurationDefaultsQuery', () => {
    beforeEach(() => {
        mockUseQuery.mockReset();
        mockUseApi.mockReset();
        mockUseAuthenticatedQueryEnabled.mockReset();
        mockGetExaminationConfigurationDefaults.mockReset();

        mockUseApi.mockReturnValue('api-client');
        mockUseAuthenticatedQueryEnabled.mockReturnValue(true);
    });

    it('uses the examination-configuration-defaults query key and service call', async () => {
        mockUseQuery.mockImplementation((config) => config);

        const query = useExaminationConfigurationDefaultsQuery() as any;

        expect(query.queryKey).toEqual(EXAM_QUERY_KEYS.configurationDefaults());
        expect(query.enabled).toBe(true);

        await query.queryFn();
        expect(mockGetExaminationConfigurationDefaults).toHaveBeenCalledWith('api-client');
    });
});
