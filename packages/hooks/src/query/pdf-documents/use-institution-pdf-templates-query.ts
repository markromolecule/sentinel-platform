import { usePdfTemplatesQuery, type UsePdfTemplatesQueryArgs } from './use-pdf-templates-query';

export function useInstitutionPdfTemplatesQuery(
    institutionId: string | null | undefined,
    args: Omit<UsePdfTemplatesQueryArgs, 'payload'> = {},
) {
    return usePdfTemplatesQuery({
        ...args,
        payload: {
            institutionId,
        },
    });
}
