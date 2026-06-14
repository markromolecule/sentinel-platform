import type { ApiClientType } from '../../api-client';
import type { ApiExamResponse } from './types';

export type ApiExamAssignmentRelationship = 'INBOUND' | 'OUTBOUND';
export type ApiExamAssignmentStatus =
    | 'PENDING'
    | 'ACCEPTED'
    | 'DECLINED'
    | 'ACTIVE'
    | 'COMPLETED'
    | 'SCHEDULED';

export type ApiExamAssignment = {
    id: string;
    relationship: ApiExamAssignmentRelationship;
    exam: {
        id: string;
        title: string;
        subjectTitle: string | null;
        scheduledDate: string | null;
        endDateTime: string | null;
        roomName?: string | null;
        sectionNames?: string[];
    };
    assigner: {
        id: string;
        name: string;
        avatarUrl?: string | null;
    };
    assignee: {
        id: string;
        name: string;
        avatarUrl?: string | null;
    };
    status: ApiExamAssignmentStatus;
    scheduledAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export async function listExamAssignments(apiClient: ApiClientType) {
    const response: ApiExamResponse<ApiExamAssignment[]> = await apiClient('/examination/assign');
    return response.data;
}

export async function assignExam(
    apiClient: ApiClientType,
    payload: { examId: string; assigneeId: string },
) {
    const response: ApiExamResponse<ApiExamAssignment> = await apiClient('/examination/assign', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return response.data;
}

export async function acceptExamAssignment(apiClient: ApiClientType, assignmentId: string) {
    const response: ApiExamResponse<ApiExamAssignment> = await apiClient(
        `/examination/assign/${assignmentId}/accept`,
        {
            method: 'POST',
        },
    );

    return response.data;
}

export async function rejectExamAssignment(apiClient: ApiClientType, assignmentId: string) {
    const response: ApiExamResponse<ApiExamAssignment> = await apiClient(
        `/examination/assign/${assignmentId}/reject`,
        {
            method: 'POST',
        },
    );

    return response.data;
}
