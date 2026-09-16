import type { Selectable } from 'kysely';
import type { ai_generation_jobs } from '@sentinel/db';
import type {
    GenerateQuestionPreviewConfig,
    GenerateQuestionPreviewResponse,
} from '@sentinel/shared';

export type AiGenerationJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type AiGenerationStorageObject = {
    path: string;
    originalName: string;
    contentType: 'application/pdf';
    sizeBytes: number;
};

export type CreateAiGenerationJobParams = {
    id?: string;
    userId: string;
    institutionId?: string | null;
    config: GenerateQuestionPreviewConfig;
    storageBucket?: string | null;
    storagePaths?: AiGenerationStorageObject[] | null;
    ttlHours?: number;
};

export type AiGenerationJobRecord = {
    id: string;
    user_id: string;
    institution_id: string | null;
    status: AiGenerationJobStatus;
    progress: number;
    current_step: string | null;
    config: GenerateQuestionPreviewConfig;
    result: GenerateQuestionPreviewResponse | null;
    error: string | null;
    storage_bucket: string | null;
    storage_paths: AiGenerationStorageObject[] | null;
    expires_at: Date;
    created_at: Date;
    updated_at: Date;
};

export type AiGenerationJobDbRow = Selectable<ai_generation_jobs>;

export type UpdateAiGenerationProgressArgs = {
    id: string;
    progress: number;
    currentStep: string;
    status?: 'queued' | 'processing';
};

export type CompleteAiGenerationJobArgs = {
    id: string;
    result: GenerateQuestionPreviewResponse;
};

export type FailAiGenerationJobArgs = {
    id: string;
    error: string;
};

export type GetExpiredAiGenerationJobsArgs = {
    limit?: number;
};
