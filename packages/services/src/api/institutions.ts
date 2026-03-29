import { Institution, InstitutionInput } from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

// Backend returns camelCase format
interface ApiInstitution {
    id: string;
    name: string;
    code: string | null;
    createdAt: string | null;
    createdBy: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
}

// api response interface
interface ApiResponse<T> {
    message: string;
    data: T;
}

// map the api response to the institution type
function mapInstitution(apiInst: ApiInstitution): Institution {
    return {
        id: apiInst.id,
        name: apiInst.name,
        code: apiInst.code,
        createdAt: apiInst.createdAt || new Date().toISOString(),
        createdBy: apiInst.createdBy || 'System',
        updatedAt: apiInst.updatedAt,
        updatedBy: apiInst.updatedBy,
    };
}

// get all institutions
export async function getInstitutions(apiClient: ApiClientType, search?: string): Promise<Institution[]> {
    const url = search ? `/institutions?search=${encodeURIComponent(search)}` : '/institutions';
    const response: ApiResponse<ApiInstitution[]> = await apiClient(url);
    return response.data.map(mapInstitution);
}

// create an institution
export async function createInstitution(apiClient: ApiClientType, payload: InstitutionInput): Promise<Institution> {
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
export async function updateInstitution(apiClient: ApiClientType, {
    id,
    payload,
}: {
    id: string;
    payload: InstitutionInput;
}): Promise<Institution> {
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
