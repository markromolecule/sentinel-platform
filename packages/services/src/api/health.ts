import type { ApiClientType } from '../api-client';

export async function getApiHealth(apiClient: ApiClientType): Promise<{ status: string }> {
    return apiClient('/health');
}
