import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getInstitutionPdfBranding, type InstitutionPdfBranding } from '@sentinel/services';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseInstitutionPdfBrandingQueryArgs = Omit<
    UseQueryOptions<InstitutionPdfBranding, Error>,
    'queryKey' | 'queryFn'
>;

export function useInstitutionPdfBrandingQuery(
    institutionId?: string | null,
    options: UseInstitutionPdfBrandingQueryArgs = {},
) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<InstitutionPdfBranding, Error>({
        ...options,
        queryKey: ANALYTICS_QUERY_KEYS.pdfBranding(institutionId ?? null),
        queryFn: () => getInstitutionPdfBranding(apiClient, institutionId as string),
        enabled: isAuthenticatedQueryEnabled && Boolean(institutionId) && (options.enabled ?? true),
    });
}
