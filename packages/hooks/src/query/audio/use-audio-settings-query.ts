'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getAudioSettings } from '@sentinel/services';
import { AUDIO_QUERY_KEYS } from '@sentinel/shared/constants';
import type { AudioAnomalySettingsRecord } from '@sentinel/shared/types';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useAudioSettingsQuery(): UseQueryResult<AudioAnomalySettingsRecord, Error> {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: AUDIO_QUERY_KEYS.settings(),
        queryFn: () => getAudioSettings(apiClient),
        enabled: isAuthenticatedQueryEnabled,
    });
}
