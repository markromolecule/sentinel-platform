import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getPdfTemplates, type GetPdfTemplatesParams, type PdfTemplate } from '@sentinel/services';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UsePdfTemplatesQueryArgs = Omit<
    UseQueryOptions<PdfTemplate[], Error>,
    'queryKey' | 'queryFn'
> & {
    payload?: GetPdfTemplatesParams;
};

export function usePdfTemplatesQuery({ payload, ...options }: UsePdfTemplatesQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<PdfTemplate[], Error>({
        ...options,
        queryKey: ANALYTICS_QUERY_KEYS.pdfTemplates(
            payload?.institutionId ?? null,
            payload?.documentKind,
            payload?.status,
        ),
        queryFn: () => getPdfTemplates(apiClient, payload),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
