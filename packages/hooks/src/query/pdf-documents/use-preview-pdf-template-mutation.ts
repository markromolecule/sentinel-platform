import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { previewPdfTemplate, type PreviewPdfTemplateBody } from '@sentinel/services';
import { useApi } from '../../api-provider';

export type UsePreviewPdfTemplateMutationArgs = UseMutationOptions<
    Blob,
    Error,
    PreviewPdfTemplateBody
>;

export function usePreviewPdfTemplateMutation(args: UsePreviewPdfTemplateMutationArgs = {}) {
    const apiClient = useApi();

    return useMutation<Blob, Error, PreviewPdfTemplateBody>({
        ...args,
        mutationFn: (variables) => previewPdfTemplate(apiClient, variables),
    });
}
