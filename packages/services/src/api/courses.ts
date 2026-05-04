import { Course, CourseInput } from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';
import { CourseFormValues } from '@sentinel/shared/schema';

// Backend returns snake_case format
interface ApiCourse {
    course_id: string;
    title: string;
    code: string | null;
    department_id: string | null;
    department_name: string | null;
    department_code: string | null;
    description: string | null;
    created_at: string | null;
    created_by: string | null;
    updated_at: string | null;
    updated_by: string | null;
    institution_id?: string | null;
    source_record_id?: string | null;
    inheritance_status?: string;
    origin_institution_id?: string | null;
    effective_institution_id?: string | null;
    is_local?: boolean;
    is_inherited?: boolean;
    is_overridden?: boolean;
    is_hidden?: boolean;
    institution_name?: string | null;
}

// api response interface
interface ApiResponse<T> {
    message: string;
    data: T;
}

// map the api response to the course type
function mapCourse(apiCourse: ApiCourse): Course {
    return {
        id: apiCourse.course_id,
        title: apiCourse.title,
        code: apiCourse.code || '',
        department: apiCourse.department_id ?? '',
        departmentId: apiCourse.department_id,
        departmentName: apiCourse.department_name,
        departmentCode: apiCourse.department_code,
        institutionId: apiCourse.institution_id,
        institutionName: apiCourse.institution_name,
        description: apiCourse.description || undefined,
        createdAt: apiCourse.created_at || new Date().toISOString(),
        createdBy: apiCourse.created_by ?? '',
        updatedAt: apiCourse.updated_at || new Date().toISOString(),
        updatedBy: apiCourse.updated_by || '',
        sourceRecordId: apiCourse.source_record_id ?? null,
        inheritanceStatus: apiCourse.inheritance_status,
        originInstitutionId: apiCourse.origin_institution_id ?? null,
        effectiveInstitutionId: apiCourse.effective_institution_id ?? null,
        isLocal: apiCourse.is_local,
        isInherited: apiCourse.is_inherited,
        isOverridden: apiCourse.is_overridden,
        isHidden: apiCourse.is_hidden,
    };
}

type CourseQueryParams = {
    search?: string;
    institutionId?: string;
};

// get all courses
export async function getCourses(
    apiClient: ApiClientType,
    search?: string,
    institutionId?: string,
): Promise<Course[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (institutionId) params.append('institutionId', institutionId);

    const queryString = params.toString();
    const url = queryString ? `/courses?${queryString}` : '/courses';

    const response: ApiResponse<ApiCourse[]> = await apiClient(url);
    return response.data.map(mapCourse);
}

// create a course
export async function createCourse(
    apiClient: ApiClientType,
    payload: CourseInput,
): Promise<Course> {
    const response: ApiResponse<ApiCourse> = await apiClient('/courses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            institution_id: payload.institution_id,
            code: payload.code,
            title: payload.title,
            department_id: payload.departmentId,
            description: payload.description,
        }),
    });
    return mapCourse(response.data);
}

// update a course
export async function updateCourse(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: Partial<CourseFormValues>;
    },
): Promise<Course> {
    const response: ApiResponse<ApiCourse> = await apiClient(`/courses/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapCourse(response.data);
}

// delete a course
export async function deleteCourse(
    apiClient: ApiClientType,
    id: string,
    institutionId?: string,
): Promise<void> {
    const url = institutionId
        ? `/courses/${id}?institutionId=${encodeURIComponent(institutionId)}`
        : `/courses/${id}`;

    await apiClient(url, {
        method: 'DELETE',
    });
}

// delete multiple courses
export async function deleteCourses(apiClient: ApiClientType, ids: string[]): Promise<void> {
    await apiClient('/courses/bulk-delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
    });
}
