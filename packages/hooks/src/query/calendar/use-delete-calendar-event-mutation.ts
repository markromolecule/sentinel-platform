import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteCalendarEvent } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { CALENDAR_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseDeleteCalendarEventMutationArgs = UseMutationOptions<
    void,
    Error,
    { eventId: string }
>;

/**
 * Mutation hook to delete a calendar event/note by ID.
 * Automatically invalidates the calendar queries cache upon success.
 *
 * @param args Optional mutation options.
 * @returns The mutation object.
 */
export function useDeleteCalendarEventMutation(args: UseDeleteCalendarEventMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation<void, Error, { eventId: string }>({
        ...args,
        mutationFn: (variables) => deleteCalendarEvent(apiClient, variables),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEYS.all });
            if (args.onSuccess) {
                await (args.onSuccess as any)(data, variables, context);
                return;
            }
            toast.success('Calendar event deleted successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }
            toast.error(error.message || 'Failed to delete calendar event');
        },
    });
}
