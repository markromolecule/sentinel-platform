import type { ApiClientType } from '../api-client';

interface ApiResponse<T> {
    message: string;
    data: T;
}

export interface ExamSectionAssignmentRecord {
    id: string;
    examId: string;
    sectionId: string;
    classGroupId?: string | null;
    sectionName: string;
    roomId: string | null;
    roomName: string | null;
    instructorId: string | null;
    instructorName: string | null;
    scheduledAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface CreateExamSectionAssignmentPayload {
    sectionId: string;
    classGroupId?: string | null;
    roomId?: string | null;
    instructorId?: string | null;
    scheduledAt?: string | null;
}

export interface UpdateExamSectionAssignmentPayload {
    roomId?: string | null;
    instructorId?: string | null;
    scheduledAt?: string | null;
}

export interface CreateExamSectionAssignmentBatchItemPayload {
    sectionId: string;
    classGroupId: string;
    roomId: string;
    instructorId: string;
    scheduledAt?: string | null;
}

/**
 * Get all section assignments for an exam.
 *
 * @param apiClient - The API client instance.
 * @param examId - The UUID of the exam.
 * @returns Array of section assignments.
 */
export async function getExamSectionAssignments(
    apiClient: ApiClientType,
    examId: string,
): Promise<ExamSectionAssignmentRecord[]> {
    const response: ApiResponse<ExamSectionAssignmentRecord[]> = await apiClient(
        `/exams/${examId}/section-assignments`,
    );
    return response.data;
}

/**
 * Create a new exam section assignment.
 *
 * @param apiClient - The API client instance.
 * @param params - Contains examId and payload.
 * @returns The created section assignment.
 */
export async function createExamSectionAssignment(
    apiClient: ApiClientType,
    {
        examId,
        payload,
    }: {
        examId: string;
        payload: CreateExamSectionAssignmentPayload;
    },
): Promise<ExamSectionAssignmentRecord> {
    const response: ApiResponse<ExamSectionAssignmentRecord> = await apiClient(
        `/exams/${examId}/section-assignments`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );
    return response.data;
}

/**
 * Update an exam section assignment.
 *
 * @param apiClient - The API client instance.
 * @param params - Contains examId, assignment ID, and payload.
 * @returns The updated section assignment.
 */
export async function updateExamSectionAssignment(
    apiClient: ApiClientType,
    {
        examId,
        id,
        payload,
    }: {
        examId: string;
        id: string;
        payload: UpdateExamSectionAssignmentPayload;
    },
): Promise<ExamSectionAssignmentRecord> {
    const response: ApiResponse<ExamSectionAssignmentRecord> = await apiClient(
        `/exams/${examId}/section-assignments/${id}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );
    return response.data;
}

/**
 * Delete an exam section assignment.
 *
 * @param apiClient - The API client instance.
 * @param params - Contains examId and assignment ID.
 * @returns Object with the deleted assignment's ID.
 */
export async function deleteExamSectionAssignment(
    apiClient: ApiClientType,
    {
        examId,
        id,
    }: {
        examId: string;
        id: string;
    },
): Promise<{ id: string }> {
    const response: ApiResponse<{ id: string }> = await apiClient(
        `/exams/${examId}/section-assignments/${id}`,
        {
            method: 'DELETE',
        },
    );
    return response.data;
}

/**
 * Create batch exam section assignments.
 *
 * @param apiClient - The API client instance.
 * @param params - Contains examId and payload.
 * @returns Array of created section assignments.
 */
export async function createExamSectionAssignmentsBatch(
    apiClient: ApiClientType,
    {
        examId,
        payload,
    }: {
        examId: string;
        payload: { assignments: CreateExamSectionAssignmentBatchItemPayload[] };
    },
): Promise<ExamSectionAssignmentRecord[]> {
    const response: ApiResponse<ExamSectionAssignmentRecord[]> = await apiClient(
        `/exams/${examId}/section-assignments/batch`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );
    return response.data;
}
