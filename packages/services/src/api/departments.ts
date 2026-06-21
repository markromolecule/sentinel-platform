import { Department, DepartmentInput } from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';
import type { PaginatedApiResponse } from './pagination';

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
    source_record_id?: string | null;
    inheritance_status?: string;
    origin_institution_id?: string | null;
    effective_institution_id?: string | null;
    is_local?: boolean;
    is_inherited?: boolean;
    is_overridden?: boolean;
    is_hidden?: boolean;
}

// api response interface
interface ApiResponse<T> {
    message: string;
    data: T;
    pagination?: PaginatedApiResponse<unknown>['pagination'];
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
        sourceRecordId: apiDept.source_record_id ?? null,
        inheritanceStatus: apiDept.inheritance_status,
        originInstitutionId: apiDept.origin_institution_id ?? null,
        effectiveInstitutionId: apiDept.effective_institution_id ?? null,
        isLocal: apiDept.is_local,
        isInherited: apiDept.is_inherited,
        isOverridden: apiDept.is_overridden,
        isHidden: apiDept.is_hidden,
    };
}

// get all departments
export async function getDepartments(
    apiClient: ApiClientType,
    params?: {
        search?: string;
        institutionId?: string;
        page?: number;
        limit?: number;
    },
): Promise<Department[]>;
export async function getDepartments(
    apiClient: ApiClientType,
    params: {
        search?: string;
        institutionId?: string;
        page?: number;
        limit?: number;
    } & ({ page: number; limit: number } | { page?: undefined; limit?: undefined }),
): Promise<PaginatedApiResponse<Department>>;
export async function getDepartments(
    apiClient: ApiClientType,
    params: {
        search?: string;
        institutionId?: string;
        page?: number;
        limit?: number;
    } = {},
): Promise<Department[] | PaginatedApiResponse<Department>> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.institutionId) queryParams.append('institutionId', params.institutionId);
    if (params.page !== undefined) queryParams.append('page', String(params.page));
    if (params.limit !== undefined) queryParams.append('limit', String(params.limit));

    const queryString = queryParams.toString();
    const url = queryString ? `/departments?${queryString}` : '/departments';

    const response: ApiResponse<ApiDepartment[]> = await apiClient(url);
    const items = response.data.map(mapDepartment);
    return response.pagination ? { items, pagination: response.pagination } : items;
}

// create a department
export async function createDepartment(
    apiClient: ApiClientType,
    payload: DepartmentInput,
): Promise<Department> {
    const response: ApiResponse<ApiDepartment> = await apiClient('/departments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapDepartment(response.data);
}

// create multiple departments
export async function createBulkDepartments(
    apiClient: ApiClientType,
    payload: { departments: DepartmentInput[] },
): Promise<Department[]> {
    const response: ApiResponse<ApiDepartment[]> = await apiClient('/departments/bulk', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return response.data.map(mapDepartment);
}

// update a department
export async function updateDepartment(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: Partial<DepartmentInput>;
    },
): Promise<Department> {
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

// delete multiple departments
export async function deleteDepartments(apiClient: ApiClientType, ids: string[]): Promise<void> {
    await apiClient('/departments/bulk-delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
    });
}
