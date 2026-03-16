import { Department, DepartmentInput } from '@sentinel/shared/types';
import { ApiResponse, ApiDepartment } from '../types';
import { ApiClientOptions } from '../api-client';

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

export const createDepartmentService = (apiClient: (endpoint: string, options?: ApiClientOptions) => Promise<any>) => {
    return {
        getDepartments: async (): Promise<Department[]> => {
            const response: ApiResponse<ApiDepartment[]> = await apiClient('/departments');
            return response.data.map(mapDepartment);
        },
        createDepartment: async (payload: DepartmentInput): Promise<Department> => {
            const response: ApiResponse<ApiDepartment> = await apiClient('/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            return mapDepartment(response.data);
        },
        updateDepartment: async ({
            id,
            payload,
        }: {
            id: string;
            payload: DepartmentInput;
        }): Promise<Department> => {
            const response: ApiResponse<ApiDepartment> = await apiClient(`/departments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            return mapDepartment(response.data);
        },
        deleteDepartment: async (id: string): Promise<void> => {
            await apiClient(`/departments/${id}`, {
                method: 'DELETE',
            });
        }
    };
};
