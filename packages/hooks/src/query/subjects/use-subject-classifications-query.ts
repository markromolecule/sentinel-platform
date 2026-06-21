import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { getSubjectClassifications, type PaginatedApiResponse } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_CLASSIFICATION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';
import type { SubjectClassification } from '@sentinel/shared/types';

export function useSubjectClassificationsQuery(
    search?: string,
    institutionId?: string,
): UseQueryResult<SubjectClassification[], Error>;
export function useSubjectClassificationsQuery(
    search: string | undefined,
    institutionId: string | undefined,
    page: number,
    limit: number,
): UseQueryResult<PaginatedApiResponse<SubjectClassification>, Error>;
export function useSubjectClassificationsQuery(
    search?: string,
    institutionId?: string,
    page?: number,
    limit?: number,
) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const hasPagination = page !== undefined && limit !== undefined;
    const activeInstitutionId = institutionId;

    return useQuery({
        queryKey: [
            ...SUBJECT_CLASSIFICATION_QUERY_KEYS.all,
            search ?? '',
            activeInstitutionId ?? '',
            page ?? '',
            limit ?? '',
        ],
        queryFn: async () => {
            const response = await getSubjectClassifications(
                apiClient,
                search,
                activeInstitutionId,
                page,
                limit,
            );
            return hasPagination ? response : response.items;
        },
        enabled: isAuthenticatedQueryEnabled,
    });
}
