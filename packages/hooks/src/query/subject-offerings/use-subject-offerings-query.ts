import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { getSubjectOfferings, type PaginatedApiResponse } from '@sentinel/services';
import { SUBJECT_OFFERING_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';
import type { SubjectOffering } from '@sentinel/shared/types';

type UseSubjectOfferingsQueryArgs = {
    search?: string;
    subjectId?: string;
    termId?: string;
    institutionId?: string;
    visibility?: 'default' | 'requestable';
    page?: number;
    limit?: number;
    enabled?: boolean;
};

export function useSubjectOfferingsQuery(
    args?: UseSubjectOfferingsQueryArgs & { page?: undefined; limit?: undefined },
): UseQueryResult<SubjectOffering[], Error>;
export function useSubjectOfferingsQuery(
    args: UseSubjectOfferingsQueryArgs & { page: number; limit: number },
): UseQueryResult<PaginatedApiResponse<SubjectOffering>, Error>;
export function useSubjectOfferingsQuery(args: UseSubjectOfferingsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const hasPagination = args.page !== undefined && args.limit !== undefined;

    return useQuery({
        queryKey: [
            ...SUBJECT_OFFERING_QUERY_KEYS.all,
            args.search ?? '',
            args.subjectId ?? '',
            args.termId ?? '',
            args.institutionId ?? '',
            args.visibility ?? 'default',
            args.page ?? '',
            args.limit ?? '',
        ],
        queryFn: async () => {
            const response = await getSubjectOfferings(apiClient, args);
            return hasPagination ? response : response.items;
        },
        enabled: isAuthenticatedQueryEnabled && (args.enabled ?? true),
    });
}
