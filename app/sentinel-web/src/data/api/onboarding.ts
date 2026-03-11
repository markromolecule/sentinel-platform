import { Department } from '@sentinel/shared/types';
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

// get onboarding specific departments
export async function getOnboardingDepartments(): Promise<Department[]> {
    const response: ApiResponse<ApiDepartment[]> = await apiClient('/onboarding/departments');
    return response.data.map(mapDepartment);
}
