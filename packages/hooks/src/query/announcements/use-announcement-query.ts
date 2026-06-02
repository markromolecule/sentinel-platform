import { useQuery } from '@tanstack/react-query';
import { getAnnouncementById, getAnnouncementBySlug } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

interface UseAnnouncementQueryOptions {
    id?: string;
    slug?: string;
    enabled?: boolean;
}

/**
 * Hook to retrieve a single announcement by ID or slug.
 *
 * @param options Query options containing id or slug and optional enabled flag.
 */
export function useAnnouncementQuery(options: UseAnnouncementQueryOptions) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const { id, slug, enabled } = options;

    return useQuery({
        queryKey: id ? ['announcements', id] : ['announcements', 'slug', slug],
        queryFn: () => {
            if (id) {
                return getAnnouncementById(apiClient, id);
            }
            if (slug) {
                return getAnnouncementBySlug(apiClient, slug);
            }
            return Promise.reject(new Error('Either id or slug must be provided'));
        },
        enabled: isAuthenticatedQueryEnabled && !!(id || slug) && (enabled ?? true),
    });
}
