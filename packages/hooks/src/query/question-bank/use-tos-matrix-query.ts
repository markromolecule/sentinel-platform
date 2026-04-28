import { useQuery } from '@tanstack/react-query';
import { getTosMatrix, type GetTosMatrixParams } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export const TOS_MATRIX_QUERY_KEYS = {
    all: ['question-bank', 'tos-matrix'] as const,
    filtered: (params?: GetTosMatrixParams) =>
        ['question-bank', 'tos-matrix', params ?? {}] as const,
};

export type UseTosMatrixQueryArgs = GetTosMatrixParams;

export function useTosMatrixQuery(args?: UseTosMatrixQueryArgs) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: TOS_MATRIX_QUERY_KEYS.filtered(args),
        queryFn: () => getTosMatrix(apiClient, args),
        enabled: isAuthenticatedQueryEnabled,
    });
}
