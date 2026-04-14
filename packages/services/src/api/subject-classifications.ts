import type { SubjectClassificationFormValues } from '@sentinel/shared/schema';
import type { SubjectClassification } from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

interface ApiSubjectClassification {
    id: string;
    name: string;
    type: 'GENERAL' | 'CORE';
    description: string | null;
    subject_count: number;
    subjects: Array<{
        id: string;
        code: string;
        title: string;
    }>;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    department_id: string | null;
    course_ids: string[];
}

interface ApiResponse<T> {
    message: string;
    data: T;
}

function mapSubjectClassification(
    apiSubjectClassification: ApiSubjectClassification,
): SubjectClassification {
    return {
        id: apiSubjectClassification.id,
        name: apiSubjectClassification.name,
        type: apiSubjectClassification.type,
        description: apiSubjectClassification.description,
        subjectCount: apiSubjectClassification.subject_count,
        subjects: apiSubjectClassification.subjects ?? [],
        createdAt: apiSubjectClassification.created_at,
        updatedAt: apiSubjectClassification.updated_at,
        createdBy: apiSubjectClassification.created_by,
        updatedBy: apiSubjectClassification.updated_by,
        department_id: apiSubjectClassification.department_id,
        course_ids: apiSubjectClassification.course_ids ?? [],
    };
}

export async function getSubjectClassifications(
    apiClient: ApiClientType,
    search?: string,
): Promise<SubjectClassification[]> {
    const url = search
        ? `/subjects/classifications?search=${encodeURIComponent(search)}`
        : '/subjects/classifications';
    const response: ApiResponse<ApiSubjectClassification[]> = await apiClient(url);
    return response.data.map(mapSubjectClassification);
}

export async function getSubjectClassification(
    apiClient: ApiClientType,
    id: string,
): Promise<SubjectClassification> {
    const response: ApiResponse<ApiSubjectClassification> = await apiClient(
        `/subjects/classifications/${id}`,
    );
    return mapSubjectClassification(response.data);
}

export async function createSubjectClassification(
    apiClient: ApiClientType,
    payload: SubjectClassificationFormValues,
): Promise<SubjectClassification> {
    const response: ApiResponse<ApiSubjectClassification> = await apiClient(
        '/subjects/classifications',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );

    return mapSubjectClassification(response.data);
}

export async function updateSubjectClassification(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: SubjectClassificationFormValues;
    },
): Promise<SubjectClassification> {
    const response: ApiResponse<ApiSubjectClassification> = await apiClient(
        `/subjects/classifications/${id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );

    return mapSubjectClassification(response.data);
}

export async function deleteSubjectClassification(
    apiClient: ApiClientType,
    id: string,
): Promise<void> {
    await apiClient(`/subjects/classifications/${id}`, {
        method: 'DELETE',
    });
}
