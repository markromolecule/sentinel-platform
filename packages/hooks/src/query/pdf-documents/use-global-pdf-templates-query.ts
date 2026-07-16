import { usePdfTemplatesQuery, type UsePdfTemplatesQueryArgs } from './use-pdf-templates-query';

export function useGlobalPdfTemplatesQuery(args: UsePdfTemplatesQueryArgs = {}) {
    return usePdfTemplatesQuery({
        ...args,
        payload: {
            ...args.payload,
            institutionId: null,
        },
    });
}
