import { useQuery } from '@tanstack/react-query';
import { getBuilderWorkspace } from '@sentinel/services';
import { BUILDER_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useBuilderWorkspaceQuery(examId?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: examId ? BUILDER_QUERY_KEYS.workspace(examId) : BUILDER_QUERY_KEYS.all,
        queryFn: () => getBuilderWorkspace(apiClient, examId as string),
        enabled: isAuthenticatedQueryEnabled && Boolean(examId),
    });
}
