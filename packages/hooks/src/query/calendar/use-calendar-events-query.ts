import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getCalendarEvents, type GetCalendarEventsParams } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { type CalendarEventResponse } from '@sentinel/shared/types';
import { CALENDAR_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseCalendarEventsQueryArgs = Omit<
    UseQueryOptions<CalendarEventResponse[], Error>,
    'queryKey' | 'queryFn'
> & {
    payload: GetCalendarEventsParams;
};

/**
 * Hook to query and cache calendar events for a given month and year.
 *
 * @param args The query arguments containing the filters and react-query options.
 * @returns The query result containing events list.
 */
export function useCalendarEventsQuery({
    payload,
    ...options
}: UseCalendarEventsQueryArgs) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<CalendarEventResponse[], Error>({
        ...options,
        queryKey: CALENDAR_QUERY_KEYS.search(payload),
        queryFn: () => getCalendarEvents(apiClient, payload),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
