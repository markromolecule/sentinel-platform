import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createCalendarEvent, type CreateCalendarEventPayload } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { type CalendarEventResponse } from '@sentinel/shared/types';
import { CALENDAR_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseCreateCalendarEventMutationArgs = UseMutationOptions<
    CalendarEventResponse,
    Error,
    CreateCalendarEventPayload
>;

/**
 * Mutation hook to create a new calendar event (event, announcement, holiday, or note).
 * Automatically invalidates the calendar queries cache upon success.
 *
 * @param args Optional mutation options.
 * @returns The mutation object.
 */
export function useCreateCalendarEventMutation(args: UseCreateCalendarEventMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation<CalendarEventResponse, Error, CreateCalendarEventPayload>({
        ...args,
        mutationFn: (variables) => createCalendarEvent(apiClient, variables),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEYS.all });
            if (args.onSuccess) {
                await (args.onSuccess as any)(data, variables, context);
                return;
            }
            toast.success('Calendar event created successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }
            toast.error(error.message || 'Failed to create calendar event');
        },
    });
}
