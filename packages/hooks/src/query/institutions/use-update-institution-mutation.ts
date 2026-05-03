import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateInstitution } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { Institution, InstitutionInput } from '@sentinel/shared/types';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseUpdateInstitutionMutationArgs = UseMutationOptions<
    Institution,
    Error,
    { id: string; payload: InstitutionInput }
>;

export function useUpdateInstitutionMutation(args: UseUpdateInstitutionMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (params) => updateInstitution(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: INSTITUTION_QUERY_KEYS.all }),
                queryClient.invalidateQueries({
                    queryKey: INSTITUTION_QUERY_KEYS.namingConventions(variables.id),
                }),
                queryClient.invalidateQueries({
                    queryKey: INSTITUTION_QUERY_KEYS.effectiveNamingConventions(variables.id),
                }),
            ]);
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Institution updated successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'institutions',
                action: 'update',
                permissionKey: 'institutions:update',
            });
        },
    });
}
