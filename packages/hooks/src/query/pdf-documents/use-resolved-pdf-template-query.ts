import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
    getPdfTemplates,
    type DocumentKind,
    type PdfTemplate,
    type TemplateStatus,
} from '@sentinel/services';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export interface ResolvedPdfTemplateResult {
    effectiveTemplate: PdfTemplate | null;
    institutionTemplate: PdfTemplate | null;
    globalTemplate: PdfTemplate | null;
}

export type UseResolvedPdfTemplateQueryArgs = Omit<
    UseQueryOptions<ResolvedPdfTemplateResult, Error>,
    'queryKey' | 'queryFn'
> & {
    institutionId?: string | null;
    documentKind: DocumentKind;
    status?: TemplateStatus;
};

export function useResolvedPdfTemplateQuery({
    institutionId,
    documentKind,
    status = 'PUBLISHED',
    ...options
}: UseResolvedPdfTemplateQueryArgs) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<ResolvedPdfTemplateResult, Error>({
        ...options,
        queryKey: ANALYTICS_QUERY_KEYS.resolvedPdfTemplate(institutionId, documentKind, status),
        queryFn: async () => {
            const templates = await getPdfTemplates(apiClient, {
                institutionId,
                documentKind,
                status,
            });

            const institutionTemplate =
                templates.find((template) => template.institution_id === institutionId) ?? null;
            const globalTemplate =
                templates.find((template) => template.institution_id == null) ?? null;

            return {
                effectiveTemplate: institutionTemplate ?? globalTemplate,
                institutionTemplate,
                globalTemplate,
            };
        },
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
