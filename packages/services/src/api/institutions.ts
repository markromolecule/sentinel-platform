import {
    Institution,
    InstitutionInput,
    InstitutionNamingConventions,
} from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';
import type { PaginatedApiResponse } from './pagination';

// Backend returns camelCase format
interface ApiInstitution {
    id: string;
    name: string;
    code: string | null;
    parentInstitutionId?: string | null;
    institutionKind?: 'STANDALONE' | 'PARENT' | 'CHILD';
    namingConventions?: InstitutionNamingConventions | null;
    createdAt: string | null;
    createdBy: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
}

// api response interface
interface ApiResponse<T> {
    message: string;
    data: T;
    pagination?: PaginatedApiResponse<unknown>['pagination'];
}

// map the api response to the institution type
function mapInstitution(apiInst: ApiInstitution): Institution {
    return {
        id: apiInst.id,
        name: apiInst.name,
        code: apiInst.code,
        parentInstitutionId: apiInst.parentInstitutionId ?? null,
        institutionKind: apiInst.institutionKind ?? 'STANDALONE',
        namingConventions: apiInst.namingConventions ?? null,
        createdAt: apiInst.createdAt || new Date().toISOString(),
        createdBy: apiInst.createdBy || 'System',
        updatedAt: apiInst.updatedAt,
        updatedBy: apiInst.updatedBy,
    };
}

export async function getEffectiveInstitutionNamingConventions(
    apiClient: ApiClientType,
    institutionId: string,
): Promise<InstitutionNamingConventions | null> {
    const response: ApiResponse<InstitutionNamingConventions | null> = await apiClient(
        `/institutions/${institutionId}/naming-conventions/effective`,
    );
    return response.data;
}

export async function saveInstitutionNamingConventions(
    apiClient: ApiClientType,
    {
        institutionId,
        payload,
    }: {
        institutionId: string;
        payload: InstitutionNamingConventions;
    },
): Promise<InstitutionNamingConventions> {
    const response: ApiResponse<InstitutionNamingConventions> = await apiClient(
        `/institutions/${institutionId}/naming-conventions`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );
    return response.data;
}

// get all institutions
export async function getInstitutions(
    apiClient: ApiClientType,
    params?: {
        search?: string;
        parentInstitutionId?: string;
        institutionKind?: 'STANDALONE' | 'PARENT' | 'CHILD';
        page?: number;
        limit?: number;
    },
): Promise<Institution[]>;
export async function getInstitutions(
    apiClient: ApiClientType,
    params: {
        search?: string;
        parentInstitutionId?: string;
        institutionKind?: 'STANDALONE' | 'PARENT' | 'CHILD';
        page?: number;
        limit?: number;
    } & ({ page: number; limit: number } | { page?: undefined; limit?: undefined }),
): Promise<PaginatedApiResponse<Institution>>;
export async function getInstitutions(
    apiClient: ApiClientType,
    params: {
        search?: string;
        parentInstitutionId?: string;
        institutionKind?: 'STANDALONE' | 'PARENT' | 'CHILD';
        page?: number;
        limit?: number;
    } = {},
): Promise<Institution[] | PaginatedApiResponse<Institution>> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.parentInstitutionId) {
        queryParams.append('parentInstitutionId', params.parentInstitutionId);
    }
    if (params.institutionKind) queryParams.append('institutionKind', params.institutionKind);
    if (params.page !== undefined) queryParams.append('page', String(params.page));
    if (params.limit !== undefined) queryParams.append('limit', String(params.limit));
    const queryString = queryParams.toString();
    const url = queryString ? `/institutions?${queryString}` : '/institutions';
    const response: ApiResponse<ApiInstitution[]> = await apiClient(url);
    const items = response.data.map(mapInstitution);
    return response.pagination ? { items, pagination: response.pagination } : items;
}

// create an institution
export async function createInstitution(
    apiClient: ApiClientType,
    payload: InstitutionInput,
): Promise<Institution> {
    const response: ApiResponse<ApiInstitution> = await apiClient('/institutions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapInstitution(response.data);
}

// update an institution
export async function updateInstitution(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: InstitutionInput;
    },
): Promise<Institution> {
    const response: ApiResponse<ApiInstitution> = await apiClient(`/institutions/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapInstitution(response.data);
}

// delete an institution
export async function deleteInstitution(apiClient: ApiClientType, id: string): Promise<void> {
    await apiClient(`/institutions/${id}`, {
        method: 'DELETE',
    });
}

// delete multiple institutions
export async function deleteInstitutions(apiClient: ApiClientType, ids: string[]): Promise<void> {
    await apiClient('/institutions/bulk-delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
    });
}
