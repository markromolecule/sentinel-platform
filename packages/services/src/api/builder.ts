import type { ProctorExam } from '@sentinel/shared/types';
import type { UpdateExamPayload } from './exams';
import { mapExam } from './exams';
import type { ApiClientType } from '../api-client';
import type { QuestionTypeDefinition } from './question-types';

interface ApiResponse<T> {
    message: string;
    data: T;
}

interface ApiBuilderWorkspace {
    exam: Parameters<typeof mapExam>[0];
    questionTypes: QuestionTypeDefinition[];
}

export interface BuilderWorkspace {
    exam: ProctorExam;
    questionTypes: QuestionTypeDefinition[];
}

export type SaveBuilderWorkspacePayload = UpdateExamPayload;

function mapBuilderWorkspace(workspace: ApiBuilderWorkspace): BuilderWorkspace {
    return {
        exam: mapExam(workspace.exam),
        questionTypes: workspace.questionTypes,
    };
}

export async function getBuilderWorkspace(
    apiClient: ApiClientType,
    examId: string,
): Promise<BuilderWorkspace> {
    const response: ApiResponse<ApiBuilderWorkspace> = await apiClient(`/builder/exams/${examId}`);
    return mapBuilderWorkspace(response.data);
}

export async function saveBuilderWorkspace(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: SaveBuilderWorkspacePayload;
    },
): Promise<BuilderWorkspace> {
    const response: ApiResponse<ApiBuilderWorkspace> = await apiClient(`/builder/exams/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return mapBuilderWorkspace(response.data);
}

export async function publishBuilderWorkspace(
    apiClient: ApiClientType,
    examId: string,
): Promise<BuilderWorkspace> {
    const response: ApiResponse<ApiBuilderWorkspace> = await apiClient(
        `/builder/exams/${examId}/publish`,
        {
            method: 'POST',
        },
    );

    return mapBuilderWorkspace(response.data);
}
