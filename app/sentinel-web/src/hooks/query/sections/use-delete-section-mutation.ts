import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteSection } from '@/data';
import { SECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

// Type for the arguments of the useDeleteSectionMutation hook
export type UseDeleteSectionMutationArgs = UseMutationOptions<void, Error, string>;

// Hook to delete a section
export function useDeleteSectionMutation(
    args: UseDeleteSectionMutationArgs = {
        onSuccess: () => toast.success('Section deleted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: deleteSection,
        onSuccess: async (...params) => {
            await queryClient.invalidateQueries({ queryKey: SECTION_QUERY_KEYS.all });
            args.onSuccess?.(...params);
        },
        onError: (...params) => {
            args.onError?.(...params);
        },
    });
}
