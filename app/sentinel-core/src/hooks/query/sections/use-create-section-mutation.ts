import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createSection } from '@/data';
import { Section } from '@sentinel/shared/types';
import { SectionFormValues } from '@sentinel/shared/schema';
import { SECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

// Type for the arguments of the useCreateSectionMutation hook
export type UseCreateSectionMutationArgs = UseMutationOptions<Section, Error, SectionFormValues>;

// Hook to create a section
export function useCreateSectionMutation(
    args: UseCreateSectionMutationArgs = {
        onSuccess: () => toast.success('Section created successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: createSection,
        onSuccess: async (...params) => {
            await queryClient.invalidateQueries({ queryKey: SECTION_QUERY_KEYS.all });
            args.onSuccess?.(...params);
        },
        onError: (...params) => {
            args.onError?.(...params);
        },
    });
}
