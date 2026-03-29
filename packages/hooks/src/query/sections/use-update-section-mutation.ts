import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateSection } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { Section } from '@sentinel/shared/types';
import { SectionFormValues } from '@sentinel/shared/schema';
import { SECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseUpdateSectionMutationArgs = UseMutationOptions<
    Section,
    Error,
    { id: string; payload: Partial<SectionFormValues> }
>;

export function useUpdateSectionMutation(
    args: UseUpdateSectionMutationArgs = {
        onSuccess: () => toast.success('Section updated successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (params) => updateSection(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SECTION_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
