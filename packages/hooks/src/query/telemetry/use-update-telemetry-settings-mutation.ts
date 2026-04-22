import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateTelemetrySettings } from '@sentinel/services';
import { TELEMETRY_QUERY_KEYS } from '@sentinel/shared/constants';
import type { TelemetrySettings, TelemetrySettingsRecord } from '@sentinel/shared/types';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export function useUpdateTelemetrySettingsMutation(
    args: UseMutationOptions<TelemetrySettingsRecord, Error, TelemetrySettings> = {
        onSuccess: () => toast.success('Telemetry settings updated successfully.'),
        onError: (error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (payload) => updateTelemetrySettings(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: TELEMETRY_QUERY_KEYS.all,
            });
            (args.onSuccess as any)?.(data, variables, context);
        },
    });
}
