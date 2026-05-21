import { useMutation, useQueryClient, type MutationOptions } from '@tanstack/react-query';
import { createCalendarEventData, type CreateCalendarEventPayload } from '@/data/api/calendar/create-calendar-event';
import { type CalendarEventResponse } from '@sentinel/shared';

export type UseCreateCalendarEventMutationArgs = MutationOptions<
    CalendarEventResponse,
    Error,
    CreateCalendarEventPayload
>;

/**
 * Mutation hook to create system calendar events, announcements, and holidays in sentinel-support.
 * Invalidates ['/calendar'] cache upon successful creation.
 */
export function useCreateCalendarEventMutation(
    args: UseCreateCalendarEventMutationArgs = {},
) {
    const queryClient = useQueryClient();

    return useMutation<CalendarEventResponse, Error, CreateCalendarEventPayload>({
        ...args,
        mutationFn: (variables) => createCalendarEventData(variables),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: ['/calendar'] });
            if (args.onSuccess) {
                await (args.onSuccess as any)(data, variables, context);
            }
        },
    });
}
