import { useQuery } from '@tanstack/react-query';
import { getSections } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useSectionsQuery(
    params: {
        search?: string;
        institutionId?: string | null;
        courseId?: string | null;
        enabled?: boolean;
    } = {},
) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    return useQuery({
        queryKey: [...SECTION_QUERY_KEYS.all, params.search, params.institutionId, params.courseId],
        queryFn: () =>
            getSections(apiClient, {
                search: params.search,
                institutionId: params.institutionId ?? undefined,
                courseId: params.courseId ?? undefined,
            }),
        enabled: isAuthenticatedQueryEnabled && (params.enabled ?? true),
    });
}
