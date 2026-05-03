import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { saveInstitutionNamingConventions } from '@sentinel/services';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { InstitutionNamingConventions } from '@sentinel/shared/types';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type SaveInstitutionNamingConventionsVariables = {
    institutionId: string;
    payload: InstitutionNamingConventions;
};

export type UseSaveInstitutionNamingConventionsMutationArgs = UseMutationOptions<
    InstitutionNamingConventions,
    Error,
    SaveInstitutionNamingConventionsVariables
>;

export function useSaveInstitutionNamingConventionsMutation(
    args: UseSaveInstitutionNamingConventionsMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (variables) => saveInstitutionNamingConventions(apiClient, variables),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: INSTITUTION_QUERY_KEYS.namingConventions(variables.institutionId),
                }),
                queryClient.invalidateQueries({
                    queryKey: INSTITUTION_QUERY_KEYS.effectiveNamingConventions(
                        variables.institutionId,
                    ),
                }),
                queryClient.invalidateQueries({ queryKey: INSTITUTION_QUERY_KEYS.all }),
            ]);

            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Naming conventions saved successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'institution naming conventions',
                action: 'update',
                permissionKey: 'institutions:update',
            });
        },
    });
}
