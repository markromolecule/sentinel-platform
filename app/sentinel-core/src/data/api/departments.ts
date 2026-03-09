import { Department, DepartmentInput } from '@sentinel/shared/types';
import { apiClient } from './client';

// Backend returns snake_case format
interface ApiDepartment {
    department_id: string;
    department_name: string;
    department_code: string | null;
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
        name: apiDept.department_name,
        code: apiDept.department_code,
        createdAt: apiDept.created_at,
        createdBy: apiDept.created_by,
        updatedAt: apiDept.updated_at,
        updatedBy: apiDept.updated_by,
    };
}

// get all departments
export async function getDepartments(): Promise<Department[]> {
    const response: ApiResponse<ApiDepartment[]> = await apiClient('/departments');
    return response.data.map(mapDepartment);
}

// create a department
export async function createDepartment(payload: DepartmentInput): Promise<Department> {
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
export async function updateDepartment({
    id,
    payload,
}: {
    id: string;
    payload: DepartmentInput;
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
export async function deleteDepartment(id: string): Promise<void> {
    await apiClient(`/departments/${id}`, {
        method: 'DELETE',
    });
}
