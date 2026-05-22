import { useMutation, useQueryClient, type MutationOptions } from '@tanstack/react-query';
import { deleteCalendarEventData } from '@/data/api/calendar/delete-calendar-event';

export type UseDeleteCalendarEventMutationArgs = MutationOptions<void, Error, { eventId: string }>;

/**
 * Mutation hook to delete a calendar event by ID in sentinel-support.
 * Invalidates ['/calendar'] cache upon successful deletion.
 */
export function useDeleteCalendarEventMutation(args: UseDeleteCalendarEventMutationArgs = {}) {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { eventId: string }>({
        ...args,
        mutationFn: (variables) => deleteCalendarEventData(variables),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: ['/calendar'] });
            if (args.onSuccess) {
                await (args.onSuccess as any)(data, variables, context);
            }
        },
    });
}
