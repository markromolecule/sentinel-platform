import type { ApiClientType } from '../api-client';
import type { OnboardingFormValues, Institution, Department, Course } from '@sentinel/shared/types';

// Backend returns snake_case format
interface ApiDepartment {
    department_id: string;
    department_name: string;
    department_code: string | null;
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
    source_record_id?: string | null;
    inheritance_status?: string;
    origin_institution_id?: string | null;
    effective_institution_id?: string | null;
    is_local?: boolean;
    is_inherited?: boolean;
    is_overridden?: boolean;
    is_hidden?: boolean;
}

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

function mapInstitution(apiInst: ApiInstitution): Institution {
    return {
        id: apiInst.institution_id,
        name: apiInst.institution_name,
        code: apiInst.institution_code,
        createdAt: apiInst.created_at,
        createdBy: '', // placeholder as backend doesn't return it for onboarding
    } as Institution;
}

function mapCourse(apiCourse: ApiCourse): Course {
    return {
        id: apiCourse.course_id,
        code: apiCourse.code,
        title: apiCourse.title,
        departmentId: apiCourse.department_id,
        institutionId: apiCourse.institution_id,
        createdAt: apiCourse.created_at,
        sourceRecordId: apiCourse.source_record_id ?? null,
        inheritanceStatus: apiCourse.inheritance_status,
        originInstitutionId: apiCourse.origin_institution_id ?? null,
        effectiveInstitutionId: apiCourse.effective_institution_id ?? null,
        isLocal: apiCourse.is_local,
        isInherited: apiCourse.is_inherited,
        isOverridden: apiCourse.is_overridden,
        isHidden: apiCourse.is_hidden,
    } as Course;
}

export async function submitOnboarding(apiClient: ApiClientType, values: OnboardingFormValues) {
    return apiClient('/onboarding', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
    });
}

export async function getOnboardingInstitutions(apiClient: ApiClientType): Promise<Institution[]> {
    const response: ApiResponse<ApiInstitution[]> = await apiClient('/onboarding/institutions');
    return response.data.map(mapInstitution);
}

export async function getOnboardingDepartments(
    apiClient: ApiClientType,
    institutionId?: string,
): Promise<Department[]> {
    const params = institutionId ? `?institutionId=${institutionId}` : '';
    const response: ApiResponse<ApiDepartment[]> = await apiClient(
        `/onboarding/departments${params}`,
    );
    return response.data.map(mapDepartment);
}

export async function getOnboardingCourses(
    apiClient: ApiClientType,
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
