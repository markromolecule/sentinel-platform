import { useMutation, useQueryClient, type MutationOptions } from '@tanstack/react-query';
import { updateCalendarEventData, type UpdateCalendarEventPayload } from '@/data/api/calendar/update-calendar-event';
import { type CalendarEventResponse } from '@sentinel/shared';

export type UseUpdateCalendarEventMutationArgs = MutationOptions<
    CalendarEventResponse,
    Error,
    UpdateCalendarEventPayload
>;

/**
 * Mutation hook to update an existing calendar event.
 * Invalidates ['/calendar'] cache upon successful update.
 */
export function useUpdateCalendarEventMutation(
    args: UseUpdateCalendarEventMutationArgs = {},
) {
    const queryClient = useQueryClient();

    return useMutation<CalendarEventResponse, Error, UpdateCalendarEventPayload>({
        ...args,
        mutationFn: (variables) => updateCalendarEventData(variables),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: ['/calendar'] });
            if (args.onSuccess) {
                await (args.onSuccess as any)(data, variables, context);
            }
        },
    });
}
