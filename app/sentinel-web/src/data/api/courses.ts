import { Course, CourseInput } from '@sentinel/shared/types';
import { apiClient } from './client';

// Backend returns snake_case format
interface ApiCourse {
    course_id: string;
    title: string;
    code: string | null;
    department_id: string; // Add if returning department_id directly
    description: string | null;
    created_at: string | null;
    created_by: string | null;
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
        department: apiCourse.department_id,
        description: apiCourse.description || undefined,
        createdAt: apiCourse.created_at || new Date().toISOString(),
        createdBy: apiCourse.created_by || 'system',
    };
}

// get all courses
export async function getCourses(): Promise<Course[]> {
    const response: ApiResponse<ApiCourse[]> = await apiClient('/courses');
    return response.data.map(mapCourse);
}

// create a course
export async function createCourse(payload: CourseInput): Promise<Course> {
    const response: ApiResponse<ApiCourse> = await apiClient('/courses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapCourse(response.data);
}

// update a course
export async function updateCourse({
    id,
    payload,
}: {
    id: string;
    payload: CourseInput;
}): Promise<Course> {
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
export async function deleteCourse(id: string): Promise<void> {
    await apiClient(`/courses/${id}`, {
        method: 'DELETE',
    });
}
