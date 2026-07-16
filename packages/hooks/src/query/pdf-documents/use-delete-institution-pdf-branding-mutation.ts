import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteInstitutionPdfBranding } from '@sentinel/services';
import { ANALYTICS_MUTATION_KEYS, ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';

type DeleteInstitutionPdfBrandingResponse = Awaited<
    ReturnType<typeof deleteInstitutionPdfBranding>
>;

export type UseDeleteInstitutionPdfBrandingMutationArgs = UseMutationOptions<
    DeleteInstitutionPdfBrandingResponse,
    Error,
    string
>;

export function useDeleteInstitutionPdfBrandingMutation(
    args: UseDeleteInstitutionPdfBrandingMutationArgs = {},
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation<DeleteInstitutionPdfBrandingResponse, Error, string>({
        ...args,
        mutationKey: ANALYTICS_MUTATION_KEYS.deleteBrandingLogo(),
        mutationFn: (institutionId) => deleteInstitutionPdfBranding(apiClient, institutionId),
        onSuccess: async (data, institutionId, onMutateResult, context) => {
            await queryClient.invalidateQueries({
                queryKey: ANALYTICS_QUERY_KEYS.pdfBranding(institutionId),
            });

            await args.onSuccess?.(data, institutionId, onMutateResult, context);
        },
    });
}
