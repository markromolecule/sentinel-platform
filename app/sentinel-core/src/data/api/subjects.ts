import { type SubjectFormValues } from '@sentinel/shared/schema';
import { type MasterSubject } from '@sentinel/shared/types';
import { apiClient } from './client';

interface ApiSubject {
    subject_id: string;
    subject_code: string;
    subject_title: string;
    department_ids: string[];
    course_ids: string[];
    section_ids: string[];
    year_levels: number[];
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
}

interface ApiResponse<T> {
    message: string;
    data: T;
}

function mapSubject(apiSubject: ApiSubject): MasterSubject {
    return {
        id: apiSubject.subject_id,
        code: apiSubject.subject_code,
        title: apiSubject.subject_title,
        departmentIds: apiSubject.department_ids ?? [],
        courseIds: apiSubject.course_ids ?? [],
        sectionIds: apiSubject.section_ids ?? [],
        yearLevels: apiSubject.year_levels ?? [],
        createdAt: apiSubject.created_at,
        createdBy: apiSubject.created_by,
        updatedAt: apiSubject.updated_at,
        updatedBy: apiSubject.updated_by,
    };
}

export async function getSubjects(search?: string): Promise<MasterSubject[]> {
    const url = search ? `/subjects?search=${encodeURIComponent(search)}` : '/subjects';
    const response: ApiResponse<ApiSubject[]> = await apiClient(url);
    return response.data.map(mapSubject);
}

export async function createSubject(payload: SubjectFormValues): Promise<MasterSubject> {
    const response: ApiResponse<ApiSubject> = await apiClient('/subjects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return mapSubject(response.data);
}

export async function updateSubject({
    id,
    payload,
}: {
    id: string;
    payload: Partial<SubjectFormValues>;
}): Promise<MasterSubject> {
    const response: ApiResponse<ApiSubject> = await apiClient(`/subjects/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return mapSubject(response.data);
}

export async function deleteSubject(id: string): Promise<void> {
    await apiClient(`/subjects/${id}`, {
        method: 'DELETE',
    });
}
