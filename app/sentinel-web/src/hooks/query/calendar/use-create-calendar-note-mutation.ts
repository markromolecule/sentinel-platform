import { useMutation, useQueryClient, type MutationOptions } from '@tanstack/react-query';
import { createCalendarNoteData, type CreateCalendarNotePayload } from '@/data/api/calendar/create-calendar-note';
import { type CalendarEventResponse } from '@sentinel/shared';

export type UseCreateCalendarNoteMutationArgs = MutationOptions<
    CalendarEventResponse,
    Error,
    CreateCalendarNotePayload
>;

/**
 * Mutation hook to create a personal student calendar note.
 * Invalidates ['/calendar'] cache upon successful creation.
 */
export function useCreateCalendarNoteMutation(
    args: UseCreateCalendarNoteMutationArgs = {},
) {
    const queryClient = useQueryClient();

    return useMutation<CalendarEventResponse, Error, CreateCalendarNotePayload>({
        ...args,
        mutationFn: (variables) => createCalendarNoteData(variables),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: ['/calendar'] });
            if (args.onSuccess) {
                await (args.onSuccess as any)(data, variables, context);
            }
        },
    });
}
