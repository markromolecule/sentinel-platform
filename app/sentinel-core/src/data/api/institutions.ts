import { Institution, InstitutionInput } from '@sentinel/shared/types';
import { apiClient } from './client';
import { MOCK_INSTITUTIONS } from '@sentinel/shared/mock-data';

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

// get all institutions with fallback to mock data
export async function getInstitutions(): Promise<Institution[]> {
    try {
        const response: ApiResponse<ApiInstitution[]> = await apiClient('/institutions');
        return response.data.map(mapInstitution);
    } catch (error) {
        console.warn('Failed to fetch institutions from API. Falling back to mock data.', error);
        return MOCK_INSTITUTIONS as Institution[];
    }
}

// create an institution
export async function createInstitution(payload: InstitutionInput): Promise<Institution> {
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
export async function updateInstitution({
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
export async function deleteInstitution(id: string): Promise<void> {
    await apiClient(`/institutions/${id}`, {
        method: 'DELETE',
    });
}
