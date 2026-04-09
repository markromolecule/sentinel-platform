import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateAccessControlExaminationSettings } from '@sentinel/services';
import { ACCESS_CONTROL_QUERY_KEYS } from '@sentinel/shared/constants';
import type {
    ExaminationGlobalSettings,
    ExaminationGlobalSettingsRecord,
} from '@sentinel/shared/types';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export function useUpdateAccessControlExaminationSettingsMutation(
    args: UseMutationOptions<ExaminationGlobalSettingsRecord, Error, ExaminationGlobalSettings> = {
        onSuccess: () => toast.success('Examination settings updated successfully.'),
        onError: (error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (payload) => updateAccessControlExaminationSettings(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ACCESS_CONTROL_QUERY_KEYS.examinationSettings(),
                }),
                queryClient.invalidateQueries({
                    queryKey: ACCESS_CONTROL_QUERY_KEYS.overview(),
                }),
            ]);
            (args.onSuccess as any)?.(data, variables, context);
        },
    });
}
