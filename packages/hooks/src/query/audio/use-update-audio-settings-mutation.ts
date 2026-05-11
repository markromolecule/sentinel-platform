'use client';

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateAudioSettings } from '@sentinel/services';
import { AUDIO_QUERY_KEYS } from '@sentinel/shared/constants';
import type { AudioAnomalySettings, AudioAnomalySettingsRecord } from '@sentinel/shared/types';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export function useUpdateAudioSettingsMutation(
    args: UseMutationOptions<AudioAnomalySettingsRecord, Error, AudioAnomalySettings> = {
        onSuccess: () => toast.success('Audio calibration settings updated successfully.'),
        onError: (error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (payload) => updateAudioSettings(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: AUDIO_QUERY_KEYS.all,
            });
            (args.onSuccess as any)?.(data, variables, context);
        },
    });
}
