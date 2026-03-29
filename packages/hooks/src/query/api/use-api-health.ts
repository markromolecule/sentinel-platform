import { useQuery } from '@tanstack/react-query';
import { getApiHealth } from '@sentinel/services';
import { useApi } from '../../api-provider';

export function useApiHealth() {
    const apiClient = useApi();
    return useQuery({
        queryKey: ['api-health'],
        queryFn: () => getApiHealth(apiClient),
    });
}
