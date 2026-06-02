import { useQuery } from '@tanstack/react-query';
import { getAnnouncements, type AnnouncementQueryParams } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

/**
 * Hook to fetch a paginated list of announcements with optional search and filters.
 *
 * @param params Query parameters for filtering and pagination.
 * @param options Query hook options (e.g. enabled).
 */
export function useAnnouncementsQuery(
    params: AnnouncementQueryParams = {},
    options: { enabled?: boolean } = {},
) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: ['announcements', params],
        queryFn: () => getAnnouncements(apiClient, params),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
