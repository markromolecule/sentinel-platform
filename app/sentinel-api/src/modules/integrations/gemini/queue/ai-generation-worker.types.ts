import type { DbClient } from '@sentinel/db';
import type { GenerateQuestionPreviewConfig } from '@sentinel/shared';
import type { AiGenerationStorageObject } from '../data/ai-generation-job.repository';

export type AiGenerationJobData = {
    jobId: string;
    userId: string;
    institutionId?: string | null;
    config: GenerateQuestionPreviewConfig;
    storageBucket?: string | null;
    storagePaths?: AiGenerationStorageObject[] | null;
};

export type ProcessJobContext = {
    attempt?: number;
    maxAttempts?: number;
    discard?: () => Promise<void> | void;
    db?: DbClient;
};

export type CleanExpiredJobsResult = {
    checkedCount: number;
    cleanedCount: number;
    failedCount: number;
};

export type MaintenanceCycleResult = {
    reconciledCount: number;
    cleanup: CleanExpiredJobsResult;
};
