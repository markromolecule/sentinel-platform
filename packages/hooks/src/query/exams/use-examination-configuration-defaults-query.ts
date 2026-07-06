import { useQuery } from '@tanstack/react-query';
import { getExaminationConfigurationDefaults } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useExaminationConfigurationDefaultsQuery() {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: EXAM_QUERY_KEYS.configurationDefaults(),
        queryFn: () => getExaminationConfigurationDefaults(apiClient),
        enabled: isAuthenticatedQueryEnabled,
    });
}
