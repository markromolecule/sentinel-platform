import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateSection } from '@/data';
import { Section } from '@sentinel/shared/types';
import { SectionFormValues } from '@sentinel/shared/schema';
import { SECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

// Type for the arguments of the useUpdateSectionMutation hook
export type UseUpdateSectionMutationArgs = UseMutationOptions<
    Section,
    Error,
    { id: string; payload: Partial<SectionFormValues> }
>;

// Hook to update a section
export function useUpdateSectionMutation(
    args: UseUpdateSectionMutationArgs = {
        onSuccess: () => toast.success('Section updated successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: updateSection,
        onSuccess: async (...params) => {
            await queryClient.invalidateQueries({ queryKey: SECTION_QUERY_KEYS.all });
            args.onSuccess?.(...params);
        },
        onError: (...params) => {
            args.onError?.(...params);
        },
    });
}
