import { useMutation, useQueryClient, type MutationOptions } from '@tanstack/react-query';
import { deleteCalendarEventData } from '@/data/api/calendar/delete-calendar-event';

export type UseDeleteCalendarNoteMutationArgs = MutationOptions<void, Error, { eventId: string }>;

/**
 * Mutation hook to delete a personal student calendar note by its ID.
 * Invalidates ['/calendar'] cache upon successful deletion.
 */
export function useDeleteCalendarNoteMutation(args: UseDeleteCalendarNoteMutationArgs = {}) {
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
