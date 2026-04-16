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
        description: apiCourse.description || undefined,
        createdAt: apiCourse.created_at || new Date().toISOString(),
        createdBy: apiCourse.created_by ?? '',
        updatedAt: apiCourse.updated_at || new Date().toISOString(),
        updatedBy: apiCourse.updated_by || '',
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
export async function deleteCourse(apiClient: ApiClientType, id: string): Promise<void> {
    await apiClient(`/courses/${id}`, {
        method: 'DELETE',
    });
}
