import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateSection } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { Section } from '@sentinel/shared/types';
import { SectionFormValues } from '@sentinel/shared/schema';
import { SECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseUpdateSectionMutationArgs = UseMutationOptions<
    Section,
    Error,
    { id: string; payload: Partial<SectionFormValues> }
>;

export function useUpdateSectionMutation(
    args: UseUpdateSectionMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (params) => updateSection(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SECTION_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Section updated successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'sections',
                action: 'update',
                permissionKey: 'sections:update',
            });
        },
    });
}
