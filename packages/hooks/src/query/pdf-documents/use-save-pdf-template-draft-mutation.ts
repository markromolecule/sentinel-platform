import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { upsertPdfTemplateDraft, type UpsertPdfTemplateDraftBody } from '@sentinel/services';
import { ANALYTICS_MUTATION_KEYS, ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';

type SavePdfTemplateDraftResponse = Awaited<ReturnType<typeof upsertPdfTemplateDraft>>;

export type UseSavePdfTemplateDraftMutationArgs = UseMutationOptions<
    SavePdfTemplateDraftResponse,
    Error,
    UpsertPdfTemplateDraftBody
>;

export function useSavePdfTemplateDraftMutation(args: UseSavePdfTemplateDraftMutationArgs = {}) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation<SavePdfTemplateDraftResponse, Error, UpsertPdfTemplateDraftBody>({
        ...args,
        mutationKey: ANALYTICS_MUTATION_KEYS.saveTemplateDraft(),
        mutationFn: (variables) => upsertPdfTemplateDraft(apiClient, variables),
        onSuccess: async (data, variables, onMutateResult, context) => {
            await queryClient.invalidateQueries({
                queryKey: ANALYTICS_QUERY_KEYS.pdfTemplates(
                    variables.institution_id ?? null,
                    variables.document_kind,
                ),
            });
            await queryClient.invalidateQueries({
                queryKey: ANALYTICS_QUERY_KEYS.resolvedPdfTemplate(
                    variables.institution_id ?? null,
                    variables.document_kind,
                    'PUBLISHED',
                ),
            });

            await args.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
}
