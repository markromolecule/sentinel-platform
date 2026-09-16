import type {
    GenerateQuestionPreviewConfig,
    GenerateQuestionPreviewResponse,
} from '@sentinel/shared';
import type {
    AiGenerationJobRecord,
    AiGenerationJobStatus,
    AiGenerationStorageObject,
    AiGenerationJobDbRow,
} from './ai-generation-job.types';

export function parseJsonField<T>(value: unknown): T {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as T;
        }
    }

    return value as T;
}

export function mapAiGenerationJobRecord(
    row:
        | AiGenerationJobDbRow
        | {
              id: string;
              user_id: string;
              institution_id?: string | null;
              status: string;
              progress: number | string;
              current_step?: string | null;
              config: unknown;
              result?: unknown | null;
              error?: string | null;
              storage_bucket?: string | null;
              storage_paths?: unknown | null;
              expires_at: Date | string;
              created_at: Date | string;
              updated_at: Date | string;
          },
): AiGenerationJobRecord {
    return {
        id: row.id,
        user_id: row.user_id,
        institution_id: row.institution_id ?? null,
        status: row.status as AiGenerationJobStatus,
        progress: Number(row.progress),
        current_step: row.current_step ?? null,
        config: parseJsonField<GenerateQuestionPreviewConfig>(row.config),
        result: row.result
            ? parseJsonField<GenerateQuestionPreviewResponse>(row.result)
            : null,
        error: row.error ?? null,
        storage_bucket: row.storage_bucket ?? null,
        storage_paths: row.storage_paths
            ? parseJsonField<AiGenerationStorageObject[]>(row.storage_paths)
            : null,
        expires_at: row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at),
        created_at: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
        updated_at: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
    };
}
