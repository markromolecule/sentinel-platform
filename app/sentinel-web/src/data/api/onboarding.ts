import { Department } from '@sentinel/shared/types';
import { apiClient } from './client';

export interface Institution {
    id: string;
    name: string;
    code: string | null;
    createdAt?: string | null;
}

export interface Course {
    id: string;
    code: string;
    title: string;
    departmentId: string | null;
    institutionId: string | null;
    createdAt?: string | null;
}

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

interface ApiInstitution {
    institution_id: string;
    institution_name: string;
    institution_code: string | null;
    created_at: string | null;
}

interface ApiCourse {
    course_id: string;
    code: string;
    title: string;
    department_id: string | null;
    institution_id: string | null;
    created_at: string | null;
}

// api response interface
interface ApiResponse<T> {
    message: string;
    data: T;
}

// mappers
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

function mapInstitution(apiInst: ApiInstitution): Institution {
    return {
        id: apiInst.institution_id,
        name: apiInst.institution_name,
        code: apiInst.institution_code,
        createdAt: apiInst.created_at,
    };
}

function mapCourse(apiCourse: ApiCourse): Course {
    return {
        id: apiCourse.course_id,
        code: apiCourse.code,
        title: apiCourse.title,
        departmentId: apiCourse.department_id,
        institutionId: apiCourse.institution_id,
        createdAt: apiCourse.created_at,
    };
}

// API Calls
export async function getOnboardingInstitutions(): Promise<Institution[]> {
    const response: ApiResponse<ApiInstitution[]> = await apiClient('/onboarding/institutions');
    return response.data.map(mapInstitution);
}

export async function getOnboardingDepartments(institutionId?: string): Promise<Department[]> {
    const params = institutionId ? `?institutionId=${institutionId}` : '';
    const response: ApiResponse<ApiDepartment[]> = await apiClient(
        `/onboarding/departments${params}`,
    );
    return response.data.map(mapDepartment);
}

export async function getOnboardingCourses(
    departmentId?: string,
    institutionId?: string,
): Promise<Course[]> {
    const params = new URLSearchParams();
    if (departmentId) params.append('departmentId', departmentId);
    if (institutionId) params.append('institutionId', institutionId);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response: ApiResponse<ApiCourse[]> = await apiClient(`/onboarding/courses${query}`);

    return response.data.map(mapCourse);
}
