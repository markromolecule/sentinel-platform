import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deletePdfTemplateOverride, type DocumentKind } from '@sentinel/services';
import { ANALYTICS_MUTATION_KEYS, ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';

type ResetPdfTemplateOverrideResponse = Awaited<ReturnType<typeof deletePdfTemplateOverride>>;

export interface ResetPdfTemplateOverrideVariables {
    institutionId: string;
    documentKind: DocumentKind;
}

export type UseResetPdfTemplateOverrideMutationArgs = UseMutationOptions<
    ResetPdfTemplateOverrideResponse,
    Error,
    ResetPdfTemplateOverrideVariables
>;

export function useResetPdfTemplateOverrideMutation(
    args: UseResetPdfTemplateOverrideMutationArgs = {},
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation<ResetPdfTemplateOverrideResponse, Error, ResetPdfTemplateOverrideVariables>({
        ...args,
        mutationKey: ANALYTICS_MUTATION_KEYS.resetTemplateOverride(),
        mutationFn: (variables) => deletePdfTemplateOverride(apiClient, variables),
        onSuccess: async (data, variables, onMutateResult, context) => {
            await queryClient.invalidateQueries({
                queryKey: ANALYTICS_QUERY_KEYS.pdfTemplates(
                    variables.institutionId,
                    variables.documentKind,
                ),
            });
            await queryClient.invalidateQueries({
                queryKey: ANALYTICS_QUERY_KEYS.resolvedPdfTemplate(
                    variables.institutionId,
                    variables.documentKind,
                    'PUBLISHED',
                ),
            });

            await args.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
}
