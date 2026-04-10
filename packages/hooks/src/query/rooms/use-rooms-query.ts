import { useQuery } from '@tanstack/react-query';
import { getRooms } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { ROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useRoomsQuery(search?: string, institutionId?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...ROOM_QUERY_KEYS.all, search, institutionId],
        queryFn: () => getRooms(apiClient, search, institutionId),
        enabled: isAuthenticatedQueryEnabled,
    });
}
