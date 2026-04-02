import { useQuery } from '@tanstack/react-query';
import { getSubjectOfferings } from '@sentinel/services';
import { SUBJECT_OFFERING_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

type UseSubjectOfferingsQueryArgs = {
    search?: string;
    subjectId?: string;
    termId?: string;
    enabled?: boolean;
};

export function useSubjectOfferingsQuery(args: UseSubjectOfferingsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [
            ...SUBJECT_OFFERING_QUERY_KEYS.all,
            args.search ?? '',
            args.subjectId ?? '',
            args.termId ?? '',
        ],
        queryFn: () => getSubjectOfferings(apiClient, args),
        enabled: isAuthenticatedQueryEnabled && (args.enabled ?? true),
    });
}
