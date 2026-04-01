import { Department, DepartmentInput } from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

// Backend returns snake_case format
interface ApiDepartment {
    department_id: string;
    department_name: string;
    department_code: string | null;
    institution_id: string | null;
    institution_name: string | null;
    created_at: string | null;
    created_by: string | null;
    updated_at: string | null;
    updated_by: string | null;
}

// api response interface
interface ApiResponse<T> {
    message: string;
    data: T;
}

// map the api response to the department type
function mapDepartment(apiDept: ApiDepartment): Department {
    return {
        id: apiDept.department_id,
        name: apiDept.department_name?.trim(),
        code: apiDept.department_code,
        institution: apiDept.institution_name,
        institutionId: apiDept.institution_id,
        createdAt: apiDept.created_at || new Date().toISOString(),
        createdBy: apiDept.created_by ?? '',
        updatedAt: apiDept.updated_at || new Date().toISOString(),
        updatedBy: apiDept.updated_by || '',
    };
}

// get all departments
export async function getDepartments(apiClient: ApiClientType, search?: string, institutionId?: string): Promise<Department[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (institutionId) params.append('institutionId', institutionId);
    
    const queryString = params.toString();
    const url = queryString ? `/departments?${queryString}` : '/departments';
    
    const response: ApiResponse<ApiDepartment[]> = await apiClient(url);
    return response.data.map(mapDepartment);
}

// create a department
export async function createDepartment(apiClient: ApiClientType, payload: DepartmentInput): Promise<Department> {
    const response: ApiResponse<ApiDepartment> = await apiClient('/departments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapDepartment(response.data);
}

// update a department
export async function updateDepartment(apiClient: ApiClientType, {
    id,
    payload,
}: {
    id: string;
    payload: Partial<DepartmentInput>;
}): Promise<Department> {
    const response: ApiResponse<ApiDepartment> = await apiClient(`/departments/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapDepartment(response.data);
}

// delete a department
export async function deleteDepartment(apiClient: ApiClientType, id: string): Promise<void> {
    await apiClient(`/departments/${id}`, {
        method: 'DELETE',
    });
}
