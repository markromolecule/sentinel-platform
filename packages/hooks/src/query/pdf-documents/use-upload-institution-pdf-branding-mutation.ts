import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { uploadInstitutionPdfBranding, type InstitutionPdfBranding } from '@sentinel/services';
import { ANALYTICS_MUTATION_KEYS, ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';

export interface UploadInstitutionPdfBrandingVariables {
    institutionId: string;
    logo: File;
}

export type UseUploadInstitutionPdfBrandingMutationArgs = UseMutationOptions<
    InstitutionPdfBranding,
    Error,
    UploadInstitutionPdfBrandingVariables
>;

export function useUploadInstitutionPdfBrandingMutation(
    args: UseUploadInstitutionPdfBrandingMutationArgs = {},
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation<InstitutionPdfBranding, Error, UploadInstitutionPdfBrandingVariables>({
        ...args,
        mutationKey: ANALYTICS_MUTATION_KEYS.uploadBrandingLogo(),
        mutationFn: ({ institutionId, logo }) =>
            uploadInstitutionPdfBranding(apiClient, institutionId, logo),
        onSuccess: async (data, variables, onMutateResult, context) => {
            await queryClient.invalidateQueries({
                queryKey: ANALYTICS_QUERY_KEYS.pdfBranding(variables.institutionId),
            });

            await args.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
}
