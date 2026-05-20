import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getCalendarEventsData, type GetCalendarEventsParams } from '@/data/api/calendar/get-calendar-events';
import { type CalendarEventResponse } from '@sentinel/shared';

export type UseCalendarEventsQueryArgs = Omit<
    UseQueryOptions<CalendarEventResponse[], Error>,
    'queryKey' | 'queryFn'
> & {
    payload: GetCalendarEventsParams;
};

/**
 * Hook to query and cache calendar events for a given month and year.
 */
export function useCalendarEventsQuery({
    payload,
    ...options
}: UseCalendarEventsQueryArgs) {
    return useQuery<CalendarEventResponse[], Error>({
        ...options,
        queryKey: ['/calendar', 'search', payload],
        queryFn: () => getCalendarEventsData(payload),
    });
}
