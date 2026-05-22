import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateCalendarEvent, type UpdateCalendarEventPayload } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { type CalendarEventResponse } from '@sentinel/shared/types';
import { CALENDAR_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseUpdateCalendarEventMutationArgs = UseMutationOptions<
    CalendarEventResponse,
    Error,
    UpdateCalendarEventPayload
>;

/**
 * Mutation hook to update an existing calendar event by ID.
 * Automatically invalidates the calendar queries cache upon success.
 *
 * @param args Optional mutation options.
 * @returns The mutation object.
 */
export function useUpdateCalendarEventMutation(args: UseUpdateCalendarEventMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation<CalendarEventResponse, Error, UpdateCalendarEventPayload>({
        ...args,
        mutationFn: (variables) => updateCalendarEvent(apiClient, variables),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEYS.all });
            if (args.onSuccess) {
                await (args.onSuccess as any)(data, variables, context);
                return;
            }
            toast.success('Calendar event updated successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }
            toast.error(error.message || 'Failed to update calendar event');
        },
    });
}
