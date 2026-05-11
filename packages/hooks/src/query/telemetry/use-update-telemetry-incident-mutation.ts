'use client';

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateTelemetryIncident, type UpdateTelemetryIncidentPayload } from '@sentinel/services';
import { TELEMETRY_QUERY_KEYS } from '@sentinel/shared/constants';
import type { TelemetryIncidentRecord } from '@sentinel/shared/types';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export function useUpdateTelemetryIncidentMutation(
    args: UseMutationOptions<TelemetryIncidentRecord, Error, UpdateTelemetryIncidentPayload> = {
        onSuccess: () => toast.success('Incident review state updated successfully.'),
        onError: (error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (payload) => updateTelemetryIncident(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: TELEMETRY_QUERY_KEYS.all,
            });
            (args.onSuccess as any)?.(data, variables, context);
        },
    });
}
